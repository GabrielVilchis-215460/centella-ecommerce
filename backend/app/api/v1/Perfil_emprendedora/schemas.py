from pydantic import BaseModel
from typing import Optional, Any, List
from datetime import datetime



class PaginaCreate(BaseModel):
    contenido: Optional[dict] = None


class PaginaUpdate(BaseModel):
    contenido: Optional[dict] = None


class PaginaRead(BaseModel):
    id_pagina: int
    id_emprendedora: int
    contenido: Optional[dict]
    ultima_actualizacion: Optional[datetime]
    visitas: int

    class Config:
        from_attributes = True


class PaginaPublica(BaseModel):
    pagina: PaginaRead
    productos: List[Any]   # ProductoCatalogoRead
    servicios: List[Any]   # ServicioCatalogoRead