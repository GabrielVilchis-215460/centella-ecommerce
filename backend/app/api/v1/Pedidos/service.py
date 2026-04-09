from sqlalchemy.orm import Session, selectinload
from sqlalchemy import select
from fastapi import HTTPException
from app.models.pedido import Pedido
from app.models.enum import TipoEntregaItemEnum

def get_confirmacion_pedido(db: Session, id_pedido: int) -> dict:
    pedido = db.execute(
        select(Pedido)
        .options(
            selectinload(Pedido.items),
            selectinload(Pedido.direccion_envio),
            selectinload(Pedido.emprendedora),
        )
        .where(Pedido.id_pedido == id_pedido)
    ).scalar_one_or_none()

    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido no encontrado.")

    tiene_envio = any(
        item.tipo_entrega == TipoEntregaItemEnum.envio
        for item in pedido.items
    )
    tiene_fisica = any(
        item.tipo_entrega == TipoEntregaItemEnum.fisica
        for item in pedido.items
    )

    # Track URL desde envia.com — construida desde el numero de rastreo
    track_url = None
    if pedido.numero_rastreo:
        track_url = f"https://test.envia.com/rastreo?label={pedido.numero_rastreo}&cntry_code=mx"

    return {
        "id_pedido": pedido.id_pedido,
        "estado": pedido.estado,
        "metodo_pago": pedido.metodo_pago,
        "subtotal": pedido.subtotal,
        "costo_envio": pedido.costo_envio,
        "total": pedido.total,
        "items": pedido.items,

        # Envío
        "tiene_envio": tiene_envio,
        "numero_rastreo": pedido.numero_rastreo if tiene_envio else None,
        "track_url": track_url,
        "direccion_envio": pedido.direccion_envio if tiene_envio else None,

        # Física
        "tiene_fisica": tiene_fisica,
        "codigo_qr_url": pedido.codigo_qr_url if tiene_fisica else None,
        "redes_sociales": pedido.emprendedora.enlace_redes_sociales if tiene_fisica else None,
    }