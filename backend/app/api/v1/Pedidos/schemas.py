from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from decimal import Decimal
from app.models.enum import EstadoPedidoEnum, MetodoPagoEnum


class PedidoCreate(BaseModel):
    id_emprendedora: int
    subtotal: Decimal
    costo_envio: Decimal = 0
    metodo_pago: MetodoPagoEnum
    id_direccion_envio: Optional[int] = None


class PedidoUpdate(BaseModel):
    estado: Optional[EstadoPedidoEnum] = None
    numero_rastreo: Optional[str] = None
    codigo_qr_url: Optional[str] = None
    proveedor_payment_id: Optional[str] = None


class PedidoRead(BaseModel):
    id_pedido: int
    id_cliente: int
    id_emprendedora: int
    fecha_pedido: datetime
    estado: EstadoPedidoEnum
    subtotal: Decimal
    costo_envio: Decimal
    total: Decimal
    metodo_pago: MetodoPagoEnum
    id_direccion_envio: Optional[int]
    numero_rastreo: Optional[str]
    codigo_qr_url: Optional[str]
    proveedor_payment_id: Optional[str]

    class Config:
        from_attributes = True