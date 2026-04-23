"""
app/api/v1/imagenes/router.py
Image upload endpoints
"""

from fastapi import APIRouter, UploadFile, File, Form, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from .service import ImageUploadService
from .schemas import ImageResponse, ImagesListResponse


router = APIRouter(prefix="/imagenes", tags=["Imagenes"])

#AWS ONLY ALLOWS 1 week of duration for presigned urls
ONE_YEAR = 7 * 24 * 60 * 60
 
 
def get_service(db: Session = Depends(get_db)) -> ImageUploadService:
    """Get service with injected session"""
    return ImageUploadService(db)
 
 
@router.post("/upload", response_model=ImageResponse)
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
    expires_in: int = Query(ONE_YEAR, description="URL expiration in seconds (default: 1 year)"),
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
 