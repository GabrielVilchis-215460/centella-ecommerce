from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from .schemas import ServicioCreate, ServicioUpdate, ServicioRead
from . import service
from app.core.deps import require_emprendedora, require_emprendedora_or_admin
from app.models.emprendedora import Emprendedora
from app.models.usuario import Usuario

router = APIRouter(prefix="/servicios", tags=["Servicios"])

@router.get("/", response_model=list[ServicioRead])
def listar(
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_emprendedora),
):
    emp = db.query(Emprendedora).filter(
        Emprendedora.id_usuario == current_user.id_usuario
    ).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Perfil no encontrado")
    return service.get_by_emprendedora(db, emp.id_emprendedora, skip, limit)

@router.get("/{id_servicio}", response_model=ServicioRead)
def obtener(id_servicio: int, db: Session = Depends(get_db)):
    return service.get_by_id(db, id_servicio)

@router.post("/", response_model=ServicioRead, status_code=status.HTTP_201_CREATED)
def crear(
    data: ServicioCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_emprendedora),
):
    emp = db.query(Emprendedora).filter(
        Emprendedora.id_usuario == current_user.id_usuario
    ).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Perfil no encontrado")
    return service.create(db, data, emp.id_emprendedora)

@router.put("/{id_servicio}", response_model=ServicioRead, dependencies=[Depends(require_emprendedora_or_admin)]) 
def actualizar(id_servicio: int, data: ServicioUpdate, db: Session = Depends(get_db)):
    return service.update(db, id_servicio, data)

@router.delete("/{id_servicio}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_emprendedora_or_admin)])
def eliminar(id_servicio: int, db: Session = Depends(get_db)):
    service.delete(db, id_servicio)

@router.get("/{id_servicio}/detalle")
def detalle_servicio(id_servicio: int, db: Session = Depends(get_db)):
    return service.get_detalle_completo(db, id_servicio)