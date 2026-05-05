from datetime import datetime
from fastapi import HTTPException, UploadFile
from sqlalchemy.orm import Session
from app.models.usuario import Usuario
from app.models.emprendedora import Emprendedora
from app.models.pagina_emprendimiento import PaginaEmprendimiento
from app.models.direccion import Direccion
from app.models.enum import EstadoVerificacionEnum, TipoUsuarioEnum
from app.api.v1.Perfil.schemas import (
    ActualizarPerfilRequest,
    DireccionRequest,
    ActualizarEmprendedoraRequest,
    CrearEmprendedoraRequest,
    ActualizarPaginaRequest,
)
from app.api.v1.Imagenes.service import ImageUploadService
from app.models.imagen import Imagen
from app.models.producto import Producto
from app.models.categoria import Categoria
from app.models.resena import Resena
from app.models.enum import TipoResenaEnum
from sqlalchemy import select, func
from app.models.servicio import Servicio
from app.api.v1.Catalogo.service import _get_etiquetas

# Perfil general

def get_perfil(current_user: Usuario):
    return {
        "id": current_user.id_usuario,
        "email": current_user.email,
        "nombre": current_user.nombre,
        "apellido": current_user.apellido,
        "fecha_nacimiento": current_user.fecha_nacimiento,
        "foto_perfil_url": current_user.foto_perfil_url,
        "tipo_usuario": current_user.tipo_usuario,
        "fecha_registro": current_user.fecha_registro,
    }


def actualizar_perfil(data: ActualizarPerfilRequest, current_user: Usuario, db: Session):
    if data.nombre is not None:
        current_user.nombre = data.nombre
    if data.apellido is not None:
        current_user.apellido = data.apellido
    if data.fecha_nacimiento is not None:
        current_user.fecha_nacimiento = data.fecha_nacimiento
    db.commit()
    db.refresh(current_user)
    return {"message": "Perfil actualizado exitosamente"}


def subir_foto_perfil(file: UploadFile, current_user: Usuario, db: Session):
    service = ImageUploadService(db)
    result = service.upload_image(file, current_user.id_usuario, "usuario")
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("error", "Error al subir imagen"))
    current_user.foto_perfil_url = result["url"]
    db.commit()
    return {"message": "Foto de perfil actualizada exitosamente", "foto_perfil_url": result["url"]}



def eliminar_cuenta(current_user: Usuario, db: Session):
    #db.delete(current_user)
    current_user.activo = False #soft delete x tibios
    db.commit()
    return {"message": "Cuenta desactivada exitosamente"}

def eliminar_foto_perfil(current_user: Usuario, db: Session):
    # Buscar imagen en la tabla
    imagen = db.query(Imagen).filter(
        Imagen.entity_id == current_user.id_usuario,
        Imagen.entity_type == "usuario"
    ).first()

    if imagen:
        service = ImageUploadService(db)
        service.delete_image(imagen.id_imagen)

    # Limpiar URL
    current_user.foto_perfil_url = None
    db.commit()
    return {"message": "Foto eliminada exitosamente"}

# Direcciones (solo clientes)

def get_direcciones(current_user: Usuario, db: Session):
    if current_user.tipo_usuario != TipoUsuarioEnum.cliente:
        raise HTTPException(status_code=403, detail="Solo los clientes tienen direcciones")
    return db.query(Direccion).filter(Direccion.id_usuario == current_user.id_usuario).all()


def agregar_direccion(data: DireccionRequest, current_user: Usuario, db: Session):
    if current_user.tipo_usuario != TipoUsuarioEnum.cliente:
        raise HTTPException(status_code=403, detail="Solo los clientes pueden agregar direcciones")
    # Si no tiene direcciones, forzar como principal
    count = db.query(Direccion).filter(
        Direccion.id_usuario == current_user.id_usuario
    ).count()
    es_principal = True if count == 0 else data.es_principal

    if es_principal:
        db.query(Direccion).filter(
            Direccion.id_usuario == current_user.id_usuario
        ).update({"es_principal": False})
    nueva = Direccion(
        id_usuario=current_user.id_usuario,
        calle=data.calle,
        numero_ext=data.numero_ext,
        numero_int=data.numero_int,
        colonia=data.colonia,
        ciudad=data.ciudad,
        estado=data.estado,
        numero_telefonico=data.numero_telefonico,
        codigo_postal=data.codigo_postal,
        es_principal=es_principal,
    )
    db.add(nueva)
    db.commit()
    db.refresh(nueva)
    return {"message": "Dirección agregada exitosamente", "id_direccion": nueva.id_direccion}


