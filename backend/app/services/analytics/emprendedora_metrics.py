from sqlalchemy.orm import Session
from sqlalchemy import select, func
from app.models import Producto, Pedido, ItemPedido

from datetime import datetime, timedelta

from app.models import (
    PaginaEmprendimiento,
    EstadoPedidoEnum,
)
from app.models.emprendedora import Emprendedora


# -------------------------
# SUMMARY METRICS
# -------------------------
def get_dashboard_metrics(db: Session, emprendedora_id: int):
    saldo_actual = db.execute(
        select(func.coalesce(func.sum(Pedido.total), 0))
        .where(
            Pedido.id_emprendedora == emprendedora_id,
            Pedido.estado == EstadoPedidoEnum.entregado,
        )
    ).scalar()


    pedidos_activos = db.execute(
        select(func.count())
        .where(
            Pedido.id_emprendedora == emprendedora_id,
            Pedido.estado.in_(
                [
                    EstadoPedidoEnum.pendiente,
                    EstadoPedidoEnum.confirmado,
                    EstadoPedidoEnum.enviado,
                ]
            ),
        )
    ).scalar()


    visitas = db.execute(
        select(PaginaEmprendimiento.visitas)
        .where(PaginaEmprendimiento.id_emprendedora == emprendedora_id)
    ).scalar()

    return {
        "saldo_actual": float(saldo_actual or 0),
        "pedidos_activos": pedidos_activos or 0,
        "visitas_perfil": visitas or 0,
    }


def get_ventas_30_dias(db: Session, emprendedora_id: int):
    fecha_inicio = datetime.utcnow() - timedelta(days=30)

    result = db.execute(
        select(
            func.date(Pedido.fecha_pedido).label("fecha"),
            func.coalesce(func.sum(Pedido.total), 0).label("total"),
        )
        .where(
            Pedido.id_emprendedora == emprendedora_id,
            Pedido.estado == EstadoPedidoEnum.entregado,
            Pedido.fecha_pedido >= fecha_inicio,
        )
        .group_by(func.date(Pedido.fecha_pedido))
        .order_by(func.date(Pedido.fecha_pedido))
    )

    return [
        {
            "fecha": str(row.fecha),
            "total": float(row.total),
        }
        for row in result
    ]


def get_top_productos(db: Session, emprendedora_id: int, limit: int = 5):
    base_query = (
        select(
            Producto.id_producto,
            Producto.nombre,
            func.sum(ItemPedido.cantidad).label("total_vendidos"),
            func.sum(
                ItemPedido.cantidad * ItemPedido.precio_unitario
            ).label("total_ingresos"),
        )
        .join(ItemPedido, ItemPedido.id_producto == Producto.id_producto)
        .join(Pedido, Pedido.id_pedido == ItemPedido.id_pedido)
        .where(
            Pedido.id_emprendedora == emprendedora_id,
            Pedido.estado == EstadoPedidoEnum.entregado,
        )
        .group_by(Producto.id_producto, Producto.nombre)
    )

    top_cantidad_result = db.execute(
        base_query.order_by(func.sum(ItemPedido.cantidad).desc()).limit(limit)
    )


    top_ingresos_result = db.execute(
        base_query.order_by(
            func.sum(ItemPedido.cantidad * ItemPedido.precio_unitario).desc()
        ).limit(limit)
    )

    return {
        "por_cantidad": [
            {
                "id_producto": row.id_producto,
                "nombre": row.nombre,
                "total": int(row.total_vendidos or 0),
            }
            for row in top_cantidad_result
        ],
        "por_ingresos": [
            {
                "id_producto": row.id_producto,
                "nombre": row.nombre,
                "total": float(row.total_ingresos or 0),
            }
            for row in top_ingresos_result
        ],
    }

# nueva funcion
def get_emprendimiento_info(db: Session, emprendedora_id: int):
    result = db.execute(
        select(Emprendedora.nombre_negocio, Emprendedora.logo_url)
        .where(Emprendedora.id_emprendedora == emprendedora_id)
    ).first()

    return {
        "nombre": result.nombre_negocio if result else "",
        "logo_url": result.logo_url if result else None,
    }

def get_full_dashboard(db: Session, emprendedora_id: int):
    return {
        "emprendimiento": get_emprendimiento_info(db, emprendedora_id), 
        "summary": get_dashboard_metrics(db, emprendedora_id),
        "ventas_30_dias": get_ventas_30_dias(db, emprendedora_id),
        "top_productos": get_top_productos(db, emprendedora_id),
    }