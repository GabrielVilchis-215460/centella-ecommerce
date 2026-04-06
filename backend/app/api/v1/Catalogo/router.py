from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.core.database import get_db
from .schemas import ProductoCatalogoRead, ServicioCatalogoRead, EmprendedoraCatalogoRead
from . import service

router = APIRouter(prefix="/catalogo", tags=["Catálogo"])


@router.get("/productos", response_model=list[ProductoCatalogoRead])
def listar_productos(
    skip: int = 0,
    limit: int = 20,
    id_categoria: Optional[int] = Query(None),
    nombre: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    return service.get_productos(db, skip, limit, id_categoria, nombre)


@router.get("/servicios", response_model=list[ServicioCatalogoRead])
def listar_servicios(
    skip: int = 0,
    limit: int = 20,
    id_categoria: Optional[int] = Query(None),
    nombre: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    return service.get_servicios(db, skip, limit, id_categoria, nombre)


@router.get("/emprendedoras", response_model=list[EmprendedoraCatalogoRead])
def listar_emprendedoras(
    skip: int = 0,
    limit: int = 20,
    nombre: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    return service.get_emprendedoras(db, skip, limit, nombre)