from app.core.database import Base
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import Optional
from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, Integer, Numeric, String, Text
from datetime import datetime
from decimal import Decimal
from .enum import TipoEntregaEnum

class Producto(Base):
    __tablename__ = "producto"

    id_producto: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    id_emprendedora: Mapped[int]  = mapped_column(ForeignKey("emprendedora.id_emprendedora"), nullable=False)
    id_categoria: Mapped[int] = mapped_column(ForeignKey("categoria.id_categoria"), nullable=False)
    nombre: Mapped[str] = mapped_column(String(200), nullable=False)
    descripcion: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    precio: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    cantidad_stock: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    tipo_entrega: Mapped[TipoEntregaEnum] = mapped_column(Enum(TipoEntregaEnum), nullable=False)
    activo: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    fecha_creacion: Mapped[datetime] = mapped_column(DateTime, nullable=False)

    # Relationships
    emprendedora: Mapped["Emprendedora"] = relationship(back_populates="productos")
    categoria: Mapped["Categoria"] = relationship(back_populates="productos")
    imagenes: Mapped[list["ImagenProducto"]]  = relationship(back_populates="producto")
    atributos:  Mapped[list["AtributoProducto"]] = relationship(back_populates="producto")
    items_carrito: Mapped[list["ItemCarrito"]] = relationship(back_populates="producto")
    items_pedido: Mapped[list["ItemPedido"]]  = relationship(back_populates="producto")