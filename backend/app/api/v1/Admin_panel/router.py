from app.services.analytics.admin_metricts import get_admin_dashboard
from typing import Optional, Literal
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import require_admin 
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
    revocar_insignia_service,
    reactivar_emprendedora_service
)

router = APIRouter(prefix="/admin", tags=["Admin Management"], dependencies=[Depends(require_admin)])

@router.get("/emprendedoras", response_model=list[EmprendedoraOut], summary="Listar cuentas de emprendedoras")
def get_emprendedoras(
    db: Session = Depends(get_db),
    q: Optional[str] = None,
    estado: Optional[str] = None,
    insignia: Optional[bool] = None,
    ordenar_por: Optional[Literal["nombre", "recientes", "estado"]] = None,
):
    """Obtiene un catálogo filtrable y ordenable de todas las emprendedoras registradas en la plataforma."""
    return get_emprendedoras_service(
        db, q, estado, insignia, ordenar_por
    )

@router.patch("/emprendedoras/{id}/verificar", summary="Verificar cuenta de emprendedora")
def verificar_emprendedora(id: int, db: Session = Depends(get_db)):
    """Asigna manualmente el estado de 'verificada' a la cuenta de una emprendedora."""
    result = verificar_emprendedora_service(db, id)
    if not result:
        raise HTTPException(404, "No encontrada")
    return {"message": "Emprendedora verificada"}

@router.patch("/emprendedoras/{id}/suspender", summary="Suspender cuenta de emprendedora")
def suspender_emprendedora(id: int, db: Session = Depends(get_db)):
    """Inhabilita el acceso y los privilegios de una cuenta de emprendedora temporal o indefinidamente."""
    result = suspender_emprendedora_service(db, id)
    if not result:
        raise HTTPException(404, "No encontrada")
    return {"message": "Emprendedora suspendida"}

@router.patch("/emprendedoras/{id}/reactivar", summary="Reactivar cuenta de emprendedora suspendida")
def reactivar_emprendedora(id: int, db: Session = Depends(get_db)):
    """Restaura el acceso y los privilegios de una cuenta de emprendedora que había sido suspendida."""
    result = reactivar_emprendedora_service(db, id)
    if not result:
        raise HTTPException(404, "No encontrada")
    return {"message": "Emprendedora reactivada"}

@router.get("/insignias", response_model=list[InsigniaOut], summary="Listar solicitudes de insignias")
def get_insignias(
    db: Session = Depends(get_db),
    q: Optional[str] = None,
    solicitud_activa: Optional[bool] = None,
    insignia: Optional[bool] = None,
    ordenar_por: Optional[Literal["nombre"]] = None,
):
    """Consulta el registro de solicitudes de validación de vendedores (como el distintivo 'Hecho en Juárez') para su revisión."""
    return get_insignias_service(
        db, q, solicitud_activa, insignia, ordenar_por
    )

@router.patch("/insignias/{id}/aprobar", summary="Aprobar solicitud de insignia")
def aprobar_insignia(id: int, db: Session = Depends(get_db)):
    """Otorga formalmente una insignia previamente solicitada al perfil de una emprendedora."""
    result = aprobar_insignia_service(db, id)
    if not result:
        raise HTTPException(404, "No encontrada")
    return {"message": "Insignia aprobada"}

@router.patch("/insignias/{id}/rechazar", summary="Rechazar solicitud de insignia")
def rechazar_insignia(id: int, db: Session = Depends(get_db)):
    """Niega una solicitud de insignia pendiente."""
    result = rechazar_insignia_service(db, id)
    if not result:
        raise HTTPException(404, "No encontrada")
    return {"message": "Insignia rechazada"}

@router.patch("/insignias/{id}/revocar", summary="Revocar insignia asignada")
def revocar_insignia(id: int, db: Session = Depends(get_db)):
    """Retira una insignia que ya había sido otorgada a una emprendedora."""
    result = revocar_insignia_service(db, id)
    if not result:
        raise HTTPException(404, "No encontrada")
    return {"message": "Insignia revocada"}

@router.get("/reportes", response_model=list[ReporteOut], summary="Obtener lista de reportes")
def get_reportes(
    db: Session = Depends(get_db),
    q: Optional[str] = None,
    estado: Optional[str] = None,
    ordenar_por: Optional[Literal["recientes", "estado"]] = None,
):
    """Obtiene la lista de denuncias y quejas levantadas por los usuarios contra productos o perfiles."""
    return get_reportes_service(
        db, q, estado, ordenar_por
    )

@router.patch("/reportes/{id}/eliminar-publicacion", summary="Eliminar contenido reportado")
def eliminar_publicacion(id: int, db: Session = Depends(get_db)):
    """Borra de la plataforma el contenido específico que fue motivo de un reporte validado."""
    result = eliminar_publicacion_service(db, id)
    if not result:
        raise HTTPException(404, "No encontrado")
    return {"message": "Publicación eliminada"}

@router.patch("/reportes/{id}/suspender-cuenta", summary="Suspender cuenta por reporte")
def suspender_cuenta(id: int, db: Session = Depends(get_db)):
    """Aplica una suspensión directa a la cuenta infractora como resolución de un reporte grave."""
    result = suspender_cuenta_service(db, id)
    if not result:
        raise HTTPException(404, "No encontrado")
    return {"message": "Cuenta suspendida"}

@router.patch("/reportes/{id}/descartar", summary="Descartar reporte inválido")
def descartar_reporte(id: int, db: Session = Depends(get_db)):
    """Cierra un reporte sin aplicar sanciones cuando se determina que no hubo incumplimiento."""
    result = descartar_reporte_service(db, id)
    if not result:
        raise HTTPException(404, "No encontrado")
    return {"message": "Reporte descartado"}

@router.get("/", summary="Dashboard general de administrador")
def get_dashboard(
    db: Session = Depends(get_db),
):
    """Retorna las métricas globales y el estado general de la plataforma para el panel central de administración."""
    return get_admin_dashboard(db)