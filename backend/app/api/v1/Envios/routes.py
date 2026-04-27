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
@router.post("/cotizar")
async def cotizar(body: CotizarRequest, current_user: Usuario = Depends(require_cliente)):
    """
    Retorna tarifas de envío disponibles para la dirección del cliente.
    """
    tarifas = await servicio_cotizar(body)
    return {"tarifas": tarifas}


@router.post("/generar-etiqueta", response_model=EtiquetaResponse)
async def generar_etiqueta(body: GenerarEtiquetaRequest, current_user: Usuario = Depends(require_cliente)):
    """
    Genera la etiqueta de envío y retorna el tracking number.
    """
    return await servicio_generar_etiqueta(body)

@router.post("/asignar-envio")
async def asignar_envio(pedido_id: int, db: AsyncSession = Depends(get_db), current_user: Usuario = Depends(require_cliente)):
    return await service_asignar_envio(pedido_id, db)

# Endpoints para probar ciertas features
# Este endpoint es solo para probar el rastreo
@router.get("/rastrear/{tracking_number}", response_model=TrackingResponse)
async def rastrear(tracking_number: str, current_user: Usuario = Depends(require_cliente)):
    """
    Retorna el estado y eventos del envío.
    """
    return await rastrear_pedido(tracking_number)

# Para probar el envio de correos
@router.post("/test-envio")
async def test_email(email: str, pedido: int, current_user: Usuario = Depends(require_admin)):
    """
    Ruta rápida para probar el envío sin crear un pedido real.
    Uso: /shipping/test-envio?email=tu_correo@gmail.com&pedido=1
    """
    qr_base64 = _generar_qr_base64(pedido)

    await enviar_correo_pedido(
        email_destino=email,
        nombre_cliente="Steven",
        pedido_id=pedido,
        tiene_envio=True,
        tiene_fisica=True,
        tracking_number="794797531854",
        label_url="https://s3.us-east-2.amazonaws.com/envia-staging/uploads/fedex/794797531854481369d32aaf8f8bc.pdf",
        track_url="https://tracking.envia.com/794797531854",
        qr_base64=qr_base64,
    )
    return {"message": "Correo enviado, revisa tu bandeja de entrada"}

# Para probar la generacion de codigos QRs
@router.get("/qr/test/{pedido_id}")
async def test_qr(pedido_id: int, current_user: Usuario = Depends(require_admin)):
    qr_base64 = _generar_qr_base64(pedido_id)
    img_bytes = base64.b64decode(qr_base64)

    from PIL import Image, ImageDraw, ImageFont
    from io import BytesIO

    qr_img = Image.open(BytesIO(img_bytes)).convert("RGB")

    ancho, alto = qr_img.size
    espacio_texto = 40
    nueva_img = Image.new("RGB", (ancho, alto + espacio_texto), "white")
    nueva_img.paste(qr_img, (0, 0))

    draw = ImageDraw.Draw(nueva_img)
    texto = f"Número de pedido: #{pedido_id}"
    draw.text((ancho // 2, alto + 10), texto, fill="black", anchor="mt")

    buf = BytesIO()
    nueva_img.save(buf, format="PNG")

    return Response(content=buf.getvalue(), media_type="image/png")