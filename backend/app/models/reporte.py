from app.core.database import Base
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import Optional
from datetime import datetime
from sqlalchemy import DateTime, Enum, ForeignKey, Integer, String
from .enum import TipoContenidoReporteEnum, EstadoReporteEnum

class Reporte(Base):
    __tablename__ = "reporte"

    id_reporte: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    id_reportador:  Mapped[int] = mapped_column(ForeignKey("usuario.id_usuario"), nullable=False)
    tipo_contenido: Mapped[TipoContenidoReporteEnum] = mapped_column(Enum(TipoContenidoReporteEnum), nullable=False)
    id_referencia: Mapped[int] = mapped_column(Integer, nullable=False)
    motivo: Mapped[Optional[str]] = mapped_column(String(300), nullable=True)
    estado: Mapped[EstadoReporteEnum] = mapped_column(Enum(EstadoReporteEnum), nullable=False)
    fecha: Mapped[datetime] = mapped_column(DateTime, nullable=False)

    # Relationships
    reportador: Mapped["Usuario"] = relationship(back_populates="reportes")