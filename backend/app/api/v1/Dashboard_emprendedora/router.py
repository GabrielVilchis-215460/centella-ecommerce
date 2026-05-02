from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.core.database import get_db
from app.core.deps import require_emprendedora
from app.models.emprendedora import Emprendedora
from app.models.usuario import Usuario
from app.services.analytics.emprendedora_metrics import (
    get_full_dashboard,
    
)

router = APIRouter(prefix="/emprendedora/dashboard", tags=["Dashboard Emprendedora"], dependencies=[Depends(require_emprendedora)])


@router.get("/")
def get_dashboard(
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(require_emprendedora), 
):
    emprendedora_id = db.execute(
        select(Emprendedora.id_emprendedora)
        .where(Emprendedora.id_usuario == usuario.id_usuario)
    ).scalar()

    return get_full_dashboard(db, emprendedora_id)