def actualizar_direccion(id_direccion: int, data: DireccionRequest, current_user: Usuario, db: Session):
    direccion = db.query(Direccion).filter(
        Direccion.id_direccion == id_direccion,
        Direccion.id_usuario == current_user.id_usuario
    ).first()
    if not direccion:
        raise HTTPException(status_code=404, detail="Dirección no encontrada")
    if data.es_principal:
        db.query(Direccion).filter(
            Direccion.id_usuario == current_user.id_usuario
        ).update({"es_principal": False})
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(direccion, field, value)
    db.commit()
    return {"message": "Dirección actualizada exitosamente"}


def eliminar_direccion(id_direccion: int, current_user: Usuario, db: Session):
    direccion = db.query(Direccion).filter(
        Direccion.id_direccion == id_direccion,
        Direccion.id_usuario == current_user.id_usuario
    ).first()
    if not direccion:
        raise HTTPException(status_code=404, detail="Dirección no encontrada")
    db.delete(direccion)
    db.commit()
    return {"message": "Dirección eliminada exitosamente"}


# Perfil emprendedora

def get_perfil_emprendedora(current_user: Usuario, db: Session):
    emp = db.query(Emprendedora).filter(
        Emprendedora.id_usuario == current_user.id_usuario
    ).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Perfil de emprendedora no encontrado")
    return emp


def crear_perfil_emprendedora(data: CrearEmprendedoraRequest, current_user: Usuario, db: Session):
    if current_user.tipo_usuario != TipoUsuarioEnum.emprendedora:
        raise HTTPException(status_code=403, detail="Solo las emprendedoras pueden crear un perfil de negocio")
    existente = db.query(Emprendedora).filter(
        Emprendedora.id_usuario == current_user.id_usuario
    ).first()
    if existente:
        raise HTTPException(status_code=400, detail="Ya tienes un perfil de negocio")
    nueva = Emprendedora(
        id_usuario=current_user.id_usuario,
        nombre_negocio=data.nombre_negocio,
        descripcion_negocio=data.descripcion_negocio,
        enlace_redes_sociales=data.enlace_redes_sociales,
        color_emprendedora_hex=data.color_emprendedora_hex,
        estado_verificacion=EstadoVerificacionEnum.pendiente,
        insignia_hecho_juarez=False,
        solicitud_insignia_activa=False,
    )
    db.add(nueva)
    db.commit()
    db.refresh(nueva)
    pagina = PaginaEmprendimiento(
        id_emprendedora=nueva.id_emprendedora,
        contenido={"html": "<p></p>"},
        ultima_actualizacion=datetime.utcnow(),
        visitas=0,
    )
    db.add(pagina)
    db.commit()
    return {"message": "Perfil de negocio creado exitosamente", "id_emprendedora": nueva.id_emprendedora}


def actualizar_perfil_emprendedora(data: ActualizarEmprendedoraRequest, current_user: Usuario, db: Session):
    emp = db.query(Emprendedora).filter(
        Emprendedora.id_usuario == current_user.id_usuario
    ).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Perfil de emprendedora no encontrado")
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(emp, field, value)
    db.commit()
    return {"message": "Perfil de negocio actualizado exitosamente"}


def solicitar_insignia(current_user: Usuario, db: Session):
    emp = db.query(Emprendedora).filter(
        Emprendedora.id_usuario == current_user.id_usuario
    ).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Perfil de emprendedora no encontrado")
    if emp.insignia_hecho_juarez:
        raise HTTPException(status_code=400, detail="Ya tienes la insignia")
    if emp.solicitud_insignia_activa:
        raise HTTPException(status_code=400, detail="Ya tienes una solicitud activa")
    emp.solicitud_insignia_activa = True
    db.commit()
    return {"message": "Solicitud de insignia enviada exitosamente"}


def solicitar_verificacion(current_user: Usuario, db: Session):
    emp = db.query(Emprendedora).filter(
        Emprendedora.id_usuario == current_user.id_usuario
    ).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Perfil de emprendedora no encontrado")
    if emp.estado_verificacion == EstadoVerificacionEnum.verificada:
        raise HTTPException(status_code=400, detail="Tu negocio ya está verificado")
    if emp.estado_verificacion == EstadoVerificacionEnum.pendiente:
        raise HTTPException(status_code=400, detail="Ya tienes una solicitud de verificación pendiente")
    emp.estado_verificacion = EstadoVerificacionEnum.pendiente
    db.commit()
    return {"message": "Solicitud de verificación enviada exitosamente"}


