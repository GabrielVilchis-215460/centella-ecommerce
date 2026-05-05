from sqlalchemy.orm import Session
from sqlalchemy import select
from app.models.producto import Producto
from .schemas import ProductoCreate, ProductoUpdate
from fastapi import HTTPException, status
from app.models.imagen import Imagen

def get_all(db: Session, skip: int = 0, limit: int = 20) -> list[Producto]:
    return db.execute(select(Producto).offset(skip).limit(limit)).scalars().all()

def get_by_emprendedora(db: Session, id_emprendedora: int, skip: int = 0, limit: int = 20):
    return db.execute(
        select(Producto)
        .where(Producto.id_emprendedora == id_emprendedora)
        .offset(skip).limit(limit)
    ).scalars().all()

def get_by_id(db: Session, id_producto: int) -> Producto:
    obj = db.get(Producto, id_producto)
    if not obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Producto no encontrado")
    return obj

def create(db: Session, data: ProductoCreate, id_emprendedora: int) -> Producto:
    obj = Producto(**data.model_dump(), id_emprendedora=id_emprendedora)
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj

def update(db: Session, id_producto: int, data: ProductoUpdate) -> Producto:
    obj = get_by_id(db, id_producto)
    
    update_data = data.model_dump(exclude_unset=True)
    
    for field, value in update_data.items():
        # SI el valor es None y el campo es id_categoria, NO lo actualizamos
        if field == "id_categoria" and value is None:
            continue
        setattr(obj, field, value)
    
    try:
        db.commit()
        db.refresh(obj)
    except Exception as e:
        db.rollback()
        raise e
        
    # Inyectamos imágenes para que el front no las pierda[cite: 4]
    obj.imagenes = get_imagenes_by_producto(db, id_producto)
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