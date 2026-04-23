from sqlalchemy.orm import Session
from sqlalchemy import select, func

from app.models import (
    Usuario,
    Emprendedora,
    Producto,
    Pedido,
    ItemPedido,
    EstadoPedidoEnum,
    TipoUsuarioEnum,
)


def get_admin_summary(db: Session):
    # 💰 Ingresos totales (solo entregados)
    ingresos_totales = db.execute(
        select(func.coalesce(func.sum(Pedido.total), 0))
        .where(Pedido.estado == EstadoPedidoEnum.entregado)
    ).scalar()

    # 🧑‍💼 Emprendedoras activas (con al menos 1 producto activo)
    emprendedoras_activas = db.execute(
        select(func.count(func.distinct(Producto.id_emprendedora)))
        .where(Producto.activo == True)
    ).scalar()

    # 👤 Clientes activos (que han hecho pedidos)
    clientes_activos = db.execute(
        select(func.count(func.distinct(Pedido.id_cliente)))
    ).scalar()

    return {
        "ingresos_totales": float(ingresos_totales or 0),
        "emprendedoras_activas": emprendedoras_activas or 0,
        "clientes_activos": clientes_activos or 0,
    }


def get_top_emprendedoras(db: Session, limit: int = 5):
    result = db.execute(
        select(
            Emprendedora.id_emprendedora,
            Emprendedora.nombre_negocio,
            func.coalesce(func.sum(Pedido.total), 0).label("ingresos"),
        )
        .join(Pedido, Pedido.id_emprendedora == Emprendedora.id_emprendedora)
        .where(Pedido.estado == EstadoPedidoEnum.entregado)
        .group_by(Emprendedora.id_emprendedora, Emprendedora.nombre_negocio)
        .order_by(func.sum(Pedido.total).desc())
        .limit(limit)
    )

    return [
        {
            "id_emprendedora": row.id_emprendedora,
            "nombre": row.nombre_negocio,
            "ingresos": float(row.ingresos or 0),
        }
        for row in result
    ]


def get_top_productos(db: Session, limit: int = 5):
    result = db.execute(
        select(
            Producto.id_producto,
            Producto.nombre,
            func.sum(ItemPedido.cantidad).label("ventas"),
        )
        .join(ItemPedido, ItemPedido.id_producto == Producto.id_producto)
        .join(Pedido, Pedido.id_pedido == ItemPedido.id_pedido)
        .where(Pedido.estado == EstadoPedidoEnum.entregado)
        .group_by(Producto.id_producto, Producto.nombre)
        .order_by(func.sum(ItemPedido.cantidad).desc())
        .limit(limit)
    )

    return [
        {
            "id_producto": row.id_producto,
            "nombre": row.nombre,
            "ventas": int(row.ventas or 0),
        }
        for row in result
    ]


def get_admin_dashboard(db: Session):
    return {
        "summary": get_admin_summary(db),
        "top_emprendedoras": get_top_emprendedoras(db),
        "top_productos": get_top_productos(db),
    }