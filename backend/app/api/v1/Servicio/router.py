from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from .schemas import ServicioCreate, ServicioUpdate, ServicioRead
from . import service

router = APIRouter(prefix="/servicios", tags=["Servicios"])


@router.get("/", response_model=list[ServicioRead])
def listar(skip: int = 0, limit: int = 20, db: Session = Depends(get_db)):
    return service.get_all(db, skip, limit)


@router.get("/{id_servicio}", response_model=ServicioRead)
def obtener(id_servicio: int, db: Session = Depends(get_db)):
    return service.get_by_id(db, id_servicio)


@router.post("/", response_model=ServicioRead, status_code=status.HTTP_201_CREATED)
def crear(data: ServicioCreate, db: Session = Depends(get_db)):
    return service.create(db, data)


@router.put("/{id_servicio}", response_model=ServicioRead)
def actualizar(id_servicio: int, data: ServicioUpdate, db: Session = Depends(get_db)):
    return service.update(db, id_servicio, data)


@router.delete("/{id_servicio}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar(id_servicio: int, db: Session = Depends(get_db)):
    service.delete(db, id_servicio)