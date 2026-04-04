from app.core.database import Base
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import Optional
from sqlalchemy import Boolean, ForeignKey, Integer, String

class Direccion(Base):
    __tablename__ = "direccion"

    id_direccion: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    id_usuario: Mapped[int] = mapped_column(ForeignKey("usuario.id_usuario"), nullable=False)
    calle: Mapped[str] = mapped_column(String(255), nullable=False)
    numero_ext: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    numero_int: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    colonia: Mapped[str] = mapped_column(String(100), nullable=False)
    ciudad: Mapped[str] = mapped_column(String(100), nullable=False)
    estado: Mapped[str] = mapped_column(String(100), nullable=False)
    numero_telefonico: Mapped[str] = mapped_column(String(20), nullable=False)
    codigo_postal: Mapped[str] = mapped_column(String(10), nullable=False)
    es_principal:  Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    # Relationships
    usuario: Mapped["Usuario"] = relationship(back_populates="direcciones")
    pedidos: Mapped[list["Pedido"]] = relationship(back_populates="direccion_envio")
