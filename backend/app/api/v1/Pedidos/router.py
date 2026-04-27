from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.v1.Pedidos.schemas import ConfirmacionPedidoResponse, PedidoCreate, PedidoRead, PedidoUpdate
from app.api.v1.Pedidos.service import get_confirmacion_pedido, create_pedido, get_pedidos, get_pedido_by_id, delete_pedido, update_pedido
from app.core.deps import require_cliente, require_emprendedora, get_current_user
from app.models.usuario import Usuario
from app.models.enum import EstadoPedidoEnum, TipoUsuarioEnum, MetodoPagoEnum
from typing import Optional, List

router = APIRouter()

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



@router.get("/{pedido_id}", response_model=PedidoRead)
def get_one(
    pedido_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    pedido = get_pedido_by_id(db, pedido_id, current_user)

    if not pedido:
        raise HTTPException(404, "Pedido no encontrado")

    #return pedido
    try:
        # Usamos .get() para las llaves de primer nivel y acceso seguro para las anidadas
        return PedidoRead(
            id_pedido=pedido.get('id_pedido'),
            id_cliente=pedido.get('cliente', {}).get('id'),
            id_emprendedora=pedido.get('emprendedora', {}).get('id'),
            fecha_pedido=pedido.get('fecha'),
            estado=pedido.get('estado'),
            
            # Si 'subtotal' no viene en el dict, usamos el 'total' o 0 como respaldo
            subtotal=pedido.get('subtotal') or pedido.get('total', 0),
            costo_envio=pedido.get('costo_envio', 0),
            total=pedido.get('total', 0),
            
            # Aquí es donde fallaba: si no viene en el dict, Pydantic lanzará error 
            # a menos que el campo en PedidoRead sea Optional o le des un default aquí
            metodo_pago=pedido.get('metodo_pago'),
            
            # Acceso seguro a la dirección
            id_direccion_envio=pedido.get('direccion_envio', {}).get('id'),
            
            # Campos opcionales
            numero_rastreo=pedido.get('numero_rastreo'),
            codigo_qr_url=pedido.get('codigo_qr_url'),
            proveedor_payment_id=pedido.get('proveedor_payment_id')
        )
    except Exception as e:
        # Esto te dirá exactamente qué campo falta o está mal formateado
        print(f"Error detallado de validación: {e}")
        raise HTTPException(
            status_code=500, 
            detail=f"Error al procesar los datos del pedido: {str(e)}"
        )


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
    current_user: Usuario = Depends(require_emprendedora),
):
    pedido = update_pedido(db, pedido_id, data, current_user)

    if not pedido:
        raise HTTPException(403, "No autorizado o no existe")

    return pedido