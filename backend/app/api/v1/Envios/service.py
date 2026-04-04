from app.services.envia_service import envia_service
from app.api.v1.Envios.schemas import (
    CotizarRequest, GenerarEtiquetaRequest
)
from app.models.pedido import Pedido
from app.models.enum import EstadoPedidoEnum
from sqlalchemy import select
from sqlalchemy.orm import selectinload, session
#from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException
from app.core.database import get_db
from fastapi import Depends

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

async def service_asignar_envio(pedido_id: int, db: session = Depends(get_db)):
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
    pedido = result.scalars().first()

    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido no encontrado.")
    if not pedido.direccion_envio:
        raise HTTPException(status_code=400, detail="El pedido no tiene dirección de envío asignada.")
    if pedido.numero_rastreo:
        raise HTTPException(status_code=400, detail="El pedido ya tiene un número de rastreo asignado.")

    direccion = pedido.direccion_envio
    cliente = pedido.cliente

    # Construir destino desde los modelos
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

    db.commit()
    db.refresh(pedido)

    return {
        "pedido_id": pedido.id_pedido,
        "tracking_number": pedido.numero_rastreo,
        "track_url": resultado["track_url"],  
        "costo_envio": float(pedido.costo_envio),
    }
