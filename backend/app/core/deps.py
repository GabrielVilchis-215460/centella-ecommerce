from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import decode_token
from app.models.usuario import Usuario
from app.models.enum import TipoUsuarioEnum

security = HTTPBearer()

# Verificar que el token sea válido
def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> Usuario:
    token = credentials.credentials
    payload = decode_token(token)

    if not payload:
        raise HTTPException(status_code=401, detail="Token inválido o expirado")

    user = db.query(Usuario).filter(Usuario.id_usuario == int(payload["sub"])).first()

    if not user:
        raise HTTPException(status_code=401, detail="Usuario no encontrado")

    return user

# Dependencias por rol 
def require_cliente(current_user: Usuario = Depends(get_current_user)) -> Usuario:
    if current_user.tipo_usuario != TipoUsuarioEnum.cliente:
        raise HTTPException(status_code=403, detail="Acceso solo para clientes")
    return current_user

def require_emprendedora(current_user: Usuario = Depends(get_current_user)) -> Usuario:
    if current_user.tipo_usuario != TipoUsuarioEnum.emprendedora:
        raise HTTPException(status_code=403, detail="Acceso solo para emprendedoras")
    return current_user

def require_admin(current_user: Usuario = Depends(get_current_user)) -> Usuario:
    if current_user.tipo_usuario != TipoUsuarioEnum.administrador:
        raise HTTPException(status_code=403, detail="Acceso solo para administradores")
    return current_user

def require_emprendedora_or_admin(current_user: Usuario = Depends(get_current_user)) -> Usuario:
    allowed = {TipoUsuarioEnum.emprendedora, TipoUsuarioEnum.administrador}
    if current_user.tipo_usuario not in allowed:
        raise HTTPException(status_code=403, detail="Acceso no autorizado")
    return current_user