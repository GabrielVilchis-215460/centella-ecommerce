from sqlalchemy.orm import Session
from sqlalchemy import select
from app.models.servicio import Servicio
from .schemas import ServicioCreate, ServicioUpdate
from fastapi import HTTPException, status


def get_all(db: Session, skip: int = 0, limit: int = 20) -> list[Servicio]:
    return db.execute(select(Servicio).offset(skip).limit(limit)).scalars().all()


def get_by_id(db: Session, id_servicio: int) -> Servicio:
    obj = db.get(Servicio, id_servicio)
    if not obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Servicio no encontrado")
    return obj


def create(db: Session, data: ServicioCreate, id_emprendedora: int) -> Servicio:
    obj = Servicio(**data.model_dump(), id_emprendedora=id_emprendedora)
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


def update(db: Session, id_servicio: int, data: ServicioUpdate) -> Servicio:
    obj = get_by_id(db, id_servicio)
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(obj, field, value)
    db.commit()
    db.refresh(obj)
    return obj


def delete(db: Session, id_servicio: int) -> None:
    obj = get_by_id(db, id_servicio)
    db.delete(obj)
    db.commit()

def get_by_emprendedora(db: Session, id_emprendedora: int, skip: int = 0, limit: int = 20):
    return db.execute(
        select(Servicio)
        .where(Servicio.id_emprendedora == id_emprendedora)
        .offset(skip).limit(limit)
    ).scalars().all()