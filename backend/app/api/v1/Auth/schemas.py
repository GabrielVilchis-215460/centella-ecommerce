from pydantic import BaseModel, EmailStr, field_validator
from app.models.enum import TipoUsuarioEnum
import re


def validar_contrasena_segura(v: str) -> str:
    if len(v) < 8:
        raise ValueError("La contraseña debe tener mínimo 8 caracteres")
    if not re.search(r"[A-Z]", v):
        raise ValueError("La contraseña debe tener al menos una mayúscula")
    if not re.search(r"[a-z]", v):
        raise ValueError("La contraseña debe tener al menos una minúscula")
    if not re.search(r"\d", v):
        raise ValueError("La contraseña debe tener al menos un número")
    if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", v):
        raise ValueError("La contraseña debe tener al menos un carácter especial")
    return v


class RegistroRequest(BaseModel):
    email: EmailStr
    contrasena: str
    nombre: str
    apellido: str
    tipo_usuario: TipoUsuarioEnum

    @field_validator("contrasena")
    @classmethod
    def validar_contrasena(cls, v):
        return validar_contrasena_segura(v)


class VerifyEmailRequest(BaseModel):
    email: EmailStr
    codigo: str


class LoginRequest(BaseModel):
    email: EmailStr
    contrasena: str


class ResetPasswordRequest(BaseModel):
    contrasena_actual: str
    contrasena_nueva: str

    @field_validator("contrasena_nueva")
    @classmethod
    def validar_contrasena_nueva(cls, v):
        return validar_contrasena_segura(v)


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ConfirmResetRequest(BaseModel):
    email: EmailStr
    codigo: str


class NewPasswordRequest(BaseModel):
    email: EmailStr
    contrasena_nueva: str

    @field_validator("contrasena_nueva")
    @classmethod
    def validar_contrasena_nueva(cls, v):
        return validar_contrasena_segura(v)
    
class ResendVerificationRequest(BaseModel):
    email: EmailStr

class ForgotPasswordRequest(BaseModel):
    email: EmailStr