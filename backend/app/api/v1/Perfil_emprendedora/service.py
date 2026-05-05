from sqlalchemy.orm import Session
from sqlalchemy import select, func
from typing import Optional, List
from datetime import datetime
from app.models.imagen import Imagen
from app.models.pagina_emprendimiento import PaginaEmprendimiento
from app.models.usuario import Usuario
from app.models.producto import Producto
from app.models.servicio import Servicio
from app.models.categoria import Categoria
from app.models.emprendedora import Emprendedora
from app.models.resena import Resena
from app.models.enum import (
    TipoUsuarioEnum,
    TipoResenaEnum,
)

# cambio aqui en el def
def create_pagina(db: Session, user: Usuario, contenido: dict, emprendedora_data: Optional[dict] = None):
    if user.tipo_usuario != TipoUsuarioEnum.emprendedora or not user.emprendedora:
        raise Exception("No autorizado")

    existing = db.query(PaginaEmprendimiento).filter_by(
        id_emprendedora=user.emprendedora.id_emprendedora
    ).first()

    if existing:
        raise Exception("La página ya existe")
    
    # Actualiza campos de emprendedora si vienen
    if emprendedora_data:
        for key, value in emprendedora_data.items():
            if value is not None:
                setattr(user.emprendedora, key, value)

    pagina = PaginaEmprendimiento(
        id_emprendedora=user.emprendedora.id_emprendedora,
        contenido=contenido,
        ultima_actualizacion=datetime.utcnow(),
        visitas=0,
    )

    db.add(pagina)
    db.commit()
    db.refresh(pagina)
    return pagina

# cambio tmb en el def
def update_pagina(db: Session, user: Usuario, contenido: Optional[dict], emprendedora_data: Optional[dict] = None):
    if user.tipo_usuario != TipoUsuarioEnum.emprendedora or not user.emprendedora:
        raise Exception("No autorizado")

    pagina = db.query(PaginaEmprendimiento).filter_by(
        id_emprendedora=user.emprendedora.id_emprendedora
    ).first()

    if not pagina:
        return None

    if contenido is not None:
        pagina.contenido = contenido

    # Actualiza campos de emprendedora si vienen
    if emprendedora_data:
        for key, value in emprendedora_data.items():
            if value is not None:
                setattr(user.emprendedora, key, value)


    pagina.ultima_actualizacion = datetime.utcnow()

    db.commit()
    db.refresh(pagina)
    return pagina


def get_productos_by_emprendedora(
    db: Session,
    id_emprendedora: int,
    skip: int = 0,
    limit: int = 20,
):
    calificacion_sq = (
        select(
            Resena.id_referencia,
            func.avg(Resena.calificacion_item).label("calificacion_promedio"),
        )
        .where(Resena.tipo_resena == TipoResenaEnum.producto)
        .group_by(Resena.id_referencia)
        .subquery()
    )   

    imagen_sq = (
        select(
            Imagen.entity_id,
            func.min(Imagen.url).label("imagen_url")
        )
        .where(Imagen.entity_type == "producto")
        .group_by(Imagen.entity_id)
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
        .outerjoin(
            calificacion_sq,
            calificacion_sq.c.id_referencia == Producto.id_producto,
        )
        .outerjoin(  
            imagen_sq,
            imagen_sq.c.entity_id == Producto.id_producto,
        )
        .where(
            Producto.activo == True,
            Producto.id_emprendedora == id_emprendedora,
        )
    )

    return db.execute(query.offset(skip).limit(limit)).mappings().all()

def get_servicios_by_emprendedora(
    db: Session,
    id_emprendedora: int,
    skip: int = 0,
    limit: int = 20,
):
    calificacion_sq = (
        select(
            Resena.id_referencia,
            func.avg(Resena.calificacion_item).label("calificacion_promedio"),
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
        .outerjoin(
            calificacion_sq,
            calificacion_sq.c.id_referencia == Servicio.id_servicio,
        )
        .where(
            Servicio.activo == True,
            Servicio.id_emprendedora == id_emprendedora,
        )
    )

    return db.execute(query.offset(skip).limit(limit)).mappings().all()


def get_pagina_publica(
    db: Session,
    id_emprendedora: int,
    skip: int = 0,
    limit: int = 20,
):
    pagina = db.query(PaginaEmprendimiento).filter_by(
        id_emprendedora=id_emprendedora
    ).first()

    if not pagina:
        return None

    pagina.visitas += 1
    db.commit()

    productos = get_productos_by_emprendedora(
        db,
        id_emprendedora,
        skip,
        limit,
    )

    servicios = get_servicios_by_emprendedora(
        db,
        id_emprendedora,
        skip,
        limit,
    )

    return {
        "pagina": {
            "id_pagina": pagina.id_pagina,
            "id_emprendedora": pagina.id_emprendedora,
            "contenido": pagina.contenido,
            "ultima_actualizacion": str(pagina.ultima_actualizacion),
            "visitas": pagina.visitas,
        },
        "productos": [dict(p) for p in productos],
        "servicios": [dict(s) for s in servicios],
    }