def get_productos_negocio(db: Session, id_emprendedora: int, skip: int = 0, limit: int = 20, solo_activos: bool = False):
    calificacion_sq = (
        select(
            Resena.id_referencia,
            func.avg(Resena.calificacion_item).label("calificacion_promedio"),
        )
        .where(Resena.tipo_resena == TipoResenaEnum.producto)
        .group_by(Resena.id_referencia)
        .subquery()
    )

    # Subquery para obtener la primera imagen de cada producto
    imagen_sq = (
        select(
            Imagen.entity_id,
            func.min(Imagen.url).label("imagen_url"),  # ← usa min en lugar de distinct
        )
        .where(Imagen.entity_type == "producto")
        .group_by(Imagen.entity_id)  # ← agrupa por producto
        .subquery()
    )

    query = (
        select(
            Producto.id_producto,
            Producto.nombre,
            Producto.descripcion,
            Producto.precio,
            Producto.cantidad_stock,
            Producto.tipo_entrega,
            Producto.fecha_creacion,
            Producto.activo,
            Categoria.id_categoria, 
            func.coalesce(calificacion_sq.c.calificacion_promedio, 0).label("calificacion_promedio"),
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
            #Producto.activo == True,
            Producto.id_emprendedora == id_emprendedora,
        )
        .offset(skip)
        .limit(limit)
    )

    if solo_activos:
        query = query.where(Producto.activo == True)

    query = query.offset(skip).limit(limit)

    return db.execute(query).mappings().all()

#  Página de emprendimiento 

def get_pagina(current_user: Usuario, db: Session):
    emp = db.query(Emprendedora).filter(
        Emprendedora.id_usuario == current_user.id_usuario
    ).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Perfil de emprendedora no encontrado")
    return emp.pagina


def actualizar_pagina(data: ActualizarPaginaRequest, current_user: Usuario, db: Session):
    emp = db.query(Emprendedora).filter(
        Emprendedora.id_usuario == current_user.id_usuario
    ).first()
    if not emp or not emp.pagina:
        raise HTTPException(status_code=404, detail="Página no encontrada")
    
    # Si no existe la página, crearla
    if not emp.pagina:
        from app.models.pagina_emprendimiento import PaginaEmprendimiento
        pagina = PaginaEmprendimiento(
            id_emprendedora=emp.id_emprendedora,
            contenido=data.contenido or {"html": "<p></p>"},
            ultima_actualizacion=datetime.utcnow(),
            visitas=0,
        )
        db.add(pagina)
        db.commit()
        return {"message": "Página creada exitosamente"}
    
    emp.pagina.contenido = data.contenido
    emp.pagina.ultima_actualizacion = datetime.utcnow()
    db.commit()
    return {"message": "Página actualizada exitosamente"}

def get_servicios_negocio(db: Session, id_emprendedora: int, skip: int = 0, limit: int = 20):
    query = (
        select(
            Servicio.id_servicio,
            Servicio.nombre,
            Servicio.descripcion,
            Servicio.precio,
            Servicio.enlace_reservacion,
            Servicio.activo,
            Servicio.fecha_creacion,
            Categoria.nombre.label("nombre_categoria"),
        )
        .join(Categoria, Categoria.id_categoria == Servicio.id_categoria)
        .where(
            Servicio.activo == True,
            Servicio.id_emprendedora == id_emprendedora,
        )
        .offset(skip)
        .limit(limit)
    )
    return [dict(r) for r in db.execute(query).mappings().all()]

def subir_logo_emprendedora(file: UploadFile, current_user: Usuario, db: Session):
    emp = db.query(Emprendedora).filter(
        Emprendedora.id_usuario == current_user.id_usuario
    ).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Perfil de emprendedora no encontrado")
    
    service = ImageUploadService(db)
    result = service.upload_image(file, emp.id_emprendedora, "emprendedora")
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("error", "Error al subir imagen"))
    
    emp.logo_url = result["url"]
    db.commit()
    return {"message": "Logo actualizado exitosamente", "logo_url": result["url"]}

def get_etiquetas_negocio(id_emprendedora: int, db: Session):
    emp = db.query(Emprendedora).filter(
        Emprendedora.id_usuario == id_emprendedora
    ).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Perfil de emprendedora no encontrado")
    
    etiquetas = _get_etiquetas(db, emp.id_emprendedora)
    return {"etiquetas": etiquetas}