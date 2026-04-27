from sqlalchemy.orm import Session
from datetime import datetime
from app.models.reporte import Reporte
from app.models.enum import EstadoReporteEnum
from .schemas import ReporteCreate

def crear_nuevo_reporte(db: Session, reporte_in: ReporteCreate, id_usuario_que_reporta: int):
    nuevo_reporte = Reporte(
        id_reportador=id_usuario_que_reporta,
        tipo_contenido=reporte_in.tipo_contenido,
        id_referencia=reporte_in.id_referencia,
        motivo=reporte_in.motivo,
        # Todo reporte nuevo nace en "pendiente"
        estado=EstadoReporteEnum.pendiente, 
        # Fecha automática del servidor
        fecha=datetime.now() 
    )
    
    db.add(nuevo_reporte)
    db.commit()
    db.refresh(nuevo_reporte)
    return nuevo_reporte