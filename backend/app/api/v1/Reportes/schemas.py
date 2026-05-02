from pydantic import BaseModel, Field
from typing import Optional
from app.models.enum import TipoContenidoReporteEnum

class ReporteCreate(BaseModel):
    # ¿Qué está reportando? (producto, resena, etc.)
    tipo_contenido: TipoContenidoReporteEnum 
    # El ID del producto o reseña en cuestión
    id_referencia: int 
    # Por qué lo reporta
    motivo: Optional[str] = Field(None, max_length=300)