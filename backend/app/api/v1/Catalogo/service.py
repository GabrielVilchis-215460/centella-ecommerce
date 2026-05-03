from sqlalchemy.orm import Session
from sqlalchemy import select, func, union_all, literal
from app.models.producto import Producto
from app.models.servicio import Servicio
from app.models.emprendedora import Emprendedora
from app.models.usuario import Usuario
from app.models.resena import Resena
from app.models.categoria import Categoria
from app.models.enum import TipoResenaEnum, TipoEntregaEnum, EstadoVerificacionEnum
from app.models.imagen import Imagen
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

    # img
    imagen_sq = (
        select(
            Imagen.entity_id,
            Imagen.url.label("imagen_url")
        )
        .where(Imagen.entity_type == "producto")
        .order_by(Imagen.entity_id, Imagen.orden)
        .distinct(Imagen.entity_id)
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
            imagen_sq.c.imagen_url,
        )
        .join(Categoria, Categoria.id_categoria == Producto.id_categoria)
        .join(Emprendedora, Emprendedora.id_emprendedora == Producto.id_emprendedora)
        .outerjoin(calificacion_sq, calificacion_sq.c.id_referencia == Producto.id_producto)
        .outerjoin(imagen_sq, imagen_sq.c.entity_id==Producto.id_producto)
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

    count_query = select(func.count()).select_from(query.subquery())
    total = db.execute(count_query).scalar()

    rows = db.execute(query.offset(skip).limit(limit)).mappings().all()
    items = [ProductoCatalogoRead(**row) for row in rows]
    
    return {"items": items, "total": total, "skip": skip, "limit": limit}


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
            Usuario.nombre.label("nombre_vendedora"),
            Emprendedora.estado_verificacion.label("verificada"),
            Categoria.color_preferencia_hex.label("color_hex"),
        )
        .join(Categoria, Categoria.id_categoria == Servicio.id_categoria)
        .join(Emprendedora, Emprendedora.id_emprendedora == Servicio.id_emprendedora)
        .join(Usuario, Usuario.id_usuario == Emprendedora.id_usuario)
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
    
    count_query = select(func.count()).select_from(query.subquery())
    total = db.execute(count_query).scalar()

    rows = db.execute(query.offset(skip).limit(limit)).mappings().all()
    items = [ServicioCatalogoRead(**row) for row in rows]

    return {"items": items, "total": total, "skip": skip, "limit": limit}


def get_emprendedoras(
    db: Session,
    skip: int = 0,
    limit: int = 20,
    nombre: Optional[str] = None,
    ordenar_por: Optional[str] = None,
    verificadas: Optional[bool] = None,
    solo_productos: Optional[bool] = None,
    solo_servicios: Optional[bool] = None,
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
            Emprendedora.descripcion_negocio, 
            Emprendedora.logo_url,
            Usuario.foto_perfil_url,
            Emprendedora.insignia_hecho_juarez, 
            Emprendedora.estado_verificacion,
            Emprendedora.color_emprendedora_hex,
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

    if verificadas is not None:
        query = query.where(Emprendedora.estado_verificacion == EstadoVerificacionEnum.verificada)

    if solo_productos and not solo_servicios:
        query = query.where(
            Emprendedora.id_emprendedora.in_(
                select(Producto.id_emprendedora)
                .where(Producto.activo == True)
                .distinct()
            )
        )
    elif solo_servicios and not solo_productos:
        query = query.where(
            Emprendedora.id_emprendedora.in_(
                select(Servicio.id_emprendedora)
                .where(Servicio.activo == True)
                .distinct()
            )
        )
    elif solo_productos and solo_servicios:
        query = query.where(
            Emprendedora.id_emprendedora.in_(
                select(Producto.id_emprendedora)
                .where(Producto.activo == True)
                .distinct()
            ) |
            Emprendedora.id_emprendedora.in_(
                select(Servicio.id_emprendedora)
                .where(Servicio.activo == True)
                .distinct()
            )
        )

    if ordenar_por == "calificacion":
        query = query.order_by(calificacion_sq.c.calificacion_promedio.desc().nulls_last())
    elif ordenar_por == "nombre_negocio":
        query = query.order_by(Emprendedora.nombre_negocio.asc())
    elif ordenar_por == "recientes":
        query = query.order_by(Usuario.fecha_registro.desc())

    total = db.execute(
        select(func.count()).select_from(query.subquery())
    ).scalar()
    rows = db.execute(query.offset(skip).limit(limit)).mappings().all()

    result = []
    for row in rows:
        etiquetas = _get_etiquetas(db, row["id_emprendedora"])
        result.append(EmprendedoraCatalogoRead(
            **{**dict(row), "etiquetas": etiquetas}
        ))
    return {"items": result, "total": total, "skip": skip, "limit": limit}

def _get_etiquetas(db: Session, id_emprendedora: int) -> list[str]:
    """Calcula las etiquetas de tipo_negocio + categorías top para una emprendedora."""
    from app.models.producto import Producto
    from app.models.servicio import Servicio

    p_cats = select(
        Producto.id_categoria,
        literal("Productos").label("origen")
    ).where(Producto.id_emprendedora == id_emprendedora, Producto.activo == True)

    s_cats = select(
        Servicio.id_categoria,
        literal("Servicios").label("origen")
    ).where(Servicio.id_emprendedora == id_emprendedora, Servicio.activo == True)

    union_query = union_all(p_cats, s_cats).subquery()

    stats = db.execute(
        select(Categoria.nombre, union_query.c.origen)
        .join(Categoria, Categoria.id_categoria == union_query.c.id_categoria)
        .group_by(Categoria.id_categoria, Categoria.nombre, union_query.c.origen)
        .limit(3)
    ).all()

    tipos_encontrados = {row.origen for row in stats}
    nombres_categorias = list(dict.fromkeys([row.nombre for row in stats]))

    etiquetas = list(tipos_encontrados)
    if len(tipos_encontrados) > 1:
        if nombres_categorias:
            etiquetas.append(nombres_categorias[0])
    else:
        etiquetas.extend(nombres_categorias)

    return etiquetas

def get_categorias(
    db: Session,
    tipo: Optional[str] = None,
) -> list:
    from app.models.categoria import Categoria

    query = select(Categoria)
    if tipo:
        query = query.where(Categoria.tipo_categoria == tipo)

    return db.execute(query).scalars().all()