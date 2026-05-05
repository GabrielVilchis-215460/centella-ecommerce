from sqlalchemy.orm import Session
from sqlalchemy import select
from app.models.producto import Producto
from .schemas import ProductoCreate, ProductoUpdate
from fastapi import HTTPException, status
from app.models.imagen import Imagen
from app.models.emprendedora import Emprendedora
from app.models.usuario import Usuario
from app.models.atributo_producto import AtributoProducto


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

def get_detalle_completo(db: Session, id_producto: int) -> dict:
    producto = get_by_id(db, id_producto)
    emprendedora = db.query(Emprendedora).filter(
        Emprendedora.id_emprendedora == producto.id_emprendedora
    ).first()
    usuario = db.query(Usuario).filter(
        Usuario.id_usuario == emprendedora.id_usuario
    ).first() if emprendedora else None
    imagenes = get_imagenes_by_producto(db, id_producto)
    atributos = db.query(AtributoProducto).filter(
        AtributoProducto.id_producto == id_producto
    ).all()

    return {
        "id_producto":      producto.id_producto,
        "nombre":           producto.nombre,
        "descripcion":      producto.descripcion,
        "precio":           float(producto.precio),
        "cantidad_stock":   producto.cantidad_stock,
        "tipo_entrega":     producto.tipo_entrega.value,
        "activo":           producto.activo,
        "imagenes":         [{"url": img.url, "orden": img.orden} for img in imagenes],
        "atributos": [
            {
                "tipo":  a.tipo,
                "valor": a.valor,
                "atributo_activo": a.atributo_activo,
            }
            for a in atributos
        ],
        "emprendedora": {
            "id_emprendedora":    emprendedora.id_emprendedora,
            "nombre_negocio":     emprendedora.nombre_negocio,
            "descripcion_negocio":emprendedora.descripcion_negocio,
            "logo_url":           emprendedora.logo_url,
            "nombre_vendedora":   f"{usuario.nombre} {usuario.apellido}" if usuario else "",
            "verificada":         emprendedora.estado_verificacion.value == "verificada",
            "color_hex":          emprendedora.color_emprendedora_hex,
        } if emprendedora else None,
    }