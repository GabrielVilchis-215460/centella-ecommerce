from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from pydantic import BaseModel, EmailStr
from app.core.database import get_db
from app.core.security import hash_password, verify_password, create_access_token, create_refresh_token
from app.core.deps import get_current_user
from app.models.usuario import Usuario
from app.models.enum import TipoUsuarioEnum

router = APIRouter(prefix="/auth", tags=["Auth"])

# Schemas 
class RegistroRequest(BaseModel):
    email: EmailStr
    contrasena: str
    nombre: str
    apellido: str
    tipo_usuario: TipoUsuarioEnum

class LoginRequest(BaseModel):
    email: EmailStr
    contrasena: str

# Endpoints 
@router.post("/register", status_code=201)
def register(data: RegistroRequest, db: Session = Depends(get_db)):
    # Verificar si el email ya existe
    if db.query(Usuario).filter(Usuario.email == data.email).first():
        raise HTTPException(status_code=400, detail="El email ya está registrado")

    if data.tipo_usuario == TipoUsuarioEnum.administrador:
        raise HTTPException(status_code=403, detail="No se puede registrar un administrador")

    nuevo_usuario = Usuario(
        email=data.email,
        contrasena=hash_password(data.contrasena),
        nombre=data.nombre,
        apellido=data.apellido,
        tipo_usuario=data.tipo_usuario,
        fecha_registro=datetime.utcnow()
    )
    db.add(nuevo_usuario)
    db.commit()
    db.refresh(nuevo_usuario)

    return {"message": "Usuario creado exitosamente", "id": nuevo_usuario.id_usuario}

@router.post("/login")
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(Usuario).filter(Usuario.email == data.email).first()

    if not user or not verify_password(data.contrasena, user.contrasena):
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")

    return {
        "access_token": create_access_token({"sub": str(user.id_usuario)}),
        "refresh_token": create_refresh_token({"sub": str(user.id_usuario)}),
        "token_type": "bearer",
        "tipo_usuario": user.tipo_usuario
    }

@router.get("/me")
def get_me(current_user: Usuario = Depends(get_current_user)):
    return {
        "id": current_user.id_usuario,
        "email": current_user.email,
        "nombre": current_user.nombre,
        "apellido": current_user.apellido,
        "tipo_usuario": current_user.tipo_usuario,
        "fecha_registro": current_user.fecha_registro
    }