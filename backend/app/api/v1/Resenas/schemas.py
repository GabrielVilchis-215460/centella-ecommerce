"""
app/api/v1/resenas/schema.py
Pydantic schemas for reviews
"""

from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional
from app.models.enum import TipoResenaEnum


class ResenaCreate(BaseModel):
    """Schema for creating a review"""
    id_cliente: int
    id_emprendedora: int
    tipo_resena: TipoResenaEnum
    id_referencia: int
    calificacion_item: int = Field(..., ge=1, le=5)
    calificacion_vendedora: int = Field(..., ge=1, le=5)
    comentario: Optional[str] = Field(None, max_length=300)


class ResenaUpdate(BaseModel):
    """Schema for updating a review"""
    calificacion_item: Optional[int] = Field(None, ge=1, le=5)
    calificacion_vendedora: Optional[int] = Field(None, ge=1, le=5)
    comentario: Optional[str] = Field(None, max_length=300)


class ResenaResponse(BaseModel):
    """Schema for review response"""
    id_resena: int
    id_cliente: int
    id_emprendedora: int
    tipo_resena: TipoResenaEnum
    id_referencia: int
    calificacion_item: int
    calificacion_vendedora: int
    comentario: Optional[str]
    fecha: datetime
    
    class Config:
        from_attributes = True


class ResenaListResponse(BaseModel):
    """Schema for list of reviews with pagination"""
    resenas: list[ResenaResponse]
    total: int
    promedio_item: float
    promedio_vendedora: float


class ResenaAverageResponse(BaseModel):
    """Schema for average ratings"""
    promedio_item: float
    promedio_vendedora: float
    total_resenas: int