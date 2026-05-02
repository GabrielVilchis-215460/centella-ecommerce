from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.v1.Pedidos.schemas import ConfirmacionPedidoResponse, PedidoCreate, PedidoRead, PedidoUpdate
from app.api.v1.Pedidos.service import get_confirmacion_pedido, create_pedido, get_pedidos, get_pedido_by_id, delete_pedido, update_pedido
from app.core.deps import require_cliente, require_emprendedora, get_current_user
from app.models.usuario import Usuario
from app.models.enum import EstadoPedidoEnum, TipoUsuarioEnum, MetodoPagoEnum
from typing import Optional, List

router = APIRouter(prefix="/pedidos", tags=["Pedidos"])

@router.get("/{id_pedido}/confirmacion", response_model=ConfirmacionPedidoResponse)
def confirmacion_pedido(
    id_pedido: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_cliente),
):
    return get_confirmacion_pedido(db, id_pedido)

@router.post("/", response_model=PedidoRead)
def create(
    data: PedidoCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    try:
        return create_pedido(db, data, current_user)
    except Exception as e:
        raise HTTPException(403, str(e))


@router.get("/", response_model=List[PedidoRead])
def list_pedidos(
    skip: int = 0,
    limit: int = 20,
    estado: Optional[EstadoPedidoEnum] = None,
    ordenar_por: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    return get_pedidos(
        db,
        current_user,
        skip,
        limit,
        estado,
        ordenar_por,
    )

@router.get("/{pedido_id}")
def get_one(
    pedido_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    pedido = get_pedido_by_id(db, pedido_id, current_user)
    if not pedido:
        raise HTTPException(404, "Pedido no encontrado")
    return pedido


@router.delete("/{pedido_id}")
def delete(
    pedido_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    if not delete_pedido(db, pedido_id, current_user):
        raise HTTPException(403, "No autorizado o no existe")

    return {"message": "Pedido eliminado"}


@router.patch("/{pedido_id}")#, response_model=PedidoRead)
def update(
    pedido_id: int,
    data: PedidoUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_emprendedora),
):
    pedido = update_pedido(db, pedido_id, data, current_user)

    if not pedido:
        raise HTTPException(403, "No autorizado o no existe")

    return pedido