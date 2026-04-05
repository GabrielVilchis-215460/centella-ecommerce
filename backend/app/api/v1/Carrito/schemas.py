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