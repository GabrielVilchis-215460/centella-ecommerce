from app.core.database import Base
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import Optional
from sqlalchemy import DateTime, Integer, JSON, ForeignKey
from datetime import datetime

class PaginaEmprendimiento(Base):
    __tablename__ = "pagina_emprendimiento"

    id_pagina: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    id_emprendedora: Mapped[int] = mapped_column(ForeignKey("emprendedora.id_emprendedora"), nullable=False, unique=True)
    contenido: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    ultima_actualizacion: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    visitas: Mapped[int] = mapped_column(Integer, default=0)
    # Relationships
    emprendedora: Mapped["Emprendedora"] = relationship(back_populates="pagina")