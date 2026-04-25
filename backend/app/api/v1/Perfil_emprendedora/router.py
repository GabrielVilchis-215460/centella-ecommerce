from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional

from app.core.database import get_db
from app.api.v1.Pedidos.router import get_current_user
from app.models.usuario import Usuario

from .schemas import (
    PaginaCreate,
    PaginaUpdate,
    PaginaRead,
    PaginaPublica,
)

from .service import (
    create_pagina,
    update_pagina,
    get_pagina_publica,
)

router = APIRouter(prefix="/paginas", tags=["Paginas"])

@router.get("/{id_emprendedora}", response_model=PaginaPublica)
def get_public_page(
    id_emprendedora: int,
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
):
    result = get_pagina_publica(
        db,
        id_emprendedora,
        skip,
        limit,
    )

    if not result:
        raise HTTPException(404, "Página no encontrada")

    return result

@router.post("/", response_model=PaginaRead)
def create(
    data: PaginaCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    try:
        return create_pagina(
            db,
            current_user,
            data.contenido or {},
        )
    except Exception as e:
        raise HTTPException(403, str(e))
    

@router.patch("/", response_model=PaginaRead)
def update(
    data: PaginaUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    pagina = update_pagina(
        db,
        current_user,
        data.contenido,
    )

    if not pagina:
        raise HTTPException(404, "Página no encontrada")

    return pagina