from pydantic import BaseModel, Field

# Schemas de entrada
class DireccionSchema(BaseModel):
    name: str = Field(..., example="Juan Pérez")
    phone: str = Field(..., example="6561111111")
    street: str = Field(..., example="Av. Tecnológico")
    number: str = Field(..., example="314")
    city: str = Field(..., example="Ciudad Juárez")
    state: str = Field(..., example="CHH")
    country: str = Field(default="MX", example="MX")
    postalCode: str = Field(..., example="32310")

class PaqueteSchema(BaseModel):
    content: str = Field(..., example="Ropa")
    weight: float = Field(..., example=1.5, description="Peso en KG")
    length: float = Field(..., example=30.0, description="Largo en CM")
    width: float = Field(..., example=20.0, description="Ancho en CM")
    height: float = Field(..., example=10.0, description="Alto en CM")
    declared_value: float = Field(..., example=500.0, description="Valor declarado en MXN")
    amount: int = Field(default=1, example=1)

class CotizarRequest(BaseModel):
    destino: DireccionSchema
    paquete: PaqueteSchema
    carrier: str = Field(default="fedex", example="fedex")

class GenerarEtiquetaRequest(BaseModel):
    destino: DireccionSchema
    paquete: PaqueteSchema
    carrier: str = Field(..., example="fedex")
    service: str = Field(..., example="ground")

# Schemas de salida
class TarifaResponse(BaseModel):
    carrier: str
    service: str
    serviceDescription: str | None = None
    totalPrice: str
    currency: str
    deliveryEstimate: str | None = None

class EtiquetaResponse(BaseModel):
    tracking_number: str
    track_url: str
    label_pdf: str
    carrier: str
    service: str
    total_price: float
    currency: str

class TrackingEventSchema(BaseModel):
    timestamp: str | None = None
    location: str | None = None
    description: str | None = None

class TrackingResponse(BaseModel):
    trackingNumber: str
    status: str | None = None
    carrier: str | None = None
    events: list[TrackingEventSchema] = []
