from pydantic import BaseModel
from decimal import Decimal
from datetime import datetime
from typing import Optional
from app.models.enum import TipoEntregaEnum


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
    calificacion_promedio: Optional[float]
    etiquetas: list[str]

    model_config = {"from_attributes": True, "extra": "ignore"}