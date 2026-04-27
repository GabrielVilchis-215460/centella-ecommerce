from app.core.database import Base
from datetime import date, datetime
from typing import Optional
from sqlalchemy import Boolean, Date, DateTime, Enum, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .enum import TipoUsuarioEnum

class Usuario(Base):
    __tablename__ = "usuario"

    id_usuario: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    email: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    contrasena: Mapped[str] = mapped_column(String(255), nullable=False)
    tipo_usuario: Mapped[TipoUsuarioEnum] = mapped_column(Enum(TipoUsuarioEnum), nullable=False)
    nombre: Mapped[str] = mapped_column(String(100), nullable=False)
    apellido: Mapped[str] = mapped_column(String(100), nullable=False)
    fecha_nacimiento: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    foto_perfil_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    fecha_registro: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    email_verificado: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    token_verificacion: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    codigo_verificacion: Mapped[Optional[str]] = mapped_column(String(6), nullable=True)
    codigo_verificacion_expira: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    codigo_reset: Mapped[Optional[str]] = mapped_column(String(6), nullable=True)
    codigo_reset_expira: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    # Relationships
    emprendedora: Mapped[Optional["Emprendedora"]] = relationship(back_populates="usuario", uselist=False)
    direcciones: Mapped[list["Direccion"]] = relationship(back_populates="usuario")
    carrito: Mapped[Optional["Carrito"]] = relationship(back_populates="cliente", uselist=False)
    pedidos: Mapped[list["Pedido"]] = relationship(back_populates="cliente", foreign_keys="Pedido.id_cliente")
    resenas: Mapped[list["Resena"]] = relationship(back_populates="cliente", foreign_keys="Resena.id_cliente")
    reportes: Mapped[list["Reporte"]] = relationship(back_populates="reportador")