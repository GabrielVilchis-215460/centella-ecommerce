from sqlalchemy.orm import Session
from sqlalchemy.orm import joinedload
from sqlalchemy import select
from typing import Optional, List
from datetime import datetime

from app.models import Pedido, Usuario, ItemPedido
from.schemas import PedidoCreate, PedidoUpdate
from app.models.enum import EstadoPedidoEnum, TipoUsuarioEnum

def create_pedido(db: Session, data: PedidoCreate, user: Usuario) -> Pedido:
    if user.tipo_usuario != TipoUsuarioEnum.cliente:
        raise Exception("Solo clientes pueden crear pedidos")

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
) -> List[Pedido]:

    query = select(Pedido)

    # 🔐 access control
    if user.tipo_usuario == TipoUsuarioEnum.cliente:
        query = query.where(Pedido.id_cliente == user.id_usuario)

    elif user.tipo_usuario == TipoUsuarioEnum.emprendedora:
        if not user.emprendedora:
            raise Exception("Usuario sin perfil de emprendedora")

        query = query.where(
            Pedido.id_emprendedora == user.emprendedora.id_emprendedora
        )

    else:
        raise Exception("Tipo de usuario no soportado")

    # filters
    if estado:
        query = query.where(Pedido.estado == estado)

    # ordering
    if ordenar_por == "recientes":
        query = query.order_by(Pedido.fecha_pedido.desc())
    elif ordenar_por == "total_asc":
        query = query.order_by(Pedido.total.asc())
    elif ordenar_por == "total_desc":
        query = query.order_by(Pedido.total.desc())

    return db.execute(query.offset(skip).limit(limit)).scalars().all()


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

    return {
        "id_pedido": pedido.id_pedido,
        "fecha": pedido.fecha_pedido,
        "estado": pedido.estado,
        "total": float(pedido.total),

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
                "imagen": item.imagen_url,
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

    if user.tipo_usuario != TipoUsuarioEnum.emprendedora:
        return None

    if not user.emprendedora:
        return None

    if pedido.id_emprendedora != user.emprendedora.id_emprendedora:
        return None

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(pedido, field, value)

    db.commit()
    db.refresh(pedido)
    return pedido