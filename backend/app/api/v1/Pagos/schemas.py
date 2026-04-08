from pydantic import BaseModel
from decimal import Decimal
from app.models.enum import MetodoPagoEnum, EstadoPedidoEnum

class PayRequest(BaseModel):
    ids_pedido: list[int]   # Puede venir más de un pedido (un pedido por emprendedora)

# respuesta base del pago
class PaymentResponse(BaseModel):
    id_pedido: int
    metodo_pago: MetodoPagoEnum
    estado: EstadoPedidoEnum
    total: Decimal
    redirect_url: str | None = None
    checkout_id: str | None = None
    ticket_url: str | None = None     

class PayResponseList(BaseModel):
    pagos: list[PaymentResponse]

# Para probar el webhook de mercado pago
class WebhookMPEvent(BaseModel):
    type: str
    action: str | None = None
    data: dict