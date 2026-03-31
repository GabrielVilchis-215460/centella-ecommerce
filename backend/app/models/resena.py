from app.core.database import Base
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import Optional
from datetime import datetime
from sqlalchemy import DateTime, Enum, ForeignKey, Integer, String
from .enum import TipoResenaEnum

class Resena(Base):
    __tablename__ = "resena"

    id_resena: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    id_cliente:Mapped[int] = mapped_column(ForeignKey("usuario.id_usuario"), nullable=False)
    id_emprendedora:Mapped[int]= mapped_column(ForeignKey("emprendedora.id_emprendedora"), nullable=False)
    tipo_resena: Mapped[TipoResenaEnum] = mapped_column(Enum(TipoResenaEnum), nullable=False)
    id_referencia: Mapped[int] = mapped_column(Integer, nullable=False)
    calificacion_item: Mapped[int] = mapped_column(Integer, nullable=False)
    calificacion_vendedora: Mapped[int] = mapped_column(Integer, nullable=False)
    comentario: Mapped[Optional[str]] = mapped_column(String(300), nullable=True)
    fecha: Mapped[datetime] = mapped_column(DateTime, nullable=False)

    # Relationships
    cliente: Mapped["Usuario"] = relationship(back_populates="resenas", foreign_keys=[id_cliente])
    emprendedora: Mapped["Emprendedora"] = relationship(back_populates="resenas", foreign_keys=[id_emprendedora])