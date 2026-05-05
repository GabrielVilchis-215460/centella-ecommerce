from typing import Optional, Literal
from sqlalchemy.orm import Session
from sqlalchemy import select, or_, and_

from app.models import (
    Usuario,
    Emprendedora,
    Servicio,
    Producto,
    Reporte,
    EstadoVerificacionEnum,
    EstadoReporteEnum,
    TipoContenidoReporteEnum
)


def get_emprendedoras_service(
    db: Session,
    q: Optional[str] = None,
    estado: Optional[str] = None,
    insignia: Optional[bool] = None,
    ordenar_por: Optional[Literal["nombre", "recientes", "estado"]] = None,
):
    query = (
        select(
            Emprendedora.id_emprendedora,
            Usuario.nombre,
            Usuario.apellido,
            Usuario.email,
            Emprendedora.nombre_negocio,
            Emprendedora.estado_verificacion,
            Usuario.fecha_registro,
            Emprendedora.insignia_hecho_juarez,
        )
        .join(Usuario, Usuario.id_usuario == Emprendedora.id_usuario)
    )

    if q:
        query = query.where(
            or_(
                Usuario.nombre.ilike(f"%{q}%"),
                Usuario.apellido.ilike(f"%{q}%"),
                Usuario.email.ilike(f"%{q}%"),
                Emprendedora.nombre_negocio.ilike(f"%{q}%"),
            )
        )

    if estado:
        query = query.where(
            Emprendedora.estado_verificacion == estado
        )

    if insignia is not None:
        query = query.where(
            Emprendedora.insignia_hecho_juarez == insignia
        )

    if ordenar_por == "nombre":
        query = query.order_by(Emprendedora.nombre_negocio.asc())
    elif ordenar_por == "estado":
        query = query.order_by(Emprendedora.estado_verificacion.asc())
    elif ordenar_por == "recientes":
        query = query.order_by(Usuario.fecha_registro.desc())
    else:
        query = query.order_by(Usuario.fecha_registro.desc())

    result = db.execute(query)

    return [
        {
            "id_emprendedora": row.id_emprendedora,
            "nombre": f"{row.nombre} {row.apellido}",
            "email": row.email,
            "nombre_negocio": row.nombre_negocio,
            "estado": row.estado_verificacion,
            "fecha_registro": row.fecha_registro,
            "insignia": row.insignia_hecho_juarez,
        }
        for row in result
    ]


def get_insignias_service(
    db: Session,
    q: Optional[str] = None,
    solicitud_activa: Optional[bool] = None,
    insignia: Optional[bool] = None,
    ordenar_por: Optional[Literal["nombre"]] = None,
):
    query = select(
        Emprendedora.id_emprendedora,
        Emprendedora.nombre_negocio,
        Emprendedora.insignia_hecho_juarez,
        Emprendedora.solicitud_insignia_activa,
        Usuario.nombre,
        Usuario.apellido,
        Usuario.email,
        Usuario.fecha_registro,
    ).join(Usuario, Usuario.id_usuario == Emprendedora.id_usuario)

    if q:
        query = query.where(
            Emprendedora.nombre_negocio.ilike(f"%{q}%")
        )

    if solicitud_activa is not None:
        query = query.where(
            Emprendedora.solicitud_insignia_activa == solicitud_activa
        )

    if insignia is not None:
        query = query.where(
            Emprendedora.insignia_hecho_juarez == insignia
        )

    if ordenar_por == "nombre":
        query = query.order_by(Emprendedora.nombre_negocio.asc())
    else:
        query = query.order_by(Emprendedora.id_emprendedora.desc())

    result = db.execute(query)

    return [
        {
            "id_emprendedora": row.id_emprendedora,
            "nombre_negocio":  row.nombre_negocio,
            "insignia":        row.insignia_hecho_juarez,
            "solicitud_activa": row.solicitud_insignia_activa,
            "nombre_solicitante": f"{row.nombre} {row.apellido}",
            "email":           row.email,
            "fecha_solicitud": row.fecha_registro,
        }
        for row in result
    ]


