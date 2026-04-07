from app.core.database import Base
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import Enum, ForeignKey, Integer, String, Boolean
from .enum import TipoAtributoEnum

class AtributoProducto(Base):
    __tablename__ = "atributo_producto"

    id_atributo: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    id_producto: Mapped[int] = mapped_column(ForeignKey("producto.id_producto"), nullable=False)
    tipo: Mapped[TipoAtributoEnum] = mapped_column(Enum(TipoAtributoEnum), nullable=False)
    valor: Mapped[str] = mapped_column(String(100), nullable=False)
    # este atributo es para gestionar atributos de un producto que se quiera modificar su existencia
    atributo_activo: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    # Relationships
    producto: Mapped["Producto"] = relationship(back_populates="atributos")
