from pydantic import BaseModel, EmailStr
from app.models.enum import TipoUsuarioEnum

class RegistroRequest(BaseModel):
    email: EmailStr
    contrasena: str
    nombre: str
    apellido: str
    tipo_usuario: TipoUsuarioEnum

class LoginRequest(BaseModel):
    email: EmailStr
    contrasena: str

class ResetPasswordRequest(BaseModel):
    contrasena_actual: str
    contrasena_nueva: str