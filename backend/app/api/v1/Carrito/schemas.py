from pydantic import BaseModel, ConfigDict, model_validator
from typing import List, Optional
from app.models.enum import TipoEntregaItemEnum, MetodoPagoEnum

class ItemCarritoBase(BaseModel):
    id_producto: int
    cantidad: int = 1
    tipo_entrega_seleccionado: Optional[TipoEntregaItemEnum] = None

class ItemCarritoCreate(ItemCarritoBase):
    pass

class ItemCarritoUpdate(BaseModel):
    """Actualiza cantidad de un item existente (PATCH /cart/items/{id_item})."""
    cantidad: Optional[int] = None
    #tipo_entrega_seleccionado: Optional[TipoEntregaItemEnum] = None

class ItemCarrito(ItemCarritoBase):
    id_item: int
    id_carrito: int
    
    model_config = ConfigDict(from_attributes=True)

class Carrito(BaseModel):
    id_carrito: int
    id_cliente: int
    items: List[ItemCarrito] = []

    model_config = ConfigDict(from_attributes=True)

class ItemCarritoDetallado(ItemCarrito):
    nombre_producto: str
    precio_unitario: float
    subtotal: float

    model_config = ConfigDict(from_attributes=False)

class TotalesCarrito(BaseModel):
    items: List[ItemCarritoDetallado]
    total_pagar: float

class ItemCheckout(BaseModel):
    """
    Selección del usuario por cada item al momento del checkout.
    """
    id_item: int
    tipo_entrega_seleccionado: TipoEntregaItemEnum

class CheckoutRequest(BaseModel):
    metodo_pago: MetodoPagoEnum
    id_direccion_envio: Optional[int] = None
    items: List[ItemCheckout]

    @model_validator(mode="after")
    def validar_direccion_si_hay_envio(self) -> "CheckoutRequest":
        """
        Si algún item eligió envío, la dirección es obligatoria.
        """
        tipos = {i.tipo_entrega_seleccionado for i in self.items}
        requiere_envio = (
            TipoEntregaItemEnum.envio in tipos
            or TipoEntregaItemEnum.ambas in tipos
        )
        if requiere_envio and not self.id_direccion_envio:
            raise ValueError(
                "id_direccion_envio es requerido cuando algún item seleccionó envío."
            )
        return self
    
class PedidoResumen(BaseModel):
    """Resumen de un pedido creado durante el checkout."""
    id_pedido: int
    id_emprendedora: int
    subtotal: float
    costo_envio: float
    total: float
    requiere_envio: bool
    requiere_qr: bool

class CheckoutResponse(BaseModel):
    """
    El checkout genera un pedido por emprendedora involucrada.
    Se retornan todos para que el frontend pueda disparar
    los flujos de pago (Stripe/PayPal/SPEI) o QR correspondientes.
    """
    status: str
    metodo_pago: MetodoPagoEnum
    pedidos: List[PedidoResumen]
    total_general: float