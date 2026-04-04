from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from app.models.enum import TipoEntregaItemEnum

class ItemCarritoBase(BaseModel):
    id_producto: int
    cantidad: int = 1
    tipo_entrega_seleccionado: Optional[TipoEntregaItemEnum] = None

class ItemCarritoCreate(ItemCarritoBase):
    pass

class ItemCarritoUpdate(BaseModel):
    cantidad: Optional[int] = None
    tipo_entrega_seleccionado: Optional[TipoEntregaItemEnum] = None

class ItemCarrito(ItemCarritoBase):
    id_item: int
    id_carrito: int
    
    model_config = ConfigDict(from_attributes=True)

class Carrito(BaseModel):
    id_carrito: int
    id_cliente: int
    items: List[ItemCarrito] = []

    model_config = ConfigDict(from_attributes=True)