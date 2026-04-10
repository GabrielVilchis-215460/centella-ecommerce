from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db 
from app.api.v1.Carrito.service import convertir_a_pedido, get_carrito_by_usuario, agregar_item_al_carrito, eliminar_item, calcular_totales
from app.api.v1.Carrito.schemas import Carrito, ItemCarrito, ItemCarritoCreate, ItemCarritoUpdate, TotalesCarrito, CheckoutRequest, CheckoutResponse, PedidoResumen
from app.core.deps import get_current_user, require_cliente
from app.models.usuario import Usuario

router = APIRouter(prefix="/cart", tags=["Cart"])

@router.get("/", response_model=Carrito)
def leer_carrito(id_usuario: int, db: Session = Depends(get_db), current_user: Usuario = Depends(require_cliente)):
    """Obtiene el carrito del usuario actual."""
    return get_carrito_by_usuario(db, id_usuario=id_usuario)

@router.post("/items", response_model=ItemCarrito)
def agregar_producto(
    id_usuario: int, 
    item: ItemCarritoCreate, 
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_cliente)
):
    """Agrega un producto al carrito del usuario."""
    carrito = get_carrito_by_usuario(db, id_usuario=id_usuario)
    return agregar_item_al_carrito(db, id_carrito=carrito.id_carrito, item=item)

@router.delete("/items/{id_item}")
def quitar_producto(id_item: int, db: Session = Depends(get_db), current_user: Usuario = Depends(require_cliente)):
    """Elimina un item específico del carrito."""
    item_eliminado = eliminar_item(db, id_item=id_item)
    if not item_eliminado:
        raise HTTPException(status_code=404, detail="Item no encontrado")
    return {"message": "Producto eliminado del carrito"}

@router.patch("/items/{id_item}", response_model=ItemCarrito)
def actualizar_item(
    id_item: int,
    datos:ItemCarritoUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_cliente),
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

@router.get("/totales", response_model=TotalesCarrito)
def obtener_totales(id_usuario: int, db: Session = Depends(get_db), current_user: Usuario = Depends(require_cliente)):
    """Calcula subtotales por item y el total general del carrito."""
    carrito = get_carrito_by_usuario(db, id_usuario)
    return calcular_totales(db, carrito.id_carrito)

# resumen de pedido
@router.post("/checkout", response_model=CheckoutResponse, status_code=201)
async def finalizar_compra(
    id_usuario: int,
    checkout: CheckoutRequest,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_cliente),
):
    """
    Valida stock y tipo de entrega, descuenta inventario, genera un pedido
    por emprendedora y vacía el carrito.

    El request debe incluir el método de pago, la dirección de envío
    (si algún item requiere envío) y la selección de tipo de entrega
    por cada item del carrito.
    """
    pedidos = await convertir_a_pedido(db, id_usuario, checkout)

    resumenes = [
        PedidoResumen(
            id_pedido=p.id_pedido,
            id_emprendedora=p.id_emprendedora,
            subtotal=float(p.subtotal),
            costo_envio=float(p.costo_envio),
            total=float(p.total),
            requiere_envio=any(
                i.tipo_entrega.value == "envio" for i in p.items
            ),
            requiere_qr=any(
                i.tipo_entrega.value == "fisica" for i in p.items
            ),
        )
        for p in pedidos
    ]

    return CheckoutResponse(
        status="success",
        metodo_pago=checkout.metodo_pago,
        pedidos=resumenes,
        total_general=sum(r.total for r in resumenes),
    )