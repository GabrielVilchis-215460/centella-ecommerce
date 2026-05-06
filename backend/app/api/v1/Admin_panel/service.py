from typing import Optional, Literal
from sqlalchemy.orm import Session
from sqlalchemy import select, or_, and_
from sqlalchemy.orm import aliased

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
    from app.models.resena import Resena

    UsuarioReportador  = aliased(Usuario)
    UsuarioPropietario = aliased(Usuario)

    query = (
        select(
            Reporte.id_reporte,
            Reporte.tipo_contenido,
            Reporte.id_referencia,
            Reporte.motivo,
            Reporte.estado,
            Reporte.fecha,
            # Producto
            Producto.id_producto,
            Producto.nombre.label("producto_nombre"),
            # Servicio
            Servicio.id_servicio,
            Servicio.nombre.label("servicio_nombre"),
            # Emprendedora (para producto/servicio)
            Emprendedora.nombre_negocio.label("nombre_negocio"),
            UsuarioPropietario.nombre.label("propietario_nombre"),
            UsuarioPropietario.apellido.label("propietario_apellido"),
            UsuarioPropietario.email.label("propietario_email"),
            # Reportador
            UsuarioReportador.nombre.label("reportado_por_nombre"),
            UsuarioReportador.email.label("reportado_por_email"),
        )
        .outerjoin(Producto, and_(
            Reporte.tipo_contenido == TipoContenidoReporteEnum.producto,
            Producto.id_producto == Reporte.id_referencia,
        ))
        .outerjoin(Servicio, and_(
            Reporte.tipo_contenido == TipoContenidoReporteEnum.servicio,
            Servicio.id_servicio == Reporte.id_referencia,
        ))
        .outerjoin(Emprendedora, or_(
            Emprendedora.id_emprendedora == Producto.id_emprendedora,
            Emprendedora.id_emprendedora == Servicio.id_emprendedora,
        ))
        .outerjoin(UsuarioPropietario, UsuarioPropietario.id_usuario == Emprendedora.id_usuario)
        .join(UsuarioReportador, UsuarioReportador.id_usuario == Reporte.id_reportador)
    )

    if q:
        query = query.where(or_(
            Producto.nombre.ilike(f"%{q}%"),
            Servicio.nombre.ilike(f"%{q}%"),
            Emprendedora.nombre_negocio.ilike(f"%{q}%"),
        ))
    if estado:
        query = query.where(Reporte.estado == estado)
    if ordenar_por == "estado":
        query = query.order_by(Reporte.estado.asc())
    else:
        query = query.order_by(Reporte.id_reporte.desc())

    rows = db.execute(query).all()

    # Para reseñas necesitamos hacer lookups separados
    resenas_ids = [
        r.id_referencia for r in rows
        if r.tipo_contenido == TipoContenidoReporteEnum.resena
    ]
    from app.models.resena import Resena
    from app.models.enum import TipoResenaEnum
    resenas_map = {}
    if resenas_ids:
        resenas = db.query(Resena).filter(Resena.id_resena.in_(resenas_ids)).all()
        for res in resenas:
            # Buscar nombre del item referenciado
            nombre_item = None
            autor = db.query(Usuario).filter(Usuario.id_usuario == res.id_cliente).first()
            if res.tipo_resena == TipoResenaEnum.producto:
                prod = db.query(Producto).filter(Producto.id_producto == res.id_referencia).first()
                nombre_item = prod.nombre if prod else None
            elif res.tipo_resena == TipoResenaEnum.servicio:
                srv = db.query(Servicio).filter(Servicio.id_servicio == res.id_referencia).first()
                nombre_item = srv.nombre if srv else None
            resenas_map[res.id_resena] = {
                "nombre_item": nombre_item,
                "autor_nombre": f"{autor.nombre} {autor.apellido}" if autor else "Usuario",
                "autor_email":  autor.email if autor else None,
            }

    result = []
    for row in rows:
        tipo = row.tipo_contenido

        if tipo == TipoContenidoReporteEnum.producto:
            nombre_contenido = row.producto_nombre or f"Referencia #{row.id_referencia}"
            propietario      = f"{row.nombre_negocio} - {row.propietario_nombre} {row.propietario_apellido}" if row.nombre_negocio else "—"
            propietario_email = row.propietario_email

        elif tipo == TipoContenidoReporteEnum.servicio:
            nombre_contenido = row.servicio_nombre or f"Referencia #{row.id_referencia}"
            propietario      = f"{row.nombre_negocio} - {row.propietario_nombre} {row.propietario_apellido}" if row.nombre_negocio else "—"
            propietario_email = row.propietario_email

        elif tipo == TipoContenidoReporteEnum.vendedora:
            emp = db.query(Emprendedora).filter(
                Emprendedora.id_emprendedora == row.id_referencia
            ).first()
            usr = db.query(Usuario).filter(
                Usuario.id_usuario == emp.id_usuario
            ).first() if emp else None
            nombre_contenido  = emp.nombre_negocio if emp else f"Referencia #{row.id_referencia}"
            propietario       = f"{usr.nombre} {usr.apellido}".strip() if usr else "—"
            propietario_email = usr.email if usr else None

        elif tipo == TipoContenidoReporteEnum.resena:
            resena_info      = resenas_map.get(row.id_referencia, {})
            nombre_item      = resena_info.get("nombre_item")
            nombre_contenido = f'Reseña de "{nombre_item}"' if nombre_item else f"Reseña #{row.id_referencia}"
            propietario      = resena_info.get("autor_nombre", "—")
            propietario_email = resena_info.get("autor_email")

        else:
            nombre_contenido = f"Referencia #{row.id_referencia}"
            propietario      = "—"
            propietario_email = None

        result.append({
            "id_reporte":          row.id_reporte,
            "tipo_contenido":      tipo.value,
            "id_referencia":       row.id_referencia,
            "nombre_contenido":    nombre_contenido,
            "propietario":         propietario,
            "propietario_email":   propietario_email,
            "reportado_por":       row.reportado_por_nombre,
            "reportado_por_email": row.reportado_por_email,
            "motivo":              row.motivo,
            "estado":              row.estado.value,
            "fecha":               row.fecha.isoformat() if row.fecha else None,
        })

    return result

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

    usuario = db.get(Usuario, emp.id_usuario)
    if usuario:
        usuario.activo = False

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

    if rep.tipo_contenido == TipoContenidoReporteEnum.producto:
        obj = db.get(Producto, rep.id_referencia)
        if obj: obj.activo = False

    elif rep.tipo_contenido == TipoContenidoReporteEnum.servicio:
        obj = db.get(Servicio, rep.id_referencia)
        if obj: obj.activo = False

    elif rep.tipo_contenido == TipoContenidoReporteEnum.resena:
        from app.models.resena import Resena
        obj = db.get(Resena, rep.id_referencia)
        if obj: db.delete(obj)

    rep.estado = EstadoReporteEnum.resuelto
    db.commit()
    return True


