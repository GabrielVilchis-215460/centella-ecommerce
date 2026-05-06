from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class EmprendedoraOut(BaseModel):
    id_emprendedora: int
    nombre: str
    email: str
    nombre_negocio: str
    estado: str
    fecha_registro: datetime
    insignia: bool


class InsigniaOut(BaseModel):
    id_emprendedora: int
    nombre_negocio: str
    insignia: bool
    solicitud_activa: bool
    nombre_solicitante: str
    email: str
    fecha_solicitud: datetime


class ReporteOut(BaseModel):
    id_reporte: int
    tipo_contenido: str
    id_referencia: int
    nombre_contenido: Optional[str] = None
    propietario: Optional[str] = None
    propietario_email: Optional[str] = None
    reportado_por: Optional[str] = None
    reportado_por_email: Optional[str] = None
    motivo: Optional[str] = None
    estado: str
    fecha: Optional[str] = None

    class Config:
        from_attributes = True