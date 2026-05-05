from sqlalchemy.orm import Session, selectinload, joinedload
from sqlalchemy import select
from fastapi import HTTPException
from app.models.pedido import Pedido
from app.models.enum import TipoEntregaItemEnum
from sqlalchemy.orm import Session
from typing import Optional, List
from datetime import datetime

from app.models import Pedido, Usuario, ItemPedido
from.schemas import PedidoCreate, PedidoUpdate
from app.models.enum import EstadoPedidoEnum, TipoUsuarioEnum

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

def create_pedido(db: Session, data: PedidoCreate, user: Usuario) -> Pedido:
    ##
    # después — temporal para pruebas
    if user.tipo_usuario == TipoUsuarioEnum.administrador:
        raise Exception("Solo clientes y emprendedoras pueden crear pedidos")
        
    # Determina el id_emprendedora según el rol
    if user.tipo_usuario == TipoUsuarioEnum.cliente:
        id_emprendedora = data.id_emprendedora
    ##
    total = data.subtotal + data.costo_envio

    pedido = Pedido(
        id_cliente=user.id_usuario,
        id_emprendedora=data.id_emprendedora,
        fecha_pedido=datetime.utcnow(),
        estado=EstadoPedidoEnum.pendiente,
        subtotal=data.subtotal,
        costo_envio=data.costo_envio,
        total=total,
        metodo_pago=data.metodo_pago,
        id_direccion_envio=data.id_direccion_envio,
    )

    db.add(pedido)
    db.commit()
    db.refresh(pedido)
    return pedido


def get_pedidos(
    db: Session,
    user: Usuario,
    skip: int = 0,
    limit: int = 20,
    estado: Optional[EstadoPedidoEnum] = None,
    ordenar_por: Optional[str] = None,
) -> List[dict]:

    query = select(Pedido).options(selectinload(Pedido.items))

    if user.tipo_usuario == TipoUsuarioEnum.cliente:
        query = query.where(Pedido.id_cliente == user.id_usuario)
    elif user.tipo_usuario == TipoUsuarioEnum.emprendedora:
        if not user.emprendedora:
            raise Exception("Usuario sin perfil de emprendedora")
        query = query.where(Pedido.id_emprendedora == user.emprendedora.id_emprendedora)
    else:
        raise Exception("Tipo de usuario no soportado")

    if estado:
        query = query.where(Pedido.estado == estado)

    if ordenar_por == "recientes":
        query = query.order_by(Pedido.fecha_pedido.desc())
    elif ordenar_por == "total_asc":
        query = query.order_by(Pedido.total.asc())
    elif ordenar_por == "total_desc":
        query = query.order_by(Pedido.total.desc())

    pedidos = db.execute(query.offset(skip).limit(limit)).scalars().all()

    result = []
    for pedido in pedidos:
        tipos = {item.tipo_entrega for item in pedido.items}
        if len(tipos) > 1:
            tipo_entrega = "mixto"
        elif tipos:
            tipo_entrega = tipos.pop().value
        else:
            tipo_entrega = None

        result.append({
            "id_pedido": pedido.id_pedido,
            "numero_rastreo": pedido.numero_rastreo,
            "tipo_entrega": tipo_entrega,
            "estado": pedido.estado,
            "fecha_pedido": pedido.fecha_pedido,
            "total": float(pedido.total),
        })

    return result

def get_pedido_by_id(
    db: Session,
    pedido_id: int,
    user: Usuario,
) -> Optional[dict]:

    pedido = db.query(Pedido).options(
        joinedload(Pedido.items).joinedload(ItemPedido.producto),
        joinedload(Pedido.cliente),
        joinedload(Pedido.emprendedora),
        joinedload(Pedido.direccion_envio),
    ).filter(Pedido.id_pedido == pedido_id).first()

    if not pedido:
        return None

    if user.tipo_usuario == TipoUsuarioEnum.cliente:
        if pedido.id_cliente != user.id_usuario:
            return None

    elif user.tipo_usuario == TipoUsuarioEnum.emprendedora:
        if not user.emprendedora:
            return None
        if pedido.id_emprendedora != user.emprendedora.id_emprendedora:
            return None

    else:
        return None
    
    tipos = {item.tipo_entrega for item in pedido.items}
    if len(tipos) > 1:
        tipo_entrega = "mixto"
    elif tipos:
        tipo_entrega = tipos.pop().value
    else:
        tipo_entrega = None

    return {
        "id_pedido": pedido.id_pedido,
        "fecha": pedido.fecha_pedido,
        "estado": pedido.estado,
        "total": float(pedido.total),
        "metodo_pago": pedido.metodo_pago.value if pedido.metodo_pago else None,
        "tipo_entrega": tipo_entrega,
        "cliente": {
            "id": pedido.cliente.id_usuario,
            "nombre": f"{pedido.cliente.nombre} {pedido.cliente.apellido}",
            "email": pedido.cliente.email,
        },

        "emprendedora": {
            "id": pedido.emprendedora.id_emprendedora,
            "nombre_negocio": pedido.emprendedora.nombre_negocio,
        },

        "direccion_envio": {
            "id": pedido.direccion_envio.id_direccion if pedido.direccion_envio else None,
        } if pedido.direccion_envio else None,

        "items": [
            {
                "id_item": item.id_item_pedido,
                "producto_id": item.id_producto,
                "nombre": item.nombre_producto,
                "cantidad": item.cantidad,
                "precio_unitario": float(item.precio_unitario),
                "subtotal": float(item.precio_unitario * item.cantidad),
                "imagen_url": item.imagen_url,
            }
            for item in pedido.items
        ],
    }

def delete_pedido(
    db: Session,
    pedido_id: int,
    user: Usuario,
) -> bool:

    pedido = db.get(Pedido, pedido_id)

    if not pedido:
        return False

    if user.tipo_usuario != TipoUsuarioEnum.cliente:
        return False

    if pedido.id_cliente != user.id_usuario:
        return False

    db.delete(pedido)
    db.commit()
    return True


def update_pedido(
    db: Session,
    pedido_id: int,
    data: PedidoUpdate,
    user: Usuario,
) -> Optional[Pedido]:

    pedido = db.get(Pedido, pedido_id)

    if not pedido:
        return None

    if not user.emprendedora or pedido.id_emprendedora != user.emprendedora.id_emprendedora:
        return None

    pedido.estado = data.estado

    db.commit()
    db.refresh(pedido)
    return pedido