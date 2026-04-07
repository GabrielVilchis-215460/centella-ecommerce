from app.core.database import Base
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import Optional
from datetime import datetime
from decimal import Decimal
from sqlalchemy import DateTime, Enum, ForeignKey, Integer, Numeric, String
from .enum import EstadoPedidoEnum, MetodoPagoEnum

class Pedido(Base):
    __tablename__ = "pedido"

    id_pedido: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    id_cliente: Mapped[int] = mapped_column(ForeignKey("usuario.id_usuario"), nullable=False)
    id_emprendedora: Mapped[int] = mapped_column(ForeignKey("emprendedora.id_emprendedora"), nullable=False)
    fecha_pedido: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    estado: Mapped[EstadoPedidoEnum] = mapped_column(Enum(EstadoPedidoEnum), nullable=False)
    subtotal: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    costo_envio: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False, default=0)
    total: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    metodo_pago: Mapped[MetodoPagoEnum] = mapped_column(Enum(MetodoPagoEnum), nullable=False)
    id_direccion_envio: Mapped[Optional[int]] = mapped_column(ForeignKey("direccion.id_direccion"), nullable=True)
    numero_rastreo: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    codigo_qr_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    # Para guardar el ID del pago segun sea el metodo preferido
    proveedor_payment_id: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)

    # Relationships
    cliente: Mapped["Usuario"] = relationship(back_populates="pedidos", foreign_keys=[id_cliente])
    emprendedora: Mapped["Emprendedora"] = relationship(back_populates="pedidos", foreign_keys=[id_emprendedora])
    direccion_envio: Mapped[Optional["Direccion"]] = relationship(back_populates="pedidos")
    items: Mapped[list["ItemPedido"]] = relationship(back_populates="pedido")