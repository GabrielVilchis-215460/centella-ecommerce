import random
from datetime import datetime, timedelta
from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.models.usuario import Usuario
from app.models.enum import TipoUsuarioEnum, EstadoVerificacionEnum
from app.core.security import hash_password, verify_password, create_access_token, create_refresh_token
from app.services.email_service import enviar_correo_verificacion, enviar_correo_reset
from app.api.v1.Auth.schemas import RegistroRequest, LoginRequest, ResetPasswordRequest, ForgotPasswordRequest, ConfirmResetRequest, NewPasswordRequest
from app.models.emprendedora import Emprendedora

async def register_user(data: RegistroRequest, db: Session):
    if db.query(Usuario).filter(Usuario.email == data.email).first():
        raise HTTPException(status_code=400, detail="El email ya está registrado")
    if data.tipo_usuario == TipoUsuarioEnum.administrador:
        raise HTTPException(status_code=403, detail="No se puede registrar un administrador")

    codigo = str(random.randint(100000, 999999))

    nuevo_usuario = Usuario(
        email=data.email,
        contrasena=hash_password(data.contrasena),
        nombre=data.nombre,
        apellido=data.apellido,
        tipo_usuario=data.tipo_usuario,
        fecha_registro=datetime.utcnow(),
        email_verificado=False,
        codigo_verificacion=codigo,
        codigo_verificacion_expira=datetime.utcnow() + timedelta(minutes=15)
    )
    db.add(nuevo_usuario)
    db.commit()
    db.refresh(nuevo_usuario)

    await enviar_correo_verificacion(
        email_destino=nuevo_usuario.email,
        nombre=nuevo_usuario.nombre,
        codigo=codigo
    )

    return {"message": "Usuario creado. Revisa tu correo para verificar tu cuenta."}


def verify_email(email: str, codigo: str, db: Session):
    user = db.query(Usuario).filter(Usuario.email == email).first()
    if not user:
        raise HTTPException(status_code=400, detail="Código inválido o expirado")
    if not user.codigo_verificacion or user.codigo_verificacion != codigo:
        raise HTTPException(status_code=400, detail="Código inválido o expirado")
    if datetime.utcnow() > user.codigo_verificacion_expira:
        raise HTTPException(status_code=400, detail="El código ha expirado")
    user.email_verificado = True
    user.codigo_verificacion = None
    user.codigo_verificacion_expira = None
    # Crea el registro de emprendedora al verificar el correo
    if user.tipo_usuario == TipoUsuarioEnum.emprendedora:
        emprendedora = Emprendedora(
            id_usuario=user.id_usuario,
            nombre_negocio="Sin nombre",
            estado_verificacion=EstadoVerificacionEnum.pendiente,
            enlace_redes_sociales={},
            color_emprendedora_hex="#000000"
        )
        db.add(emprendedora)
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
    if not user:
        return {"message": "Si el correo existe, recibirás un código de verificación"}

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
    user.codigo_reset = None
    user.codigo_reset_expira = None
    db.commit()
    return {"message": "Código verificado. Ahora puedes cambiar tu contraseña."}

def new_password(data: NewPasswordRequest, db: Session):
    user = db.query(Usuario).filter(Usuario.email == data.email).first()
    if not user:
        raise HTTPException(status_code=400, detail="Usuario no encontrado")
    if user.codigo_reset is not None:
        raise HTTPException(status_code=400, detail="Debes verificar el código primero")
    user.contrasena = hash_password(data.contrasena_nueva)
    db.commit()
    return {"message": "Contraseña actualizada exitosamente"}

async def resend_verification_code(data, db: Session):
    user = db.query(Usuario).filter(Usuario.email == data.email).first()
    
    # Respuesta genérica por seguridad (no revelar si el email existe)
    generic_response = {"message": "Si el correo existe y no está verificado, recibirás un nuevo código."}
    
    if not user or user.email_verificado:
        return generic_response

    # Throttle: evitar spam si el código anterior aún no expiró
    if user.codigo_verificacion_expira and datetime.utcnow() < user.codigo_verificacion_expira:
        raise HTTPException(
            status_code=429,
            detail="Ya tienes un código activo. Espera antes de solicitar otro."
        )

    codigo = str(random.randint(100000, 999999))
    user.codigo_verificacion = codigo
    user.codigo_verificacion_expira = datetime.utcnow() + timedelta(minutes=15)
    db.commit()

    await enviar_correo_verificacion(
        email_destino=user.email,
        nombre=user.nombre,
        codigo=codigo
    )

    return generic_response

async def resend_reset_code(data, db: Session):
    user = db.query(Usuario).filter(Usuario.email == data.email).first()
    
    # Respuesta genérica por seguridad
    generic_response = {"message": "Si el correo existe, recibirás un nuevo código."}
    
    if not user:
        return generic_response

    # Throttle: evitar spam si el código anterior aún no expiró
    if user.codigo_reset_expira and datetime.utcnow() < user.codigo_reset_expira:
        raise HTTPException(
            status_code=429,
            detail="Ya tienes un código activo. Espera antes de solicitar otro."
        )

    codigo = str(random.randint(100000, 999999))
    user.codigo_reset = codigo
    user.codigo_reset_expira = datetime.utcnow() + timedelta(minutes=15)
    db.commit()

    await enviar_correo_reset(
        email_destino=user.email,
        nombre=user.nombre,
        codigo=codigo
    )

    return generic_response