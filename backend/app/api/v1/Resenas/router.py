"""
app/api/v1/resenas/router.py
API endpoints for reviews CRUD - simple and sync
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.enum import TipoResenaEnum
from . import service
from .schemas import ResenaCreate, ResenaUpdate
from app.core.deps import require_cliente

router = APIRouter(prefix="/resenas", tags=["Reseñas"])


@router.post("/create", dependencies=[Depends(require_cliente)])
def create_resena(
    data: ResenaCreate,
    db: Session = Depends(get_db)
):
    """Create a new review"""
    result = service.create_resena(
        db=db,
        id_cliente=data.id_cliente,
        id_emprendedora=data.id_emprendedora,
        tipo_resena=data.tipo_resena,
        id_referencia=data.id_referencia,
        calificacion_item=data.calificacion_item,
        calificacion_vendedora=data.calificacion_vendedora,
        comentario=data.comentario
    )
    
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("error"))
    
    return result


@router.get("/resena/{id_resena}")
def get_resena(
    id_resena: int,
    db: Session = Depends(get_db)
):
    """Get a specific review"""
    result = service.get_resena(db, id_resena)
    
    if not result.get("success"):
        raise HTTPException(status_code=404, detail=result.get("error"))
    
    return result


@router.get("/referencia/{id_referencia}/{tipo_resena}")
def get_resenas_by_referencia(
    id_referencia: int,
    tipo_resena: TipoResenaEnum,
    db: Session = Depends(get_db)
):
    """Get all reviews for a product/service with averages"""
    return service.get_resenas_by_referencia(db, id_referencia, tipo_resena)


@router.get("/vendedora/{id_emprendedora}")
def get_resenas_by_vendedora(
    id_emprendedora: int,
    db: Session = Depends(get_db)
):
    """Get all reviews for a seller with averages"""
    return service.get_resenas_by_vendedora(db, id_emprendedora)


@router.put("/resena/{id_resena}")
def update_resena(
    id_resena: int,
    data: ResenaUpdate,
    id_cliente: int,
    db: Session = Depends(get_db)
):
    """Update a review (only by the author)"""
    result = service.update_resena(
        db=db,
        id_resena=id_resena,
        id_cliente=id_cliente,
        calificacion_item=data.calificacion_item,
        calificacion_vendedora=data.calificacion_vendedora,
        comentario=data.comentario
    )
    
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("error"))
    
    return result


@router.delete("/resena/{id_resena}")
def delete_resena(
    id_resena: int,
    id_cliente: int,
    db: Session = Depends(get_db)
):
    """Delete a review (only by the author)"""
    result = service.delete_resena(db, id_resena, id_cliente)
    
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("error"))
    
    return result


@router.get("/promedio/{id_referencia}/{tipo_resena}")
def get_average_ratings(
    id_referencia: int,
    tipo_resena: TipoResenaEnum,
    db: Session = Depends(get_db)
):
    """Get average ratings for a product/service"""
    return service.get_average_ratings(db, id_referencia, tipo_resena)