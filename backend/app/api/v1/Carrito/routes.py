from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db 
from . import service, schemas

router = APIRouter(prefix="/cart", tags=["Cart"])

@router.get("/", response_model=schemas.Carrito)
def leer_carrito(id_usuario: int, db: Session = Depends(get_db)):
    """Obtiene el carrito del usuario actual."""
    return service.get_carrito_by_usuario(db, id_usuario=id_usuario)

@router.post("/items", response_model=schemas.ItemCarrito)
def agregar_producto(
    id_usuario: int, 
    item: schemas.ItemCarritoCreate, 
    db: Session = Depends(get_db)
):
    """Agrega un producto al carrito del usuario."""
    carrito = service.get_carrito_by_usuario(db, id_usuario=id_usuario)
    return service.agregar_item_al_carrito(db, id_carrito=carrito.id_carrito, item=item)

@router.delete("/items/{id_item}")
def quitar_producto(id_item: int, db: Session = Depends(get_db)):
    """Elimina un item específico del carrito."""
    item_eliminado = service.eliminar_item(db, id_item=id_item)
    if not item_eliminado:
        raise HTTPException(status_code=404, detail="Item no encontrado")
    return {"message": "Producto eliminado del carrito"}