from pydantic import BaseModel
from decimal import Decimal
from datetime import datetime
from typing import Optional, Generic, TypeVar
from app.models.enum import TipoEntregaEnum
T = TypeVar("T")

class ProductoCatalogoRead(BaseModel):
    id_producto: int
    id_emprendedora: int
    id_categoria: int
    nombre_categoria: str
    nombre: str
    descripcion: Optional[str]
    precio: Decimal
    cantidad_stock: int
    tipo_entrega: TipoEntregaEnum
    fecha_creacion: datetime
    calificacion_promedio: Optional[float]
    imagen_url: Optional[str] = None

    model_config = {"from_attributes": True}


class ServicioCatalogoRead(BaseModel):
    id_servicio: int
    id_emprendedora: int
    id_categoria: int
    nombre_categoria: str
    nombre: str
    descripcion: Optional[str]
    precio: Decimal
    enlace_reservacion: str
    fecha_creacion: datetime
    calificacion_promedio: Optional[float]
    nombre_vendedora: Optional[str] = None
    verificada: Optional[str] = None
    color_hex: Optional[str] = None

    model_config = {"from_attributes": True}


class EmprendedoraCatalogoRead(BaseModel):
    id_emprendedora: int
    nombre_negocio: str
    descripcion_negocio: Optional[str]
    logo_url: Optional[str]
    foto_perfil_url: Optional[str]
    nombre: str
    apellido: str
    insignia_hecho_juarez: bool
    estado_verificacion: str
    color_emprendedora_hex: Optional[str] = None
    calificacion_promedio: Optional[float]
    etiquetas: list[str]

    model_config = {"from_attributes": True, "extra": "ignore"}

class PaginatedResponse(BaseModel, Generic[T]):
    items: list[T]
    total: int
    skip: int
    limit: int

class CategoriaCatalogoRead(BaseModel):
    id_categoria: int
    nombre: str
    descripcion: Optional[str] = None
    color_preferencia_hex: Optional[str] = None

    model_config = {"from_attributes": True}