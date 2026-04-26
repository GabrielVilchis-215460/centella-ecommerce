
from app.services.analytics.admin_metricts import get_admin_dashboard
from typing import Optional, Literal
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
#from app.api.dependencies.auth import get_current_user

from .schemas import EmprendedoraOut, InsigniaOut, ReporteOut
from .service import (
    get_emprendedoras_service,
    get_insignias_service,
    get_reportes_service,
    verificar_emprendedora_service,
    suspender_emprendedora_service,
    aprobar_insignia_service,
    rechazar_insignia_service,
    eliminar_publicacion_service,
    suspender_cuenta_service,
    descartar_reporte_service,
)

router = APIRouter(prefix="/admin", tags=["Admin Management"])


@router.get("/emprendedoras", response_model=list[EmprendedoraOut])
def get_emprendedoras(
    db: Session = Depends(get_db),
    #user=Depends(get_current_user),
    q: Optional[str] = None,
    estado: Optional[str] = None,
    insignia: Optional[bool] = None,
    ordenar_por: Optional[Literal["nombre", "recientes", "estado"]] = None,
):
    return get_emprendedoras_service(
        db, q, estado, insignia, ordenar_por
    )


@router.patch("/emprendedoras/{id}/verificar")
def verificar_emprendedora(id: int, db: Session = Depends(get_db)):
    result = verificar_emprendedora_service(db, id)
    if not result:
        raise HTTPException(404, "No encontrada")
    return {"message": "Emprendedora verificada"}


@router.patch("/emprendedoras/{id}/suspender")
def suspender_emprendedora(id: int, db: Session = Depends(get_db)):
    result = suspender_emprendedora_service(db, id)
    if not result:
        raise HTTPException(404, "No encontrada")
    return {"message": "Emprendedora suspendida"}


@router.get("/insignias", response_model=list[InsigniaOut])
def get_insignias(
    db: Session = Depends(get_db),
    #user=Depends(get_current_user),
    q: Optional[str] = None,
    solicitud_activa: Optional[bool] = None,
    insignia: Optional[bool] = None,
    ordenar_por: Optional[Literal["nombre"]] = None,
):
    return get_insignias_service(
        db, q, solicitud_activa, insignia, ordenar_por
    )


@router.patch("/insignias/{id}/aprobar")
def aprobar_insignia(id: int, db: Session = Depends(get_db)):
    result = aprobar_insignia_service(db, id)
    if not result:
        raise HTTPException(404, "No encontrada")
    return {"message": "Insignia aprobada"}


@router.patch("/insignias/{id}/rechazar")
def rechazar_insignia(id: int, db: Session = Depends(get_db)):
    result = rechazar_insignia_service(db, id)
    if not result:
        raise HTTPException(404, "No encontrada")
    return {"message": "Insignia rechazada"}


@router.get("/reportes", response_model=list[ReporteOut])
def get_reportes(
    db: Session = Depends(get_db),
    #user=Depends(get_current_user),
    q: Optional[str] = None,
    estado: Optional[str] = None,
    ordenar_por: Optional[Literal["recientes", "estado"]] = None,
):
    return get_reportes_service(
        db, q, estado, ordenar_por
    )


@router.patch("/reportes/{id}/eliminar-publicacion")
def eliminar_publicacion(id: int, db: Session = Depends(get_db)):
    result = eliminar_publicacion_service(db, id)
    if not result:
        raise HTTPException(404, "No encontrado")
    return {"message": "Publicación eliminada"}


@router.patch("/reportes/{id}/suspender-cuenta")
def suspender_cuenta(id: int, db: Session = Depends(get_db)):
    result = suspender_cuenta_service(db, id)
    if not result:
        raise HTTPException(404, "No encontrado")
    return {"message": "Cuenta suspendida"}


@router.patch("/reportes/{id}/descartar")
def descartar_reporte(id: int, db: Session = Depends(get_db)):
    result = descartar_reporte_service(db, id)
    if not result:
        raise HTTPException(404, "No encontrado")
    return {"message": "Reporte descartado"}

@router.get("/")
def get_dashboard(
    db: Session = Depends(get_db),
    # Add when auth is merged
   # user=Depends(get_current_user),  # TODO: enforce admin role
):
    """
    MVP:
    - TODO: validate TipoUsuarioEnum.ADMIN
    - Currently returns global platform metrics
    """

    return get_admin_dashboard(db)