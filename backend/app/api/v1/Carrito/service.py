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

# ---------------------------------------------------------------------------
# Checkout
# ---------------------------------------------------------------------------

def convertir_a_pedido(
    db: Session,
    id_usuario: int,
    checkout: schemas.CheckoutRequest,
) -> list[Pedido]:
    """
    Valida stock y tipo de entrega, luego genera un Pedido por cada
    emprendedora involucrada en el carrito. Vacía el carrito al final.

    Retorna la lista de pedidos creados.
    """
    carrito = get_carrito_by_usuario(db, id_usuario)

    if not carrito.items:
        raise HTTPException(status_code=400, detail="El carrito está vacío.")

    # Mapear las selecciones del request por id_item para acceso rápido
    selecciones: dict[int, schemas.ItemCheckout] = {
        s.id_item: s for s in checkout.items
    }

    # Verificar que el request cubre todos los items del carrito
    ids_carrito = {item.id_item for item in carrito.items}
    ids_checkout = set(selecciones.keys())
    faltantes = ids_carrito - ids_checkout
    if faltantes:
        raise HTTPException(
            status_code=400,
            detail=f"Faltan selecciones de entrega para los items: {faltantes}",
        )

    # --- Validaciones previas (sin modificar nada aún) ---
    productos: dict[int, Producto] = {}
    for item in carrito.items:
        producto = get_producto(db, item.id_producto)
        tipo_seleccionado = selecciones[item.id_item].tipo_entrega_seleccionado
        validar_tipo_entrega_compatible(producto, tipo_seleccionado)
        validar_stock(producto, item.cantidad)
        productos[item.id_producto] = producto

    # --- Agrupar items por emprendedora ---
    grupos: dict[int, list[ItemCarrito]] = defaultdict(list)
    for item in carrito.items:
        id_emprendedora = productos[item.id_producto].id_emprendedora
        grupos[id_emprendedora].append(item)

    # --- Crear un Pedido por emprendedora ---
    pedidos_creados: list[Pedido] = []
    ahora = datetime.utcnow()

    for id_emprendedora, items_grupo in grupos.items():
        subtotal = sum(
            float(productos[item.id_producto].precio) * item.cantidad
            for item in items_grupo
        )

        # costo_envio lo puede calcular el módulo de envíos posteriormente;
        # por ahora se deja en 0 y se actualiza cuando se procese el envío.
        costo_envio = 0.0
        total = subtotal + costo_envio

        nuevo_pedido = Pedido(
            id_cliente=id_usuario,
            id_emprendedora=id_emprendedora,
            fecha_pedido=ahora,
            estado="pendiente",
            subtotal=subtotal,
            costo_envio=costo_envio,
            total=total,
            metodo_pago=checkout.metodo_pago,
            id_direccion_envio=checkout.id_direccion_envio,
            # codigo_qr_url lo genera el módulo de QR después
            codigo_qr_url=None,
        )
        db.add(nuevo_pedido)
        db.flush()  # Necesario para obtener id_pedido antes de crear los ItemPedido

        # Crear ItemPedido (snapshot del producto al momento de compra)
        for item in items_grupo:
            producto = productos[item.id_producto]
            tipo_entrega = selecciones[item.id_item].tipo_entrega_seleccionado

            db.add(ItemPedido(
                id_pedido=nuevo_pedido.id_pedido,
                id_producto=item.id_producto,
                nombre_producto=producto.nombre,       # snapshot: no cambia si el producto cambia
                precio_unitario=producto.precio,        # snapshot: precio al momento de compra
                cantidad=item.cantidad,
                tipo_entrega=tipo_entrega,
            ))

            # Descontar stock
            producto.cantidad_stock -= item.cantidad

        pedidos_creados.append(nuevo_pedido)

    # --- Vaciar carrito y confirmar toda la transacción ---
    vaciar_carrito(db, carrito.id_carrito)
    db.commit()

    for pedido in pedidos_creados:
        db.refresh(pedido)

    return pedidos_creados
