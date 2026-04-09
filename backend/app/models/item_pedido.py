from app.core.database import Base
from sqlalchemy.orm import Mapped, mapped_column, relationship
from decimal import Decimal
from typing import Optional
from sqlalchemy import Enum, ForeignKey, Integer, Numeric, String
from .enum import TipoEntregaItemEnum

class ItemPedido(Base):
    __tablename__ = "item_pedido"

    id_item_pedido: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    id_pedido: Mapped[int] = mapped_column(ForeignKey("pedido.id_pedido"), nullable=False)
    id_producto: Mapped[int] = mapped_column(ForeignKey("producto.id_producto"), nullable=False)
    nombre_producto: Mapped[str] = mapped_column(String(200), nullable=False)
    precio_unitario: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    cantidad: Mapped[int] = mapped_column(Integer, nullable=False)
    tipo_entrega: Mapped[TipoEntregaItemEnum] = mapped_column(Enum(TipoEntregaItemEnum), nullable=False)
    imagen_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)

    # Relationships
    pedido: Mapped["Pedido"] = relationship(back_populates="items")
    producto: Mapped["Producto"] = relationship(back_populates="items_pedido")