from app.core.database import Base
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import Optional
from sqlalchemy import Boolean, Enum, ForeignKey, Integer, JSON, String, Text
from .enum import EstadoVerificacionEnum

class Emprendedora(Base):
    __tablename__ = "emprendedora"

    id_emprendedora: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    id_usuario: Mapped[int] = mapped_column(ForeignKey("usuario.id_usuario"), nullable=False, unique=True)
    nombre_negocio: Mapped[str] = mapped_column(String(200), nullable=False)
    logo_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    descripcion_negocio: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    estado_verificacion: Mapped[EstadoVerificacionEnum] = mapped_column(Enum(EstadoVerificacionEnum), nullable=False)
    insignia_hecho_juarez: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    solicitud_insignia_activa: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    enlace_redes_sociales: Mapped[dict] = mapped_column(JSON, nullable=False)

    # Relationships
    usuario: Mapped["Usuario"] = relationship(back_populates="emprendedora")
    pagina: Mapped[Optional["PaginaEmprendimiento"]] = relationship(back_populates="emprendedora", uselist=False)
    productos: Mapped[list["Producto"]] = relationship(back_populates="emprendedora")
    servicios: Mapped[list["Servicio"]] = relationship(back_populates="emprendedora")
    pedidos: Mapped[list["Pedido"]] = relationship(back_populates="emprendedora", foreign_keys="Pedido.id_emprendedora")
    resenas: Mapped[list["Resena"]] = relationship(back_populates="emprendedora", foreign_keys="Resena.id_emprendedora")