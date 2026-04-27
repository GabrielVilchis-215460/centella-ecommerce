from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import get_current_user # Solo requiere estar logueado
from app.models.usuario import Usuario
from .schemas import ReporteCreate
from .service import crear_nuevo_reporte

router = APIRouter(prefix="/reportes", tags=["Reportes"])

@router.post("/", status_code=status.HTTP_201_CREATED)
def enviar_reporte(
    reporte_in: ReporteCreate,
    db: Session = Depends(get_db),
    # Obtenemos el usuario del token de forma segura
    current_user: Usuario = Depends(get_current_user) 
):
    """
    Crea un nuevo reporte sobre un contenido de la plataforma.
    """
    return crear_nuevo_reporte(
        db=db, 
        reporte_in=reporte_in, 
        id_usuario_que_reporta=current_user.id_usuario
    )