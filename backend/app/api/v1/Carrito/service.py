from sqlalchemy.orm import Session
from app.models import Carrito, ItemCarrito
from app.api.v1.Carrito import schemas

def get_carrito_by_usuario(db: Session, id_usuario: int):
    # Busca el carrito del cliente o lo crea si no existe
    carrito = db.query(Carrito).filter(Carrito.id_cliente == id_usuario).first()
    if not carrito:
        carrito = Carrito(id_cliente=id_usuario)
        db.add(carrito)
        db.commit()
        db.refresh(carrito)
    return carrito

def agregar_item_al_carrito(db: Session, id_carrito: int, item: schemas.ItemCarritoCreate):
    # Verificar si el producto ya está en el carrito
    db_item = db.query(ItemCarrito).filter(
        ItemCarrito.id_carrito == id_carrito,
        ItemCarrito.id_producto == item.id_producto
    ).first()

    if db_item:
        db_item.cantidad += item.cantidad
    else:
        db_item = ItemCarrito(**item.model_dump(), id_carrito=id_carrito)
        db.add(db_item)
    
    db.commit()
    db.refresh(db_item)
    return db_item

def eliminar_item(db: Session, id_item: int):
    db_item = db.query(ItemCarrito).filter(ItemCarrito.id_item == id_item).first()
    if db_item:
        db.delete(db_item)
        db.commit()
    return db_item