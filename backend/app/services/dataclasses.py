from dataclasses import dataclass, field
from typing import Optional
# Modelos de salida para la api de skydropx

# dimensiones y pesos del paquete a enviar
@dataclass
class Paquete:
    peso: float # en kg
    # en cm todos
    largo: int 
    ancho: int
    alto: int

# tarifa disponible dentro de una cotizacion
@dataclass
class Cotizacion:
    rate_id: str
    carrier: str
    servicio: str
    precio: float
    moneda: str
    dias_entrega: Optional[int] = None

# para crear un envio en Skydropx
@dataclass
class Envio:
    envio_id: str
    tracking_number: str
    carrier: str
    label_url: Optional[str] = None
    estado: Optional[str] = None

# evento dentro del historial de rastreo
@dataclass
class EventoTracking:
    fecha: str
    descripcion: str
    ubicacion: Optional[str] = None

# estado actual e historial de eventos de un envio
@dataclass
class TrackingInfo:
    tracking_number: str
    carrier: str
    estado: str
    eventos: list[EventoTracking] = field(default_factory=list)

# exepciones de la api
class SkydropxError(Exception):
    def __init__(self, mensaje: str, status_code: Optional[int] = None):
        super().__init__(mensaje)
        self.status_code = status_code

class SkydropxAuthError(SkydropxError):
    pass
 
 
class SkydropxNotFoundError(SkydropxError):
    pass