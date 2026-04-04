import httpx
from fastapi import HTTPException
from app.config import settings

class EnviaService:
    def __init__(self):
        self.base_url = settings.ENVIA_BASE_URL
        self.headers = {
            "Authorization": f"Bearer {settings.ENVIA_API_KEY}",
            "Content-Type": "application/json",
        }
        self.origin = {
            "name": settings.STORE_NAME,
            "phone": settings.STORE_PHONE,
            "street": settings.STORE_STREET,
            "number": settings.STORE_NUMBER,
            "city": settings.STORE_CITY,
            "state": settings.STORE_STATE,
            "country": settings.STORE_COUNTRY,
            "postalCode": settings.STORE_POSTAL_CODE,
        }

    def build_payload(self, paquete: dict):
        return {
            "type": "box",
            "content": paquete["content"],
            "amount": paquete.get("amount", 1),
            "declaredValue": paquete["declared_value"],
            "lengthUnit": "CM",
            "weightUnit": "KG",
            "weight": paquete["weight"],
            "dimensions": {
                "length": paquete["length"],
                "width": paquete["width"],
                "height": paquete["height"],
            },
        }
    
    def handle_response(self, response: httpx.Response, context: str):
        if response.status_code == 401:
            raise HTTPException(status_code=401, detail="API key de Envia.com invalida o expirada")
        if response.status_code == 402:
            raise HTTPException(status_code=402, detail="Saldo insuficiente en cuenta Envia.com")
        if response.status_code == 422:
            raise HTTPException(status_code=422, detail=f"Datos invalidos al {context}: {response.text}")
        if not response.is_success:
            raise HTTPException(status_code=response.status_code, detail=f"Error en Envia.com al {context}: {response.text}")
        return response.json()

    async def cotizar_envio(self, destino: dict, paquete: dict, carrier: str):
        payload = {
            "origin": self.origin,
            "destination": destino,
            "packages": [self.build_payload(paquete)],
            "shipment": {"type": 1, "carrier": carrier},
        }
        async with httpx.AsyncClient(timeout=15) as client:
            response = await client.post(f"{self.base_url}/ship/rate/", json=payload, headers=self.headers)

        data = self.handle_response(response, "cotizar envío")
        tarifas = data.get("data", [])
        # prints de debug
        print("STATUS:", response.status_code)
        print("RESPONSE RAW:", response.text)

        if not tarifas:
            raise HTTPException(status_code=404, detail="No hay tarifas disponibles para esta ruta.")

        return tarifas
    
    async def generar_etiqueta(self, destino: dict, paquete: dict, carrier: str, service: str):
        payload = {
            "origin": self.origin,
            "destination": destino,
            "packages": [self.build_payload(paquete)],
            "shipment": {"type": 1, "carrier": carrier, "service": service},
            "settings": {
                "currency": "MXN",
                "printFormat": "PDF",
                "printSize": "PAPER_LETTER",
            },
        }
        async with httpx.AsyncClient(timeout=15) as client:
            response = await client.post(f"{self.base_url}/ship/generate/", json=payload, headers=self.headers)
        
        print("STATUS:", response.status_code)
        print("RESPONSE RAW:", response.text)

        data = self.handle_response(response, "generar etiqueta")
        result = data.get("data", [{}])[0]

        return {
            "tracking_number": result.get("trackingNumber"),
            "track_url": result.get("trackUrl"),
            "label_pdf": result.get("label"),
            "carrier": result.get("carrier"),
            "service": result.get("service"),
            "total_price": result.get("totalPrice"),
            "currency": result.get("currency"),
        }

    async def rastrear_envio(self, tracking_number: str) -> dict:
        async with httpx.AsyncClient(timeout=15) as client:
            response = await client.post(
                f"{self.base_url}/ship/generaltrack/",
                json={"trackingNumbers": [tracking_number]},
                headers=self.headers,
            )

        data = self.handle_response(response, "rastrear envío")
        resultados = data.get("data", [])

        if not resultados:
            raise HTTPException(status_code=404, detail=f"Número de rastreo '{tracking_number}' no encontrado.")

        return resultados[0]
    
# instancia global de este servicio externo
envia_service = EnviaService()