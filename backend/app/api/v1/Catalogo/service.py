from sqlalchemy.orm import Session
from sqlalchemy import select, func
from app.models.producto import Producto
from app.models.servicio import Servicio
from app.models.emprendedora import Emprendedora
from app.models.usuario import Usuario
from app.models.resena import Resena
from app.models.categoria import Categoria
from app.models.enum import TipoResenaEnum, TipoEntregaEnum
from .schemas import ProductoCatalogoRead, ServicioCatalogoRead, EmprendedoraCatalogoRead
from typing import Optional


def get_productos(
    db: Session,
    skip: int = 0,
    limit: int = 20,
    id_categoria: Optional[int] = None,
    nombre: Optional[str] = None,
    precio_min: Optional[float] = None,
    precio_max: Optional[float] = None,
    hecho_juarez: Optional[bool] = None,
    tipo_entrega: Optional[TipoEntregaEnum] = None,
    ordenar_por: Optional[str] = None,
) -> list[ProductoCatalogoRead]:

    calificacion_sq = (
        select(
            Resena.id_referencia,
            func.avg(Resena.calificacion_item).label("calificacion_promedio")
        )
        .where(Resena.tipo_resena == TipoResenaEnum.producto)
        .group_by(Resena.id_referencia)
        .subquery()
    )

    query = (
        select(
            Producto.id_producto,
            Producto.id_emprendedora,
            Producto.id_categoria,
            Categoria.nombre.label("nombre_categoria"),
            Producto.nombre,
            Producto.descripcion,
            Producto.precio,
            Producto.cantidad_stock,
            Producto.tipo_entrega,
            Producto.fecha_creacion,
            calificacion_sq.c.calificacion_promedio,
        )
        .join(Categoria, Categoria.id_categoria == Producto.id_categoria)
        .join(Emprendedora, Emprendedora.id_emprendedora == Producto.id_emprendedora)
        .outerjoin(calificacion_sq, calificacion_sq.c.id_referencia == Producto.id_producto)
        .where(Producto.activo == True)
    )

    if id_categoria:
        query = query.where(Producto.id_categoria == id_categoria)
    if nombre:
        query = query.where(Producto.nombre.ilike(f"%{nombre}%"))
    if precio_min is not None:
        query = query.where(Producto.precio >= precio_min)
    if precio_max is not None:
        query = query.where(Producto.precio <= precio_max)
    if hecho_juarez is not None:
        query = query.where(Emprendedora.insignia_hecho_juarez == hecho_juarez)
    if tipo_entrega:
        query = query.where(Producto.tipo_entrega == tipo_entrega)

    if ordenar_por == "precio_asc":
        query = query.order_by(Producto.precio.asc())
    elif ordenar_por == "precio_desc":
        query = query.order_by(Producto.precio.desc())
    elif ordenar_por == "calificacion":
        query = query.order_by(calificacion_sq.c.calificacion_promedio.desc().nulls_last())
    elif ordenar_por == "recientes":
        query = query.order_by(Producto.fecha_creacion.desc())
    elif ordenar_por == "nombre":
        query = query.order_by(Producto.nombre.asc())

    rows = db.execute(query.offset(skip).limit(limit)).mappings().all()
    return [ProductoCatalogoRead(**row) for row in rows]


def get_servicios(
    db: Session,
    skip: int = 0,
    limit: int = 20,
    id_categoria: Optional[int] = None,
    nombre: Optional[str] = None,
    precio_min: Optional[float] = None,
    precio_max: Optional[float] = None,
    ordenar_por: Optional[str] = None,
) -> list[ServicioCatalogoRead]:

    calificacion_sq = (
        select(
            Resena.id_referencia,
            func.avg(Resena.calificacion_item).label("calificacion_promedio")
        )
        .where(Resena.tipo_resena == TipoResenaEnum.servicio)
        .group_by(Resena.id_referencia)
        .subquery()
    )

    query = (
        select(
            Servicio.id_servicio,
            Servicio.id_emprendedora,
            Servicio.id_categoria,
            Categoria.nombre.label("nombre_categoria"),
            Servicio.nombre,
            Servicio.descripcion,
            Servicio.precio,
            Servicio.enlace_reservacion,
            Servicio.fecha_creacion,
            calificacion_sq.c.calificacion_promedio,
        )
        .join(Categoria, Categoria.id_categoria == Servicio.id_categoria)
        .outerjoin(calificacion_sq, calificacion_sq.c.id_referencia == Servicio.id_servicio)
        .where(Servicio.activo == True)
    )

    if id_categoria:
        query = query.where(Servicio.id_categoria == id_categoria)
    if nombre:
        query = query.where(Servicio.nombre.ilike(f"%{nombre}%"))
    if precio_min is not None:
        query = query.where(Servicio.precio >= precio_min)
    if precio_max is not None:
        query = query.where(Servicio.precio <= precio_max)

    if ordenar_por == "precio_asc":
        query = query.order_by(Servicio.precio.asc())
    elif ordenar_por == "precio_desc":
        query = query.order_by(Servicio.precio.desc())
    elif ordenar_por == "calificacion":
        query = query.order_by(calificacion_sq.c.calificacion_promedio.desc().nulls_last())
    elif ordenar_por == "recientes":
        query = query.order_by(Servicio.fecha_creacion.desc())
    elif ordenar_por == "nombre":
        query = query.order_by(Servicio.nombre.asc())

    rows = db.execute(query.offset(skip).limit(limit)).mappings().all()
    return [ServicioCatalogoRead(**row) for row in rows]


def get_emprendedoras(
    db: Session,
    skip: int = 0,
    limit: int = 20,
    nombre: Optional[str] = None,
    ordenar_por: Optional[str] = None,
) -> list[EmprendedoraCatalogoRead]:

    calificacion_sq = (
        select(
            Resena.id_emprendedora,
            func.avg(Resena.calificacion_vendedora).label("calificacion_promedio")
        )
        .group_by(Resena.id_emprendedora)
        .subquery()
    )

    query = (
        select(
            Emprendedora.id_emprendedora,
            Emprendedora.nombre_negocio,
            Emprendedora.logo_url,
            Usuario.nombre,
            Usuario.apellido,
            Usuario.fecha_registro,
            calificacion_sq.c.calificacion_promedio,
        )
        .join(Usuario, Usuario.id_usuario == Emprendedora.id_usuario)
        .outerjoin(calificacion_sq, calificacion_sq.c.id_emprendedora == Emprendedora.id_emprendedora)
    )

    if nombre:
        query = query.where(
            Usuario.nombre.ilike(f"%{nombre}%") |
            Usuario.apellido.ilike(f"%{nombre}%") |
            Emprendedora.nombre_negocio.ilike(f"%{nombre}%")
        )

    if ordenar_por == "calificacion":
        query = query.order_by(calificacion_sq.c.calificacion_promedio.desc().nulls_last())
    elif ordenar_por == "nombre_negocio":
        query = query.order_by(Emprendedora.nombre_negocio.asc())
    elif ordenar_por == "recientes":
        query = query.order_by(Usuario.fecha_registro.desc())

    rows = db.execute(query.offset(skip).limit(limit)).mappings().all()
    return [EmprendedoraCatalogoRead(**row) for row in rows]