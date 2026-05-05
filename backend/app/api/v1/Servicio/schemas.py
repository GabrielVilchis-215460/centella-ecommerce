from pydantic import BaseModel, Field, HttpUrl
from decimal import Decimal
from datetime import datetime
from typing import Optional

class ServicioBase(BaseModel):
    nombre: str = Field(..., max_length=200)
    descripcion: Optional[str] = None
    precio: Decimal = Field(..., gt=0)
    enlace_reservacion: str = Field(..., max_length=500)
    activo: bool = True
    id_categoria: int

class ServicioCreate(ServicioBase):
    #id_emprendedora: int
    fecha_creacion: datetime = Field(default_factory=datetime.utcnow)

class ServicioUpdate(BaseModel):
    nombre: Optional[str] = Field(None, max_length=200)
    descripcion: Optional[str] = None
    precio: Optional[Decimal] = Field(None, gt=0)
    enlace_reservacion: Optional[str] = Field(None, max_length=500)
    activo: Optional[bool] = None
    id_categoria: Optional[int] = None


class ServicioRead(ServicioBase):
    id_servicio: int
    id_emprendedora: int
    fecha_creacion: datetime

    model_config = {"from_attributes": True}