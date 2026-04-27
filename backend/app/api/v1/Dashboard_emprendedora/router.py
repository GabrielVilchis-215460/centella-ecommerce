from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import require_emprendedora

from app.services.analytics.emprendedora_metrics import (
    get_full_dashboard,
    
)

router = APIRouter(prefix="/emprendedora/dashboard", tags=["Dashboard Emprendedora"], dependencies=[Depends(require_emprendedora)])


@router.get("/")
def get_dashboard(
    db: Session = Depends(get_db),
    #user: Usuario = Depends(get_current_user),  # TODO: enforce emprendedora role
):
    """
    MVP:
    - Uses current user
    - TODO: validate TipoUsuarioEnum.EMPRENDEDORA
    """

    # TODO: enforce role
    # if user.tipo_usuario != TipoUsuarioEnum.EMPRENDEDORA:
    #     raise HTTPException(status_code=403, detail="Not authorized")

    
    # the emprendedora id must be get from get_user and user instance
    return get_full_dashboard(db, 1)