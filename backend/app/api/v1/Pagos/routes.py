from fastapi import APIRouter, Depends, Request, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from .schemas import PayRequest, PayResponseList, PaymentResponse, WebhookMPEvent
from .service import payment_service
# from app.services.mercadopago_service import mercadopago_service
from app.models import Pedido
from app.models.enum import EstadoPedidoEnum

router = APIRouter()

@router.post("/pay", response_model=PayResponseList)
async def pagar(payload: PayRequest, db: Session = Depends(get_db)):
    return await payment_service.procesar_pagos(db, payload.ids_pedido)

@router.get("/confirm/paypal/{id_pedido}", response_model=PaymentResponse)
async def confirmar_paypal(
    id_pedido: int,
    token: str,              # PayPal lo manda como query param automáticamente
    db: Session = Depends(get_db)
):
    return await payment_service.confirmar_paypal(db, id_pedido, token)

@router.get("/confirm/stripe/{id_pedido}", response_model=PaymentResponse)
async def confirmar_stripe(id_pedido: int, db: Session = Depends(get_db)):
    return await payment_service.confirmar_stripe(db, id_pedido)

@router.post("/webhook/mercadopago")
async def webhook_mercadopago(
    request: Request,
    db: Session = Depends(get_db)
):
    try:
        evento = await request.json()
        print("Webhook MercadoPago:", evento)
    except Exception:
        return {"status": "ignored"}

    return await payment_service.manejar_webhook_mercadopago(db, evento)

# Solo para pruebas de pagos
@router.patch("/test/pedido/{id_pedido}/estado")
async def cambiar_estado_pedido(
    id_pedido: int,
    estado: EstadoPedidoEnum,
    db: Session = Depends(get_db)
):
    pedido = db.query(Pedido).filter(Pedido.id_pedido == id_pedido).first()
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido no encontrado.")
    
    pedido.estado = estado
    pedido.proveedor_payment_id = None  # resetear también el ID del proveedor
    db.commit()
    db.refresh(pedido)
    
    return {
        "id_pedido": pedido.id_pedido,
        "estado": pedido.estado,
        "proveedor_payment_id": pedido.proveedor_payment_id
    }

# endpoint para probar webhook
@router.post("/webhook/mercadopago/test")
async def webhook_mercadopago_test(
    evento: WebhookMPEvent,
    db: Session = Depends(get_db)
):
    return await payment_service.manejar_webhook_mercadopago(db, evento.dict())