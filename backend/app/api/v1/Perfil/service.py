from datetime import datetime
from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.models.usuario import Usuario
from app.models.emprendedora import Emprendedora
from app.models.pagina_emprendimiento import PaginaEmprendimiento
from app.models.direccion import Direccion
from app.models.enum import EstadoVerificacionEnum, TipoUsuarioEnum
from app.api.v1.Auth.schemas import ResetPasswordRequest
from app.core.security import hash_password, verify_password
from app.api.v1.Perfil.schemas import (
    ActualizarPerfilRequest,
    DireccionRequest,
    ActualizarEmprendedoraRequest,
    CrearEmprendedoraRequest,
    ActualizarPaginaRequest,
)


#  Perfil general 

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
    if data.foto_perfil_url is not None:
        current_user.foto_perfil_url = data.foto_perfil_url
    db.commit()
    db.refresh(current_user)
    return {"message": "Perfil actualizado exitosamente"}


def eliminar_cuenta(current_user: Usuario, db: Session):
    db.delete(current_user)
    db.commit()
    return {"message": "Cuenta eliminada exitosamente"}


#  Direcciones (solo clientes) 

def get_direcciones(current_user: Usuario, db: Session):
    if current_user.tipo_usuario != TipoUsuarioEnum.cliente:
        raise HTTPException(status_code=403, detail="Solo los clientes tienen direcciones")
    return db.query(Direccion).filter(Direccion.id_usuario == current_user.id_usuario).all()


def agregar_direccion(data: DireccionRequest, current_user: Usuario, db: Session):
    if current_user.tipo_usuario != TipoUsuarioEnum.cliente:
        raise HTTPException(status_code=403, detail="Solo los clientes pueden agregar direcciones")
    if data.es_principal:
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
        es_principal=data.es_principal,
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


#  Perfil emprendedora 

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
        logo_url=data.logo_url,
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
        contenido={},
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
    emp.pagina.contenido = data.contenido
    emp.pagina.ultima_actualizacion = datetime.utcnow()
    db.commit()
    return {"message": "Página actualizada exitosamente"}