from fastapi import APIRouter, Depends, Request, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from .schemas import PayRequest, PayResponseList, PaymentResponse
from .service import payment_service
from app.models import Pedido
from app.models.enum import EstadoPedidoEnum
from app.core.deps import require_cliente, require_emprendedora
from app.models.usuario import Usuario

router = APIRouter()

@router.post("/pay", response_model=PayResponseList)
async def pagar(payload: PayRequest, db: Session = Depends(get_db), current_user: Usuario = Depends(require_cliente)):
    return await payment_service.procesar_pagos(db, payload.ids_pedido)

@router.get("/confirm/paypal/{id_pedido}", response_model=PaymentResponse)
async def confirmar_paypal(
    id_pedido: int,
    token: str,              # PayPal lo manda como query param automáticamente
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_cliente)
):
    return await payment_service.confirmar_paypal(db, id_pedido, token)

@router.get("/confirm/stripe/{id_pedido}", response_model=PaymentResponse)
async def confirmar_stripe(id_pedido: int, db: Session = Depends(get_db), current_user: Usuario = Depends(require_cliente) ):
    return await payment_service.confirmar_stripe(db, id_pedido)

# Solo para pruebas de pagos
@router.patch("/test/pedido/{id_pedido}/estado")
async def cambiar_estado_pedido(
    id_pedido: int,
    estado: EstadoPedidoEnum,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_emprendedora),
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
