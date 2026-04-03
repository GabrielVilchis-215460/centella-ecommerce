import os, time, httpx
from .dataclasses import Paquete, Cotizacion, Envio, EventoTracking, TrackingInfo, SkydropxError, SkydropxAuthError, SkydropxNotFoundError
from typing import Optional, TYPE_CHECKING
from app.config import settings

if TYPE_CHECKING:
    from app.models.usuario import Usuario
    from app.models.direccion import Direccion

class SkydropxService:
    def __init__(self):
        self.client_id = settings.SKYDROPX_API
        self.client_secret = settings.SKYDROPX_SECRET_API
        self.base_url = settings.SKYDROPX_BASE_URL 
        # direccion de origen (seden central donde se despachan los productos)
        self.origen = {
            "name": settings.SKYDROPX_ORIGEN_NOMBRE,
            "street1": settings.SKYDROPX_ORIGEN_CALLE,
            "area_level3": settings.SKYDROPX_ORIGEN_COLONIA,
            "area_level2": settings.SKYDROPX_ORIGEN_CIUDAD,
            "area_level1": settings.SKYDROPX_ORIGEN_ESTADO,
            "postal_code": settings.SKYDROPX_ORIGEN_CP,
            "country_code": "MX",
        }
        self.access_token: Optional[str] = None
        self.token_expira_en: float = 0

# solicita un nuevo access token usando client credentials
    async def obtener_token(self):
        url = f"{self.base_url}/api/v1/oauth/token"
        payload = {
            "grant_type": "client_credentials",
            "client_id": self.client_id,
            "client_secret": self.client_secret,
        }
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=payload)

        if response.status_code == 401:
            raise SkydropxAuthError("Credenciales invalidas, verifica las variables de SKYDROPX_API y SKYDROPX_SECRET_API", 401)
        elif response.status_code == 400:
            raise SkydropxAuthError("Credenciales faltentes o malformadas", 400)
        elif response.status_code != 200:
            raise SkydropxError(f"Error al obtener el bearer token: {response.text}", response.status_code)
        
        data = response.json()
        return data["access_token"], data.get("expires_in", 7200)
    
    # devuelve el token valido
    async def asegurar_token(self):
        margen = 300 # 5 min
        if not self.access_token or time.time() >= (self.token_expira_en - margen):
            token, expires_in = await self.obtener_token()
            self.access_token = token
            self.token_expira_en = time.time() + expires_in

        return self.access_token
    
    # construye headaers con el token vigente
    async def headers(self):
        token = await self.asegurar_token()
        return {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {token}",
        }
    
    # validar respuesta HTTP
    async def handle_response(self, response: httpx.Response):
        if response.status_code in (200, 201):
            return response.json()
        elif response.status_code == 401:
            self._access_token = None  # Forzar renovación en el siguiente intento
            raise SkydropxAuthError("Token inválido o expirado.", 401)
        elif response.status_code == 404:
            raise SkydropxNotFoundError("Recurso no encontrado.", 404)
        elif response.status_code == 422:
            detalle = response.json().get("errors", response.text)
            raise SkydropxError(f"Solicitud inválida: {detalle}", 422)
        else:
            raise SkydropxError(f"Error inesperado ({response.status_code}): {response.text}", response.status_code)
        
    # construccion de address_to
    def construir_destion(self, usuario: "Usuario", direccion: "Direccion"):
        return {
            "name": f"{usuario.nombre} {usuario.apellido}",
            "email": usuario.email,
            "street1": f"{direccion.calle} {direccion.numero_ext or ''}".strip(),
            "apartment_number": direccion.numero_int or "",
            "area_level3": direccion.colonia,
            "area_level2": direccion.ciudad,
            "area_level1": direccion.estado,
            "postal_code": direccion.codigo_postal,
            "country_code": "MX",
        }
    
    # cotiazacion
    async def creat_cotizacion(self, usuario: "Usuario", direccion: "Direccion", paquete: Paquete):
        url = f"{self.base_url}/api/v1/quotations"
        payload = {
            "quotation": {
                "address_from": self._origen,
                "address_to": self.construir_destino(usuario, direccion),
                "parcel": {
                    "weight": paquete.peso,
                    "length": paquete.largo,
                    "width": paquete.ancho,
                    "height": paquete.alto,
                    "mass_unit": "KG",
                    "distance_unit": "CM",
                },
            }
        }
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=payload, headers=await self.headers())
        
        data = await self.handle_response(response)
        return data["data"]["id"]
    
    # obtiene tarifa dispinbiel para cotiazacion
    async def obtener_rates(self, cotizacion_id: str):
        url = f"{self.base_url}/api/v1/quotations/{cotizacion_id}"

        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=await self.headers())
 
        data = await self._manejar_respuesta(response)
        rates_raw = data.get("data", {}).get("attributes", {}).get("rates", [])

        rates = [
            Cotizacion(
                rate_id=r["id"],
                carrier=r.get("attributes", {}).get("carrier", ""),
                servicio=r.get("attributes", {}).get("service_level_name", ""),
                precio=float(r.get("attributes", {}).get("total_pricing", 0)),
                moneda=r.get("attributes", {}).get("currency", "MXN"),
                dias_entrega=r.get("attributes", {}).get("days", None),
            )
            for r in rates_raw
        ]
 
        return sorted(rates, key=lambda r: r.precio)
    
    async def crear_envio(self, cotizacion_id: str, rate_id: str):
        url = f"{self.base_url}/api/v1/shipments"
        payload = {
            "shipment": {
                "quotation_id": cotizacion_id,
                "rate_id": rate_id,
            }
        }
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=payload, headers=await self.headers())

        data = await self.handle_response(response)
        attrs = data["data"]["attributes"]

        return Envio(
            envio_id=data["data"]["id"],
            tracking_number=attrs.get("tracking_number", ""),
            carrier=attrs.get("carrier", ""),
            label_url=attrs.get("label_url", None),
            estado=attrs.get("status", None),
        )

    async def obtener_envio(self, envio_id: str):
        url = f"{self.base_url}/api/v1/shipments/{envio_id}"

        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=await self.headers())
 
        data = await self.handle_response(response)
        attrs = data["data"]["attributes"]
 
        return Envio(
            envio_id=data["data"]["id"],
            tracking_number=attrs.get("tracking_number", ""),
            carrier=attrs.get("carrier", ""),
            label_url=attrs.get("label_url", None),
            estado=attrs.get("status", None),
        )
    
    async def rastrear_envio(self, tracking_number: str, carrier_name: str):
        url = (
            f"{self._base_url}/api/v1/shipments/tracking"
            f"?tracking_number={tracking_number}&carrier_name={carrier_name}"
        )

        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=await self.headers())
 
        data = await self.handle_response(response)
        attrs = data.get("data", {}).get("attributes", {})
 
        eventos = [
            EventoTracking(
                fecha=e.get("datetime", ""),
                descripcion=e.get("description", ""),
                ubicacion=e.get("location", None),
            )
            for e in attrs.get("tracking_events", [])
        ]
 
        return TrackingInfo(
            tracking_number=tracking_number,
            carrier=carrier_name,
            estado=attrs.get("status", ""),
            eventos=eventos,
        )

# instacia para usar    
skydropx_service = SkydropxService()
