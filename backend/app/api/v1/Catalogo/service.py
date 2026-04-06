from sqlalchemy.orm import Session
from sqlalchemy import select, func
from app.models.producto import Producto
from app.models.servicio import Servicio
from app.models.emprendedora import Emprendedora
from app.models.usuario import Usuario
from app.models.resena import Resena
from .schemas import ProductoCatalogoRead, ServicioCatalogoRead, EmprendedoraCatalogoRead


def get_productos(db: Session, skip: int = 0, limit: int = 20) -> list[ProductoCatalogoRead]:
    rows = db.execute(
        select(Producto)
        .where(Producto.activo == True)
        .offset(skip)
        .limit(limit)
    ).scalars().all()
    return rows


def get_servicios(db: Session, skip: int = 0, limit: int = 20) -> list[ServicioCatalogoRead]:
    rows = db.execute(
        select(Servicio)
        .where(Servicio.activo == True)
        .offset(skip)
        .limit(limit)
    ).scalars().all()
    return rows


def get_emprendedoras(db: Session, skip: int = 0, limit: int = 20) -> list[EmprendedoraCatalogoRead]:
    calificacion_sq = (
        select(
            Resena.id_emprendedora,
            func.avg(Resena.calificacion_vendedora).label("calificacion_promedio")
        )
        .group_by(Resena.id_emprendedora)
        .subquery()
    )

    rows = db.execute(
        select(
            Emprendedora.id_emprendedora,
            Emprendedora.nombre_negocio,
            Emprendedora.logo_url,
            Usuario.nombre,
            Usuario.apellido,
            calificacion_sq.c.calificacion_promedio,
        )
        .join(Usuario, Usuario.id_usuario == Emprendedora.id_usuario)
        .outerjoin(calificacion_sq, calificacion_sq.c.id_emprendedora == Emprendedora.id_emprendedora)
        .offset(skip)
        .limit(limit)
    ).mappings().all()

    return [EmprendedoraCatalogoRead(**row) for row in rows]