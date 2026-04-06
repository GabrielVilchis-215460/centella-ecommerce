import httpx
from app.config import settings
from app.models.pedido import Pedido

class MercadoPagoService:

    def __init__(self):
        self.base_url = settings.MERCADO_PAGO_BASE_URL

    def _get_headers(self):
        return {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {settings.MERCADO_PAGO_ACCESS_TOKEN}"
        }

    def crear_preferencia_checkout(
        self,
        pedido: Pedido,
        cliente_email: str,
    ) -> dict:

        body = {
            "items": [
                {
                    "title": f"Pedido #{pedido.id_pedido}",
                    "quantity": 1,
                    "unit_price": float(pedido.total),
                    "currency_id": "MXN"
                }
            ],
            "payer": {
                "email": cliente_email
            },
            "external_reference": str(pedido.id_pedido),

            # webhook
            "notification_url": settings.MERCADO_PAGO_WEBHOOK,

            # redirecciones
            # estas deberan ser vistas del front pa que jale bien, sale un error pero funciona el checkout
            "back_urls": {
                "success": "https://google.com",
                "failure": "https://google.com",
                "pending": "https://google.com"
            },
            "auto_return": "approved"
        }

        with httpx.Client() as client:
            response = client.post(
                f"{self.base_url}/checkout/preferences",
                headers=self._get_headers(),
                json=body
            )

        # Debug
        print("MercadoPago Status:", response.status_code)
        print("MercadoPago Response:", response.text)

        if response.status_code not in (200, 201):
            raise Exception(f"Error MercadoPago: {response.status_code} - {response.text}")

        data = response.json()

        return {
            "preference_id": data["id"],
            "init_point": data["init_point"], 
            "sandbox_init_point": data.get("sandbox_init_point")
        }

mercadopago_service = MercadoPagoService()