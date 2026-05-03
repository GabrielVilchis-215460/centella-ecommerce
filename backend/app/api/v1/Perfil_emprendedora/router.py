from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional

from app.core.database import get_db
from app.core.deps import require_cliente, require_emprendedora, get_current_user
from app.models.usuario import Usuario

from .schemas import (
    PaginaCreate,
    PaginaUpdate,
    PaginaRead
    #PaginaPublica,
)

from .service import (
    create_pagina,
    update_pagina,
    get_pagina_publica,
)
from fastapi import UploadFile, File
from app.api.v1.Imagenes.service import ImageUploadService

router = APIRouter(prefix="/paginas", tags=["Paginas"])

@router.get("/{id_emprendedora}")#, response_model=PaginaPublica)
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

@router.post("/", response_model=PaginaRead, dependencies=[Depends(require_emprendedora)])
def create(
    data: PaginaCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_emprendedora),
):
    try:
        return create_pagina(
            db,
            current_user,
            data.contenido or {},
            data.emprendedora.model_dump() if data.emprendedora else None,
        )
    except Exception as e:
        raise HTTPException(403, str(e))


@router.patch("/", response_model=PaginaRead, dependencies=[Depends(require_emprendedora)])
def update(
    data: PaginaUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_emprendedora),
):
    pagina = update_pagina(
        db,
        current_user,
        data.contenido,
        data.emprendedora.model_dump() if data.emprendedora else None,
    )

    if not pagina:
        raise HTTPException(404, "Página no encontrada")

    return pagina

def get_image_service(db: Session = Depends(get_db)) -> ImageUploadService:
    return ImageUploadService(db)

@router.post("/logo", response_model=dict, dependencies=[Depends(require_emprendedora)])
async def upload_logo(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_emprendedora),
    image_service: ImageUploadService = Depends(get_image_service),
):
    emprendedora = current_user.emprendedora
    if not emprendedora:
        raise HTTPException(404, "Emprendedora no encontrada")

    result = image_service.upload_image(
        file,
        entity_id=emprendedora.id_emprendedora,
        entity_type="emprendedora"
    )

    if not result.get("success"):
        raise HTTPException(400, result.get("error"))

    # Guarda la URL en emprendedora.logo_url
    emprendedora.logo_url = result["url"]
    db.commit()

    return result