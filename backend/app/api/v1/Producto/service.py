from sqlalchemy.orm import Session
from sqlalchemy import select
from app.models.producto import Producto
from .schemas import ProductoCreate, ProductoUpdate
from fastapi import HTTPException, status
from app.models.imagen import Imagen

def get_all(db: Session, skip: int = 0, limit: int = 20) -> list[Producto]:
    return db.execute(select(Producto).offset(skip).limit(limit)).scalars().all()


def get_by_id(db: Session, id_producto: int) -> Producto:
    obj = db.get(Producto, id_producto)
    if not obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Producto no encontrado")
    return obj


def create(db: Session, data: ProductoCreate) -> Producto:
    obj = Producto(**data.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


def update(db: Session, id_producto: int, data: ProductoUpdate) -> Producto:
    obj = get_by_id(db, id_producto)
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(obj, field, value)
    db.commit()
    db.refresh(obj)
    return obj


def delete(db: Session, id_producto: int) -> None:
    obj = get_by_id(db, id_producto)
    db.delete(obj)
    db.commit()

def get_imagenes_by_producto(db: Session, id_producto: int) -> list[Imagen]:
    """Obtiene todas las imágenes asociadas a un producto."""
    # Primero verificamos que el producto exista usando tu función existente
    get_by_id(db, id_producto) 
    
    # Consultamos las imágenes
    return db.execute(
        select(Imagen)
        .where(
            Imagen.entity_type == "producto",
            Imagen.entity_id == id_producto
        )
        .order_by(Imagen.orden)
    ).scalars().all()