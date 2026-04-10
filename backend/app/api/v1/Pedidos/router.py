from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.v1.Pedidos.schemas import ConfirmacionPedidoResponse
from app.api.v1.Pedidos.service import get_confirmacion_pedido
from app.core.deps import get_current_user
from app.models.usuario import Usuario

router = APIRouter()

@router.get("/{id_pedido}/confirmacion", response_model=ConfirmacionPedidoResponse)
def confirmacion_pedido(id_pedido: int, db: Session = Depends(get_db), current_user: Usuario = Depends(get_current_user)):
    return get_confirmacion_pedido(db, id_pedido)