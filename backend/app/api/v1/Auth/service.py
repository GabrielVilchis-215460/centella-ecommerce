import uuid
from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.models.usuario import Usuario
from app.models.enum import TipoUsuarioEnum
from app.core.security import hash_password, verify_password, create_access_token, create_refresh_token
from app.services.email_service import enviar_correo_verificacion, enviar_correo_reset
from app.api.v1.Auth.schemas import RegistroRequest, LoginRequest, ResetPasswordRequest
import random
from datetime import datetime, timedelta
from app.api.v1.Auth.schemas import ForgotPasswordRequest, ConfirmResetRequest

async def register_user(data: RegistroRequest, db: Session):
    if db.query(Usuario).filter(Usuario.email == data.email).first():
        raise HTTPException(status_code=400, detail="El email ya está registrado")
    if data.tipo_usuario == TipoUsuarioEnum.administrador:
        raise HTTPException(status_code=403, detail="No se puede registrar un administrador")

    token = str(uuid.uuid4())

    nuevo_usuario = Usuario(
        email=data.email,
        contrasena=hash_password(data.contrasena),
        nombre=data.nombre,
        apellido=data.apellido,
        tipo_usuario=data.tipo_usuario,
        fecha_registro=datetime.utcnow(),
        email_verificado=False,
        token_verificacion=token
    )
    db.add(nuevo_usuario)
    db.commit()
    db.refresh(nuevo_usuario)

    await enviar_correo_verificacion(
        email_destino=nuevo_usuario.email,
        nombre=nuevo_usuario.nombre,
        token=token
    )

    return {"message": "Usuario creado. Revisa tu correo para verificar tu cuenta."}


def verify_email(token: str, db: Session):
    user = db.query(Usuario).filter(Usuario.token_verificacion == token).first()
    if not user:
        raise HTTPException(status_code=400, detail="Token inválido o ya usado")
    user.email_verificado = True
    user.token_verificacion = None
    db.commit()
    return {"message": "Correo verificado exitosamente"}


def login_user(data: LoginRequest, db: Session):
    user = db.query(Usuario).filter(Usuario.email == data.email).first()
    if not user or not verify_password(data.contrasena, user.contrasena):
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")
    if not user.email_verificado:
        raise HTTPException(status_code=403, detail="Debes verificar tu correo antes de iniciar sesión")
    return {
        "access_token": create_access_token({"sub": str(user.id_usuario)}),
        "refresh_token": create_refresh_token({"sub": str(user.id_usuario)}),
        "token_type": "bearer",
        "tipo_usuario": user.tipo_usuario
    }


def get_me_user(current_user: Usuario):
    return {
        "id": current_user.id_usuario,
        "email": current_user.email,
        "nombre": current_user.nombre,
        "apellido": current_user.apellido,
        "tipo_usuario": current_user.tipo_usuario,
        "fecha_registro": current_user.fecha_registro
    }


def reset_password(data: ResetPasswordRequest, current_user: Usuario, db: Session):
    if not verify_password(data.contrasena_actual, current_user.contrasena):
        raise HTTPException(status_code=400, detail="La contraseña actual es incorrecta")
    current_user.contrasena = hash_password(data.contrasena_nueva)
    db.commit()
    return {"message": "Contraseña actualizada exitosamente"}


async def forgot_password(data: ForgotPasswordRequest, db: Session):
    user = db.query(Usuario).filter(Usuario.email == data.email).first()
    # Por seguridad, siempre devolvemos el mismo mensaje aunque el email no exista
    if not user:
        return {"message": "Si el correo existe, recibirás un código de verificación"}
    
    # Generar código de 6 dígitos
    codigo = str(random.randint(100000, 999999))
    user.codigo_reset = codigo
    user.codigo_reset_expira = datetime.utcnow() + timedelta(minutes=15)
    db.commit()

    await enviar_correo_reset(
        email_destino=user.email,
        nombre=user.nombre,
        codigo=codigo
    )

    return {"message": "Si el correo existe, recibirás un código de verificación"}


def confirm_reset(data: ConfirmResetRequest, db: Session):
    user = db.query(Usuario).filter(Usuario.email == data.email).first()
    if not user:
        raise HTTPException(status_code=400, detail="Código inválido o expirado")
    if not user.codigo_reset or user.codigo_reset != data.codigo:
        raise HTTPException(status_code=400, detail="Código inválido o expirado")
    if datetime.utcnow() > user.codigo_reset_expira:
        raise HTTPException(status_code=400, detail="El código ha expirado")
    
    user.contrasena = hash_password(data.contrasena_nueva)
    user.codigo_reset = None
    user.codigo_reset_expira = None
    db.commit()
    return {"message": "Contraseña actualizada exitosamente"}