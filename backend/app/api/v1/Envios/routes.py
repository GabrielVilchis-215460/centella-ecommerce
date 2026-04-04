from fastapi import APIRouter
from app.api.v1.Envios.schemas import (
    CotizarRequest,
    GenerarEtiquetaRequest,
    EtiquetaResponse,
    TrackingResponse
)
from app.api.v1.Envios.service import (
    service_cotizar,
    service_generar_etiqueta,
    service_rastrear,
    service_asignar_envio
)

from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from fastapi import Depends

router = APIRouter(prefix="/shipping", tags=["Shipping"])
@router.post("/cotizar")
async def cotizar(body: CotizarRequest):
    """
    Retorna tarifas de envío disponibles para la dirección del cliente.
    """
    tarifas = await service_cotizar(body)
    return {"tarifas": tarifas}


@router.post("/generar-etiqueta", response_model=EtiquetaResponse)
async def generar_etiqueta(body: GenerarEtiquetaRequest):
    """
    Genera la etiqueta de envío y retorna el tracking number.
    """
    return await service_generar_etiqueta(body)


@router.get("/rastrear/{tracking_number}", response_model=TrackingResponse)
async def rastrear(tracking_number: str):
    """
    Retorna el estado y eventos del envío.
    """
    return await service_rastrear(tracking_number)

@router.post("/asignar-envio")
async def asignar_envio(pedido_id: int, db: AsyncSession = Depends(get_db)):
    return await service_asignar_envio(pedido_id, db)