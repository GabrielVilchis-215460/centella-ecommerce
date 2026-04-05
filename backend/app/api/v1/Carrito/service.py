from sqlalchemy.orm import Session
from app.models import Carrito, ItemCarrito, Producto, Pedido, ItemPedido
from app.models.enum import TipoEntregaItemEnum, TipoEntregaEnum
from app.api.v1.Carrito import schemas
from collections import defaultdict
from datetime import datetime
from sqlalchemy.orm import Session
from fastapi import HTTPException

# Faltaria agregar cosas del login

# Funciones auxiliares
def get_producto(db: Session, id_producto: int):
    """
    Funcion que obtiene un Producto activo o lanza un status 404
    """
    producto = db.query(Producto).filter(
        Producto.id_producto == id_producto,
        Producto.activo == True,
    ).first()
    if not producto:
        raise HTTPException(
            status_code=404,
            detail=f"Producto {id_producto} no encontrado o inactivo.",
        )
    return producto

def validar_stock(producto: Producto, cantidad_solicitada: int):
    """
    Funcion que valida que haya stock suficiente
    """
    if producto.cantidad_stock < cantidad_solicitada:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Stock insuficiente para '{producto.nombre}'. "
                f"Disponible: {producto.cantidad_stock}, solicitado: {cantidad_solicitada}."
            ),
        )


def validar_tipo_entrega_compatible(
    producto: Producto,
    tipo_seleccionado: TipoEntregaItemEnum,
):
    """
    Funcion que verifica que el tipo de entrega elegido por el usuario sea compatible
    con lo que el producto permite.
    Reglas:
    - Producto 'envio'  → solo acepta TipoEntregaItemEnum.envio
    - Producto 'fisica' → solo acepta TipoEntregaItemEnum.fisica
    - Producto 'ambas'  → acepta envio o fisica
    """
    tipo_producto = producto.tipo_entrega
    permitidos: set[TipoEntregaItemEnum] = set()

    if tipo_producto == TipoEntregaEnum.envio:
        permitidos = {TipoEntregaItemEnum.envio}
    elif tipo_producto == TipoEntregaEnum.fisica:
        permitidos = {TipoEntregaItemEnum.fisica}
    elif tipo_producto == TipoEntregaEnum.ambas:
        permitidos = {TipoEntregaItemEnum.envio, TipoEntregaItemEnum.fisica}

    if tipo_seleccionado not in permitidos:
        raise HTTPException(
            status_code=400,
            detail=(
                f"El producto '{producto.nombre}' no permite entrega '{tipo_seleccionado}'. "
                f"Opciones válidas: {[t.value for t in permitidos]}."
            ),
        )

# Funciones del carrito
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
    producto = get_producto(db, item.id_producto)
    db_item = db.query(ItemCarrito).filter(
        ItemCarrito.id_carrito == id_carrito,
        ItemCarrito.id_producto == item.id_producto
    ).first()

    if db_item:
        db_item.cantidad += item.cantidad
        if item.tipo_entrega_seleccionado is not None:
            db_item.tipo_entrega_seleccionado = item.tipo_entrega_seleccionado
    else:
        db_item = ItemCarrito(**item.model_dump(), id_carrito=id_carrito)
        db.add(db_item)
    
    db.commit()
    db.refresh(db_item)
    return db_item

def eliminar_item(db: Session, id_item: int):
    """
    Funcion que elimina un item del carrito. 
    Retorna el item eliminado o None si no existe
    """
    db_item = db.query(ItemCarrito).filter(ItemCarrito.id_item == id_item).first()
    if db_item:
        db.delete(db_item)
        db.commit()
    return db_item

def vaciar_carrito(db: Session, id_carrito: int) -> None:
    """
    Funcion que elimina todos los items del carrito sin borrar el carrito
    """
    db.query(ItemCarrito).filter(ItemCarrito.id_carrito == id_carrito).delete()
    db.commit()

def calcular_totales(db: Session, carrito_id: int):
    """
    Funcion que calcula subtotales por item y el total general del carrito
    """
    items = (
        db.query(ItemCarrito)
        .filter(ItemCarrito.id_carrito == carrito_id)
        .all()
    )

    detalles = []
    total_general = 0.0

    for item in items:
        producto = get_producto(db, item.id_producto)
        subtotal = float(item.cantidad * producto.precio)
        total_general += subtotal
        detalles.append(
            schemas.ItemCarritoDetallado(
                id_item=item.id_item,
                id_carrito=item.id_carrito,
                id_producto=item.id_producto,
                cantidad=item.cantidad,
                tipo_entrega_seleccionado=item.tipo_entrega_seleccionado,
                nombre_producto=producto.nombre,
                precio_unitario=float(producto.precio),
                subtotal=subtotal,
            )
        )

    return schemas.TotalesCarrito(items=detalles, total_pagar=total_general)
