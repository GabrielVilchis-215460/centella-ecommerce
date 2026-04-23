from pydantic import BaseModel
from datetime import datetime


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


class ReporteOut(BaseModel):
    id_reporte: int
    producto_id: int
    producto: str
    propietario: str
    reportado_por: str
    estado: str