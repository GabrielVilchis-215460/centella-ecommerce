from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.pedido import Pedido
from app.models.enum import MetodoPagoEnum, EstadoPedidoEnum, TipoEntregaItemEnum
from .schemas import PaymentResponse, PayResponseList
from app.services.stripe_service import stripe_service
from app.services.paypal_service import paypal_service
from app.config import settings
from app.api.v1.Envios.service import service_asignar_envio

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
                case MetodoPagoEnum.efectivo:
                    resultado = await self._procesar_efectivo(db, pedido)
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
            success_url=f"{settings.APP_URL}/pagos/confirm/stripe/{pedido.id_pedido}",
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
            return_url=f"{settings.APP_URL}/pagos/confirm/paypal/{pedido.id_pedido}"
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
    
    async def _procesar_efectivo(self, db: Session, pedido: Pedido):
        pedido.estado = EstadoPedidoEnum.confirmado
        db.commit()
        db.refresh(pedido)
        await self.post_pago(db, pedido)
        return PaymentResponse(
            id_pedido=pedido.id_pedido,
            metodo_pago=pedido.metodo_pago,
            estado=pedido.estado,
            total=pedido.total,
            redirect_url=None  # no redirige a pasarela
        )

    # --- Confirmación PayPal (tras redirect) ---
    async def confirmar_paypal(self, db: Session, id_pedido: int, token: str):
        """PayPal regresa con ?token=ORDER_ID en la URL"""
        capture = await paypal_service.capture_order(token)

        #capture = await paypal_service.capture_order(token)
        print(f"📦 PayPal capture status: {capture.get('status')}")
        if capture.get("status") == "COMPLETED":
            pedido = self.get_pedido(db, id_pedido)
            pedido.estado = EstadoPedidoEnum.confirmado
            db.commit()
            db.refresh(pedido)
            await self.post_pago(db, pedido)
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
        await self.post_pago(db, pedido)
        return PaymentResponse(
            id_pedido=pedido.id_pedido,
            metodo_pago=pedido.metodo_pago,
            estado=pedido.estado,
            total=pedido.total,
        )

    async def post_pago(self, db: Session, pedido: Pedido):
        
        tiene_envio = any(
            item.tipo_entrega == TipoEntregaItemEnum.envio
            for item in pedido.items
        )
        tiene_fisica = any(
        item.tipo_entrega == TipoEntregaItemEnum.fisica
        for item in pedido.items
        )
        if tiene_envio:
            try:
                await service_asignar_envio(pedido.id_pedido, db)
            except Exception as e:
                print(f"⚠️ Error al asignar envío para pedido {pedido.id_pedido}: {e}")

        
        if tiene_fisica:
            try:
                from app.api.v1.Envios.service import _generar_qr_base64
                from app.services.email_service import enviar_correo_pedido
                ###
                from app.services.archivos_service import CloudflareR2Client
                import base64
                ##

                #qr_base64 = _generar_qr_base64(pedido.id_pedido)
                #pedido.codigo_qr_url = qr_base64
                #db.commit()
                # Generar QR
                qr_base64 = _generar_qr_base64(pedido.id_pedido)
                img_bytes = base64.b64decode(qr_base64)

                # Subir a R2
                r2 = CloudflareR2Client()
                resultado = r2.upload_image(img_bytes, f"qr_pedido_{pedido.id_pedido}.png")

                if resultado.get("success"):
                    pedido.codigo_qr_url = resultado["url"]  # ← URL pública de R2
                    db.commit()

                await enviar_correo_pedido(
                    email_destino=pedido.cliente.email,
                    nombre_cliente=f"{pedido.cliente.nombre} {pedido.cliente.apellido}",
                    pedido_id=pedido.id_pedido,
                    tiene_envio=False,
                    tiene_fisica=True,
                    qr_base64=qr_base64,
                )
            except Exception as e:
                print(f"⚠️ Error al generar QR o mandar correo: {e}")
    
    # Funciones auxiliares
    def get_pedidos(self, db: Session, ids: list[int]):
        pedidos = db.query(Pedido).filter(Pedido.id_pedido.in_(ids)).all()
        if len(pedidos) != len(ids):
            raise HTTPException(status_code=404, detail="Uno o mas pedidos no encontrados")
        return pedidos

    def get_pedido(self, db: Session, id_pedido: int):
        from sqlalchemy import select
        from sqlalchemy.orm import selectinload
        
        pedido = db.execute(
            select(Pedido)
            .options(selectinload(Pedido.items))
            .where(Pedido.id_pedido == id_pedido)
        ).scalar_one_or_none()
        if not pedido:
            raise HTTPException(status_code=404, detail="Pedido no encontrado.")
        return pedido

# Instancia global para usar
payment_service = PaymentService()