def get_reportes_service(
    db: Session,
    q: Optional[str] = None,
    estado: Optional[str] = None,
    ordenar_por: Optional[Literal["recientes", "estado"]] = None,
):
    query = (
        select(
            Reporte.id_reporte,
            Reporte.tipo_contenido,

            Producto.id_producto,
            Producto.nombre.label("producto_nombre"),

            Servicio.id_servicio,
            Servicio.nombre.label("servicio_nombre"),

            Emprendedora.nombre_negocio.label("propietario"),
            Usuario.nombre.label("reportado_por"),
            Reporte.estado,
        )
        # Producto join (only when tipo = producto)
        .outerjoin(
            Producto,
            and_(
                Reporte.tipo_contenido == TipoContenidoReporteEnum.producto,
                Producto.id_producto == Reporte.id_referencia,
            )
        )
        # Servicio join (only when tipo = servicio)
        .outerjoin(
            Servicio,
            and_(
                Reporte.tipo_contenido == TipoContenidoReporteEnum.servicio,
                Servicio.id_servicio == Reporte.id_referencia,
            )
        )
        # Emprendedora (from either producto or servicio)
        .outerjoin(
            Emprendedora,
            or_(
                Emprendedora.id_emprendedora == Producto.id_emprendedora,
                Emprendedora.id_emprendedora == Servicio.id_emprendedora,
            )
        )
        .join(Usuario, Usuario.id_usuario == Reporte.id_reportador)
    )

    if q:
        query = query.where(
            or_(
                Producto.nombre.ilike(f"%{q}%"),
                Emprendedora.nombre_negocio.ilike(f"%{q}%"),
                Usuario.nombre.ilike(f"%{q}%"),
            )
        )

    if estado:
        query = query.where(Reporte.estado == estado)

    if ordenar_por == "estado":
        query = query.order_by(Reporte.estado.asc())
    elif ordenar_por == "recientes":
        query = query.order_by(Reporte.id_reporte.desc())
    else:
        query = query.order_by(Reporte.id_reporte.desc())

    result = db.execute(query)

    return [
        {
            "id_reporte": row.id_reporte,
            "producto_id": row.id_producto,
            "producto": row.producto_nombre,
            "propietario": row.propietario,
            "reportado_por": row.reportado_por,
            "estado": row.estado,
        }
        for row in result
    ]


def verificar_emprendedora_service(db: Session, id: int):
    emp = db.get(Emprendedora, id)
    if not emp:
        return None

    emp.estado_verificacion = EstadoVerificacionEnum.verificada
    db.commit()
    return True


def suspender_emprendedora_service(db: Session, id: int):
    emp = db.get(Emprendedora, id)
    if not emp:
        return None

    emp.estado_verificacion = EstadoVerificacionEnum.suspendida
    db.commit()
    return True


def aprobar_insignia_service(db: Session, id: int):
    emp = db.get(Emprendedora, id)
    if not emp:
        return None

    emp.insignia_hecho_juarez = True
    emp.solicitud_insignia_activa = False
    db.commit()
    return True


def rechazar_insignia_service(db: Session, id: int):
    emp = db.get(Emprendedora, id)
    if not emp:
        return None

    emp.solicitud_insignia_activa = False
    db.commit()
    return True

def revocar_insignia_service(db: Session, id: int):
    emp = db.get(Emprendedora, id)
    if not emp:
        return None
    emp.insignia_hecho_juarez = False
    emp.solicitud_insignia_activa = False
    db.commit()
    return True


def eliminar_publicacion_service(db: Session, id: int):
    rep = db.get(Reporte, id)
    if not rep:
        return None

    producto = db.get(Producto, rep.id_contenido)
    if producto:
        producto.activo = False

    rep.estado = EstadoReporteEnum.resuelto
    db.commit()
    return True


def suspender_cuenta_service(db: Session, id: int):
    rep = db.get(Reporte, id)
    if not rep:
        return None

    producto = db.get(Producto, rep.id_contenido)
    if producto:
        emp = db.get(Emprendedora, producto.id_emprendedora)
        if emp:
            emp.estado_verificacion = EstadoVerificacionEnum.rechazado

    rep.estado = EstadoReporteEnum.resuelto
    db.commit()
    return True


def descartar_reporte_service(db: Session, id: int):
    rep = db.get(Reporte, id)
    if not rep:
        return None

    rep.estado = EstadoReporteEnum.rechazado
    db.commit()
    return True