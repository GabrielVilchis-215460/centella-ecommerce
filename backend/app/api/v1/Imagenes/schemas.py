"""
app/api/v1/imagenes/schema.py
Pydantic models for validation
"""

from pydantic import BaseModel


class ImageResponse(BaseModel):
    success: bool
    id_imagen: int = None
    url: str = None
    filename: str = None
    error: str = None


class ImagesListResponse(BaseModel):
    success: bool
    images: list