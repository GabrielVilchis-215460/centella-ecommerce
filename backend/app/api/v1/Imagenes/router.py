from fastapi import APIRouter, UploadFile, File, Form, Depends, Query, status
from sqlalchemy.orm import Session
from app.models.imagen import Imagen
from app.core.database import get_db
from .service import ImageUploadService
from .schemas import ImageResponse, ImagesListResponse, ReordenarRequest

# Proteccion de roles
from app.core.deps import require_cliente, require_emprendedora

router = APIRouter(
    prefix="/imagenes", 
    tags=["Imagenes"]
)

#AWS ONLY ALLOWS 1 week of duration for presigned urls
ONE_WEEK = 7 * 24 * 60 * 60
 
def get_service(db: Session = Depends(get_db)) -> ImageUploadService:
    """Get service with injected session"""
    return ImageUploadService(db)
 
@router.post("/upload", response_model=ImageResponse#,  dependencies=[
        #Depends(require_cliente),
        #Depends(require_emprendedora)]
        )
async def upload_image(
    file: UploadFile = File(...),
    entity_id: int = Form(...),
    entity_type: str = Form(..., description="Type: 'producto', 'perfil', 'emprendedora', etc"),
    service: ImageUploadService = Depends(get_service)
):
    """Upload image for any entity"""
    return service.upload_image(file, entity_id, entity_type)
 
@router.get("/presigned-download/{id_imagen}")
async def get_presigned_download_url(
    id_imagen: int,
    expires_in: int = Query(ONE_WEEK, description="URL expiration in seconds (default: 1 year)"),
    service: ImageUploadService = Depends(get_service)
):
    """Get temporary presigned URL for downloading an image"""
    return service.get_presigned_download_url(id_imagen, expires_in)
 
@router.get("/{entity_type}/{entity_id}", response_model=ImagesListResponse)
async def get_images(
    entity_id: int,
    entity_type: str,
    service: ImageUploadService = Depends(get_service)
):
    """Get all images for any entity"""
    return service.get_entity_images(entity_id, entity_type)
 
@router.delete("/image/{id_imagen}")
async def delete_image(
    id_imagen: int,
    service: ImageUploadService = Depends(get_service)
):
    """Delete one image"""
    return service.delete_image(id_imagen)

@router.put("/reordenar", status_code=status.HTTP_200_OK)
def actualizar_orden_imagenes(
    data: ReordenarRequest, 
    db: Session = Depends(get_db)
):
    """Actualiza la columna 'orden' de múltiples imágenes a la vez"""
    # Recorremos la lista de IDs. 'index' será 0, 1, 2... dándoles el nuevo orden
    for index, id_img in enumerate(data.ids_imagenes):
        db.query(Imagen).filter(Imagen.id_imagen == id_img).update({"orden": index})
    
    db.commit()
    return {"message": "Orden de imágenes actualizado"}
 