from app.core.database import Base
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import ForeignKey, Integer

class Carrito(Base):
    __tablename__ = "carrito"

    id_carrito: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    id_cliente: Mapped[int] = mapped_column(ForeignKey("usuario.id_usuario"), nullable=False, unique=True)

    # Relationships
    cliente: Mapped["Usuario"]          = relationship(back_populates="carrito")
    items:   Mapped[list["ItemCarrito"]] = relationship(back_populates="carrito")