from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.pedido import Pedido
from app.models.enum import MetodoPagoEnum, EstadoPedidoEnum
from .schemas import PaymentResponse, PayResponseList
from app.services.stripe_service import stripe_service
from app.services.paypal_service import paypal_service
from app.services.mercadopago_service import mercadopago_service
import httpx
from app.config import settings

class PaymentService:

    async def procesar_pagos(
        self, db: Session, ids_pedido: list[int]
    ) -> PayResponseList:
        pedidos = self.get_pedidos(db, ids_pedido)
        resultados = []

        for pedido in pedidos:
            if pedido.estado != EstadoPedidoEnum.pendiente:
                raise HTTPException(
                    status_code=400,
                    detail=f"El pedido {pedido.id_pedido} ya fue procesado."
                )

            match pedido.metodo_pago:
                case MetodoPagoEnum.stripe:
                    resultado = await self._procesar_stripe(db, pedido)
                case MetodoPagoEnum.paypal:
                    resultado = await self._procesar_paypal(db, pedido)
                case MetodoPagoEnum.mercadopago_spei:
                    resultado = await self._procesar_mercadopago(db, pedido)
                case _:
                    raise HTTPException(status_code=400, detail="Metodo de pago no soportado.")

            resultados.append(resultado)

        return PayResponseList(pagos=resultados)

    # --- Stripe ---
    async def _procesar_stripe(self, db: Session, pedido: Pedido):
        session = stripe_service.create_checkout_session(
            amount=int(pedido.total * 100),
            currency="mxn",
            product_name=f"Pedido #{pedido.id_pedido}",
            success_url=f"{settings.APP_URL}/payments/confirm/stripe/{pedido.id_pedido}",
            cancel_url=f"{settings.APP_URL}/checkout",
            metadata={"id_pedido": str(pedido.id_pedido)}
        )
        if not session:
            raise HTTPException(status_code=502, detail="Error al crear sesión de Stripe.")

        pedido.proveedor_payment_id = session["id"]
        db.commit()

        return PaymentResponse(
            id_pedido=pedido.id_pedido,
            metodo_pago=pedido.metodo_pago,
            estado=pedido.estado,
            total=pedido.total,
            redirect_url=session["url"]
        )

    # --- PayPal ---
    async def _procesar_paypal(self, db: Session, pedido: Pedido):
        order = await paypal_service.create_order(
            amount=float(pedido.total),
            currency="MXN",
            return_url=f"{settings.APP_URL}/payments/confirm/paypal/{pedido.id_pedido}"
        )

        approval_url = next(
            (link["href"] for link in order["links"] if link["rel"] == "approve"),
            None
        )
        if not approval_url:
            raise HTTPException(status_code=502, detail="Error al crear orden de PayPal.")

        pedido.proveedor_payment_id = order["id"]
        db.commit()

        return PaymentResponse(
            id_pedido=pedido.id_pedido,
            metodo_pago=pedido.metodo_pago,
            estado=pedido.estado,
            total=pedido.total,
            redirect_url=approval_url
        )

    #case MetodoPagoEnum.mercadopago_spei:
       # resultado = await self._procesar_mercadopago(db, pedido)

    # --- Mercado Pago ---
    async def _procesar_mercadopago(self, db: Session, pedido: Pedido):
        cliente = pedido.cliente

        resultado = mercadopago_service.crear_preferencia_checkout(
            pedido=pedido,
            cliente_email=cliente.email
        )

        pedido.proveedor_payment_id = resultado["preference_id"]
        db.commit()

        return PaymentResponse(
            id_pedido=pedido.id_pedido,
            metodo_pago=pedido.metodo_pago,
            estado=pedido.estado,
            total=pedido.total,
            ticket_url=resultado["init_point"]
            #ticket_url=resultado["ticket_url"]  # frontend redirige aquí
        )
    # --- Confirmación PayPal (tras redirect) ---
    async def confirmar_paypal(self, db: Session, id_pedido: int, token: str):
        """PayPal regresa con ?token=ORDER_ID en la URL"""
        capture = await paypal_service.capture_order(token)

        if capture.get("status") == "COMPLETED":
            pedido = self.get_pedido(db, id_pedido)
            pedido.estado = EstadoPedidoEnum.confirmado
            db.commit()
            db.refresh(pedido)
            return PaymentResponse(
                id_pedido=pedido.id_pedido,
                metodo_pago=pedido.metodo_pago,
                estado=pedido.estado,
                total=pedido.total,
            )

        raise HTTPException(status_code=400, detail="El pago de PayPal no fue completado.")

    # --- Confirmación Stripe (tras redirect) ---
    async def confirmar_stripe(self, db: Session, id_pedido: int):
        pedido = self.get_pedido(db, id_pedido)
        pedido.estado = EstadoPedidoEnum.confirmado
        db.commit()
        db.refresh(pedido)
        return PaymentResponse(
            id_pedido=pedido.id_pedido,
            metodo_pago=pedido.metodo_pago,
            estado=pedido.estado,
            total=pedido.total,
        )

    async def manejar_webhook_mercadopago(self, db: Session, evento: dict):
        # MercadoPago manda type y data.id
        tipo = evento.get("type")
        
        if tipo != "payment":
            return {"status": "ignored"}

        payment_id = str(evento.get("data", {}).get("id", ""))

        pedido = db.query(Pedido).filter(
            Pedido.proveedor_payment_id == payment_id
        ).first()

        if not pedido:
            return {"status": "ignored", "reason": "pedido no encontrado"}

        # Verificar estado real del pago en MercadoPago
        accion = evento.get("action", "")
        if accion == "payment.updated":
            # Consultar el estado actual del pago
            with httpx.AsyncClient() as client:
                response = await client.get(
                    f"https://api.mercadopago.com/v1/payments/{payment_id}",
                    headers={"Authorization": f"Bearer {settings.MERCADOPAGO_ACCESS_TOKEN}"}
                )
            pago = response.json()
            if pago.get("status") == "approved":
                pedido.estado = EstadoPedidoEnum.confirmado
            elif pago.get("status") in ("cancelled", "rejected"):
                pedido.estado = EstadoPedidoEnum.cancelado

        db.commit()
        return {"status": "ok"}

    # Funciones auxiliares
    def get_pedidos(self, db: Session, ids: list[int]):
        pedidos = db.query(Pedido).filter(Pedido.id_pedido.in_(ids)).all()
        if len(pedidos) != len(ids):
            raise HTTPException(status_code=404, detail="Uno o mas pedidos no encontrados")
        return pedidos

    def _get_pedido(self, db: Session, id_pedido: int):
        pedido = db.query(Pedido).filter(Pedido.id_pedido == id_pedido).first()
        if not pedido:
            raise HTTPException(status_code=404, detail="Pedido no encontrado.")
        return pedido

# Instancia global para usar
payment_service = PaymentService()