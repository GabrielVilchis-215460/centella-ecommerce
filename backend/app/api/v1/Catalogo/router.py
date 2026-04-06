from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from .schemas import ProductoCatalogoRead, ServicioCatalogoRead, EmprendedoraCatalogoRead
from . import service

router = APIRouter(prefix="/catalogo", tags=["Catálogo"])


@router.get("/productos", response_model=list[ProductoCatalogoRead])
def listar_productos(skip: int = 0, limit: int = 20, db: Session = Depends(get_db)):
    return service.get_productos(db, skip, limit)


@router.get("/servicios", response_model=list[ServicioCatalogoRead])
def listar_servicios(skip: int = 0, limit: int = 20, db: Session = Depends(get_db)):
    return service.get_servicios(db, skip, limit)


@router.get("/emprendedoras", response_model=list[EmprendedoraCatalogoRead])
def listar_emprendedoras(skip: int = 0, limit: int = 20, db: Session = Depends(get_db)):
    return service.get_emprendedoras(db, skip, limit)