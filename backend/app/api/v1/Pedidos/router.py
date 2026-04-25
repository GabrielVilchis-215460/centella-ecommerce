from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.database import get_db
#from app.core.auth import get_current_user
from app.models.usuario import Usuario
from app.models.enum import EstadoPedidoEnum, TipoUsuarioEnum

from .schemas import PedidoCreate, PedidoRead, PedidoUpdate
from .service import (
    create_pedido,
    get_pedidos,
    get_pedido_by_id,
    delete_pedido,
    update_pedido,
)


def get_current_user():
    # ⚠️ SOLO TEMPORAL
    return Usuario(
        id_usuario=1,
        email="test@test.com",
        contrasena="",
        tipo_usuario=TipoUsuarioEnum.cliente,
        nombre="Test",
        apellido="User",
        fecha_registro=None,
    )

router = APIRouter(prefix="/pedidos", tags=["Pedidos"])


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



@router.get("/{pedido_id}", response_model=PedidoRead)
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


@router.patch("/{pedido_id}", response_model=PedidoRead)
def update(
    pedido_id: int,
    data: PedidoUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    pedido = update_pedido(db, pedido_id, data, current_user)

    if not pedido:
        raise HTTPException(403, "No autorizado o no existe")

    return pedido