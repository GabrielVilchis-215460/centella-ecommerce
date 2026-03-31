from app.core.database import Base
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import Optional
from datetime import  datetime
from decimal import Decimal
from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, Numeric, String, Text

class Servicio(Base):
    __tablename__ = "servicio"

    id_servicio: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    id_emprendedora: Mapped[int] = mapped_column(ForeignKey("emprendedora.id_emprendedora"), nullable=False)
    id_categoria: Mapped[int] = mapped_column(ForeignKey("categoria.id_categoria"), nullable=False)
    nombre: Mapped[str] = mapped_column(String(200), nullable=False)
    descripcion: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    precio: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    enlace_reservacion: Mapped[str] = mapped_column(String(500), nullable=False)
    activo: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    fecha_creacion: Mapped[datetime] = mapped_column(DateTime, nullable=False)

    # Relationships
    emprendedora: Mapped["Emprendedora"] = relationship(back_populates="servicios")
    categoria: Mapped["Categoria"] = relationship(back_populates="servicios")