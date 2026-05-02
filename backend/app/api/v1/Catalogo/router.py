from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.core.database import get_db
from .schemas import ProductoCatalogoRead, ServicioCatalogoRead, EmprendedoraCatalogoRead
from app.models.enum import TipoEntregaEnum
from . import service
from app.core.deps import require_cliente, require_emprendedora_or_admin

router = APIRouter(prefix="/catalogo", tags=["Catálogo"])#, dependencies=[Depends(require_cliente), Depends(require_emprendedora_or_admin)])


@router.get("/productos", response_model=list[ProductoCatalogoRead])
def listar_productos(
    skip: int = 0,
    limit: int = 20,
    id_categoria: Optional[int] = Query(None),
    nombre: Optional[str] = Query(None),
    precio_min: Optional[float] = Query(None),
    precio_max: Optional[float] = Query(None),
    hecho_juarez: Optional[bool] = Query(None),
    tipo_entrega: Optional[TipoEntregaEnum] = Query(None),
    ordenar_por: Optional[str] = Query(None, enum=["precio_asc", "precio_desc", "calificacion", "recientes", "nombre"]),
    db: Session = Depends(get_db),
):
    return service.get_productos(
        db, skip, limit, id_categoria, nombre,
        precio_min, precio_max, hecho_juarez, tipo_entrega, ordenar_por
    )


@router.get("/servicios", response_model=list[ServicioCatalogoRead])
def listar_servicios(
    skip: int = 0,
    limit: int = 20,
    id_categoria: Optional[int] = Query(None),
    nombre: Optional[str] = Query(None),
    precio_min: Optional[float] = Query(None),
    precio_max: Optional[float] = Query(None),
    ordenar_por: Optional[str] = Query(None, enum=["precio_asc", "precio_desc", "calificacion", "recientes", "nombre"]),
    db: Session = Depends(get_db),
):
    return service.get_servicios(
        db, skip, limit, id_categoria, nombre,
        precio_min, precio_max, ordenar_por
    )


@router.get("/emprendedoras", response_model=list[EmprendedoraCatalogoRead])
def listar_emprendedoras(
    skip: int = 0,
    limit: int = 20,
    nombre: Optional[str] = Query(None),
    ordenar_por: Optional[str] = Query(None, enum=["calificacion", "nombre_negocio", "recientes"]),
    db: Session = Depends(get_db),
):
    return service.get_emprendedoras(db, skip, limit, nombre, ordenar_por)