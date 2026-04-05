from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db 
from . import service, schemas

router = APIRouter(prefix="/cart", tags=["Cart"])
# falta endpoint para vaciar el carrito manualmente

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

@router.patch("/items/{id_item}", response_model=schemas.ItemCarrito)
def actualizar_item(
    id_item: int,
    datos: schemas.ItemCarritoUpdate,
    db: Session = Depends(get_db),
):
    """Actualiza la cantidad de un item existente."""
    from app.models import ItemCarrito as ItemCarritoModel
    db_item = db.query(ItemCarritoModel).filter(
        ItemCarritoModel.id_item == id_item
    ).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item no encontrado.")

    update_data = datos.model_dump(exclude_unset=True)
    for campo, valor in update_data.items():
        setattr(db_item, campo, valor)

    db.commit()
    db.refresh(db_item)
    return db_item

@router.get("/totales", response_model=schemas.TotalesCarrito)
def obtener_totales(id_usuario: int, db: Session = Depends(get_db)):
    """Calcula subtotales por item y el total general del carrito."""
    carrito = service.get_carrito_by_usuario(db, id_usuario)
    return service.calcular_totales(db, carrito.id_carrito)