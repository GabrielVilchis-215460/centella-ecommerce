from pydantic import BaseModel, Field
from decimal import Decimal
from datetime import datetime
from typing import Optional
from app.models.enum import TipoEntregaEnum

class ProductoBase(BaseModel):
    nombre: str = Field(..., max_length=200)
    descripcion: Optional[str] = None
    precio: Decimal = Field(..., gt=0)
    cantidad_stock: int = Field(..., ge=0)
    tipo_entrega: TipoEntregaEnum
    activo: bool = True
    id_categoria: int

class ProductoCreate(ProductoBase):
    #id_emprendedora: int
    fecha_creacion: datetime = Field(default_factory=datetime.utcnow)

class ProductoUpdate(BaseModel):
    nombre: Optional[str] = Field(None, max_length=200)
    descripcion: Optional[str] = None
    precio: Optional[Decimal] = Field(None, gt=0)
    cantidad_stock: Optional[int] = Field(None, ge=0)
    tipo_entrega: Optional[TipoEntregaEnum] = None
    activo: Optional[bool] = None
    id_categoria: Optional[int] = None

class ImagenRead(BaseModel):
    id_imagen: int
    url: str
    filename: str
    orden: int

    model_config = {"from_attributes": True}

class ProductoRead(ProductoBase):
    id_producto: int
    id_emprendedora: int
    fecha_creacion: datetime
    imagenes: list[ImagenRead] = []

    model_config = {"from_attributes": True}

