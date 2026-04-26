from pydantic import BaseModel
from typing import List


class SummarySchema(BaseModel):
    total_products: int
    total_orders: int
    revenue: float


class PedidoSimpleSchema(BaseModel):
    id_pedido: int
    fecha_creacion: str  
    estado: str

    class Config:
        from_attributes = True


class DashboardEmprendedoraResponse(BaseModel):
    summary: SummarySchema
    recent_orders: List[PedidoSimpleSchema]