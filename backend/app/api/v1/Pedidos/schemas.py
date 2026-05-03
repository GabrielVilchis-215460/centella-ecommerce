from pydantic import BaseModel
from decimal import Decimal
from app.models.enum import EstadoPedidoEnum, MetodoPagoEnum, TipoEntregaItemEnum
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class ItemPedidoConfirmacion(BaseModel):
    nombre_producto: str
    cantidad: int
    precio_unitario: Decimal
    tipo_entrega: TipoEntregaItemEnum

    class Config:
        from_attributes = True

class DireccionConfirmacion(BaseModel):
    calle: str
    numero_ext: str | None
    colonia: str
    ciudad: str
    estado: str
    codigo_postal: str
    imagen_url: str | None = None

    class Config:
        from_attributes = True

class ConfirmacionPedidoResponse(BaseModel):
    id_pedido: int
    estado: EstadoPedidoEnum
    metodo_pago: MetodoPagoEnum
    subtotal: Decimal
    costo_envio: Decimal
    total: Decimal
    items: list[ItemPedidoConfirmacion]

    # Envío
    tiene_envio: bool
    numero_rastreo: str | None = None
    track_url: str | None = None
    direccion_envio: DireccionConfirmacion | None = None

    # Física
    tiene_fisica: bool
    codigo_qr_url: str | None = None
    redes_sociales: dict | None = None  # de la emprendedora

    class Config:
        from_attributes = True

class PedidoCreate(BaseModel):
    id_emprendedora: int
    subtotal: Decimal
    costo_envio: Decimal = 0
    metodo_pago: MetodoPagoEnum
    id_direccion_envio: Optional[int] = None


class PedidoUpdate(BaseModel):
    estado: Optional[EstadoPedidoEnum] = None
    #numero_rastreo: Optional[str] = None
    #codigo_qr_url: Optional[str] = None
    #proveedor_payment_id: Optional[str] = None

class ItemPedidoRead(BaseModel):
    id_item: int
    producto_id: int
    nombre: str
    cantidad: int
    precio_unitario: float
    subtotal: float
    imagen_url: Optional[str] = None
    
class ClienteRead(BaseModel):
    id: int
    nombre: str
    email: str

class PedidoRead(BaseModel):
    id_pedido: int
    numero_rastreo: Optional[str] = None
    tipo_entrega: Optional[str] = None
    estado: EstadoPedidoEnum
    fecha_pedido: Optional[datetime] = None
    total: Optional[float] = None
    cliente: Optional[ClienteRead] = None
    items: Optional[List[ItemPedidoRead]] = None

    class Config:
        from_attributes = True