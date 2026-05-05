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
    producto_id: Optional[int] = None
    producto: Optional[str] = None
    propietario: Optional[str] = None
    reportado_por: str
    estado: str

    class Config:
        from_attributes = True