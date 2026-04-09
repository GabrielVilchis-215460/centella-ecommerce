from app.services.envia_service import envia_service
from app.api.v1.Envios.schemas import (
    CotizarRequest, GenerarEtiquetaRequest
)
from app.models.pedido import Pedido
from app.models.item_pedido import ItemPedido
from app.models.enum import EstadoPedidoEnum, TipoEntregaItemEnum
from sqlalchemy import select
from sqlalchemy.orm import selectinload, Session
#from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException
#from app.core.database import get_db
#from fastapi import Depends
import qrcode, base64, os
from qrcode.constants import ERROR_CORRECT_H
from io import BytesIO
from PIL import Image
from app.services.email_service import enviar_correo_pedido

# Configuracion de la img del QR
LOGO_PATH = "./logo.png"
QR_BOX_SIZE = 10
QR_BORDER = 4

async def servicio_cotizar(body: CotizarRequest):
    """
    Funcion para obtener las tarifas disponibles para la ruta del cliente.
    """
    return await envia_service.cotizar_envio(
        destino=body.destino.model_dump(),
        paquete=body.paquete.model_dump(),
        carrier=body.carrier,
    )

async def servicio_generar_etiqueta(body: GenerarEtiquetaRequest):
    """
    Funcion que genera la etiqueta del pedido y retorna el numero de rastreo del pedido
    """
    return await envia_service.generar_etiqueta(
        destino=body.destino.model_dump(),
        paquete=body.paquete.model_dump(),
        carrier=body.carrier,
        service=body.service,
    )

async def rastrear_pedido(tracking_number: str):
    """
    Funcion que retorna el estado y los eventos de un envio por su numero de rastreo
    """
    return await envia_service.rastrear_envio(tracking_number)

async def cotizar_mas_barato(destino: dict, paquete: dict, carrier: str):
    """
    Funcion que devuelve la tarifa mas barata de envio automaticamente al momento de cotizar un envio.
    """
    tarifas = await envia_service.cotizar_envio(
        destino=destino,
        paquete=paquete,
        carrier=carrier,
    )
    return min(tarifas, key=lambda t: float(t["totalPrice"]))

async def service_asignar_envio(pedido_id: int, db: Session):
    """
    Funcion que genera la etiqueta a partir de un pedido existente en la BD y guarda el numero de rastreo y costo de envio
    """
    # busca pedido por su direccion y cliente
    query = (
        select(Pedido)
        .options(
            selectinload(Pedido.direccion_envio),
            selectinload(Pedido.cliente),
        )
        .where(Pedido.id_pedido == pedido_id)
    )
    result = db.execute(query)
    #pedido = result.scalars().first()
    pedido = result.scalar_one_or_none()

    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido no encontrado.")
    if not pedido.direccion_envio:
        raise HTTPException(status_code=400, detail="El pedido no tiene dirección de envío asignada.")
    if pedido.numero_rastreo:
        raise HTTPException(status_code=400, detail="El pedido ya tiene un número de rastreo asignado.")

    direccion = pedido.direccion_envio
    cliente = pedido.cliente

    # Construir destino
    destino = {
        "name": f"{cliente.nombre} {cliente.apellido}",
        "phone": direccion.numero_telefonico, 
        "street": direccion.calle,
        "number": direccion.numero_ext or "S/N",
        "city": direccion.ciudad,
        "state": direccion.estado,
        "country": "MX",
        "postalCode": direccion.codigo_postal,
    }

    paquete = {
        "content": "Productos varios",
        "weight": 1.0,       # idealmente sumarlo desde los items del pedido
        "length": 30.0,
        "width": 20.0,
        "height": 10.0,
        "declared_value": float(pedido.subtotal),
    }

    # Elige automáticamente el carrier más barato
    mejor_tarifa = await cotizar_mas_barato(
        destino=destino,
        paquete=paquete,
        carrier="fedex",   
    )

    # Genera la etiqueta con el service del más barato
    resultado = await envia_service.generar_etiqueta(
        destino=destino,
        paquete=paquete,
        carrier=mejor_tarifa["carrier"],
        service=mejor_tarifa["service"],
    )

    # Guardar solo numero_rastreo y costo_envio en BD
    pedido.numero_rastreo = resultado["tracking_number"]
    pedido.costo_envio = resultado["total_price"]
    pedido.estado = EstadoPedidoEnum.enviado # se cambia el estado para que la emprendedora interactue con el estado del pedido
    # Determinar tipos de entrega del pedido
    tiene_fisica = _tiene_entrega_fisica(pedido.id_pedido, db)
    tiene_envio = not tiene_fisica or any(
        item.tipo_entrega == TipoEntregaItemEnum.envio
        for item in pedido.items
    )

    qr_base64 = None
    if tiene_fisica:
        qr_base64 = _generar_qr_base64(pedido.id_pedido)

    db.commit()
    db.refresh(pedido)
    # Enviar correo según tipo de entrega
    await enviar_correo_pedido(
        email_destino=cliente.email,
        nombre_cliente=f"{cliente.nombre} {cliente.apellido}",
        pedido_id=pedido.id_pedido,
        tiene_envio=tiene_envio,
        tiene_fisica=tiene_fisica,
        tracking_number=pedido.numero_rastreo,
        label_url=resultado["label_pdf"],
        track_url=resultado["track_url"],
        qr_base64=qr_base64,
    )

    return {
        "pedido_id": pedido.id_pedido,
        "tracking_number": pedido.numero_rastreo,
        "track_url": resultado["track_url"],  
        "costo_envio": float(pedido.costo_envio),
        "carrier": mejor_tarifa["carrier"],
        "service_description": mejor_tarifa["serviceDescription"],
        "qr_base64": qr_base64,   # None si no hay entrega física
    }

def _generar_qr_base64(pedido_id: int):
    qr = qrcode.QRCode(
        version=None,
        error_correction=ERROR_CORRECT_H,  
        box_size=QR_BOX_SIZE,
        border=QR_BORDER,
    )
    qr.add_data(str(pedido_id))
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white").convert("RGB")

    # Incrustar logo si existe
    if os.path.exists(LOGO_PATH):
        logo = Image.open(LOGO_PATH).convert("RGBA")

        # Tamaño del logo: 25% del QR
        qr_width, qr_height = img.size
        logo_size = qr_width // 4
        logo = logo.resize((logo_size, logo_size), Image.LANCZOS)

        # Centrar logo en el QR
        pos_x = (qr_width - logo_size) // 2
        pos_y = (qr_height - logo_size) // 2
        img.paste(logo, (pos_x, pos_y), mask=logo)

    buf = BytesIO()
    img.save(buf, format="PNG")

    return base64.b64encode(buf.getvalue()).decode("utf-8")


def _tiene_entrega_fisica(pedido_id: int, db: Session):
    """
    Retorna True si al menos un item del pedido tiene tipo_entrega = fisica.
    """
    result = db.execute(
        select(ItemPedido).where(
            ItemPedido.id_pedido == pedido_id,
            ItemPedido.tipo_entrega == TipoEntregaItemEnum.fisica,
        )
    )
    return result.first() is not None