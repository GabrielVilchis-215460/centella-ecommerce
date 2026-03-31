from app.core.database import Base
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import Optional
from sqlalchemy import Integer, String

class Categoria(Base):
    __tablename__ = "categoria"

    id_categoria: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    nombre:       Mapped[str] = mapped_column(String(100), nullable=False, unique=True)
    descripcion:  Mapped[Optional[str]] = mapped_column(String(300), nullable=True)

    # Relationships
    productos: Mapped[list["Producto"]] = relationship(back_populates="categoria")
    servicios: Mapped[list["Servicio"]] = relationship(back_populates="categoria")