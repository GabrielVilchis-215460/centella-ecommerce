from app.core.database import Base
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import Optional
from sqlalchemy import Enum, ForeignKey, Integer
from .enum import TipoEntregaItemEnum

class ItemCarrito(Base):
    __tablename__ = "item_carrito"

    id_item: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    id_carrito: Mapped[int] = mapped_column(ForeignKey("carrito.id_carrito"), nullable=False)
    id_producto: Mapped[int] = mapped_column(ForeignKey("producto.id_producto"), nullable=False)
    cantidad: Mapped[int]  = mapped_column(Integer, nullable=False, default=1)
    tipo_entrega_seleccionado: Mapped[Optional[TipoEntregaItemEnum]] = mapped_column(Enum(TipoEntregaItemEnum), nullable=True)

    # Relationships
    carrito: Mapped["Carrito"] = relationship(back_populates="items")
    producto: Mapped["Producto"] = relationship(back_populates="items_carrito")
