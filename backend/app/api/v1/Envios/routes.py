from fastapi import APIRouter
from app.api.v1.Envios.schemas import (
    CotizarRequest,
    GenerarEtiquetaRequest,
    EtiquetaResponse,
    TrackingResponse
)
from app.api.v1.Envios.service import (
    servicio_cotizar,
    servicio_generar_etiqueta,
    rastrear_pedido,
    service_asignar_envio
)

from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from fastapi import Depends, Response
from app.api.v1.Envios.service import _generar_qr_base64
import base64
from app.services.email_service import enviar_correo_pedido
from app.core.deps import require_cliente, require_emprendedora_or_admin, require_admin
from app.models.usuario import Usuario

router = APIRouter(prefix="/envios", tags=["Envios"])
@router.post("/cotizar", summary="Cotizar mas opciones de envio")
async def cotizar(body: CotizarRequest, current_user: Usuario = Depends(require_cliente)):
    """
    Retorna tarifas de envío disponibles para la dirección del cliente.
    """
    tarifas = await servicio_cotizar(body)
    return {"tarifas": tarifas}


@router.post("/generar-etiqueta", response_model=EtiquetaResponse, summary="Generar etiqueta de paquetería")
async def generar_etiqueta(body: GenerarEtiquetaRequest, current_user: Usuario = Depends(require_cliente)):
    """
    Genera la etiqueta de envío y retorna el tracking number.
    """
    return await servicio_generar_etiqueta(body)

@router.post("/asignar-envio", summary="Asignar envío a pedido")
async def asignar_envio(pedido_id: int, db: AsyncSession = Depends(get_db), current_user: Usuario = Depends(require_cliente)):
    return await service_asignar_envio(pedido_id, db)