def suspender_cuenta_service(db: Session, id: int):
    rep = db.get(Reporte, id)
    if not rep:
        return None

    id_usuario = None

    if rep.tipo_contenido == TipoContenidoReporteEnum.producto:
        producto = db.get(Producto, rep.id_referencia)
        if producto:
            emp = db.get(Emprendedora, producto.id_emprendedora)
            if emp:
                emp.estado_verificacion = EstadoVerificacionEnum.suspendida
                id_usuario = emp.id_usuario

    elif rep.tipo_contenido == TipoContenidoReporteEnum.servicio:
        from app.models.servicio import Servicio
        servicio = db.get(Servicio, rep.id_referencia)
        if servicio:
            emp = db.get(Emprendedora, servicio.id_emprendedora)
            if emp:
                emp.estado_verificacion = EstadoVerificacionEnum.suspendida
                id_usuario = emp.id_usuario

    elif rep.tipo_contenido == TipoContenidoReporteEnum.vendedora:
        emp = db.get(Emprendedora, rep.id_referencia)
        if emp:
            emp.estado_verificacion = EstadoVerificacionEnum.suspendida
            id_usuario = emp.id_usuario

    elif rep.tipo_contenido == TipoContenidoReporteEnum.resena:
        from app.models.resena import Resena
        resena = db.get(Resena, rep.id_referencia)
        if resena:
            id_usuario = resena.id_cliente

    if id_usuario:
        usuario = db.get(Usuario, id_usuario)
        if usuario:
            usuario.activo = False

    rep.estado = EstadoReporteEnum.resuelto
    db.commit()
    return True

def descartar_reporte_service(db: Session, id: int):
    rep = db.get(Reporte, id)
    if not rep:
        return None

    rep.estado = EstadoReporteEnum.descartado
    db.commit()
    return True