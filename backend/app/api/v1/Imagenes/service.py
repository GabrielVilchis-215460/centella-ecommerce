"""
app/api/v1/imagenes/service.py
Image upload service - backend upload only
"""

import os
from typing import Dict
from fastapi import UploadFile
from sqlalchemy.orm import Session

from app.services.archivos_service import CloudflareR2Client
from app.models.imagen import Imagen



 
class ImageUploadService:
    """Handles image uploads for any entity"""
    
    ALLOWED_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.gif', '.webp'}
    MAX_FILE_SIZE = 100 * 1024 * 1024
    
    def __init__(self, db: Session):
        self.db = db
        self.r2 = CloudflareR2Client()
    
    def upload_image(self, file: UploadFile, entity_id: int, entity_type: str) -> Dict:
        """Upload image for any entity"""
        
        # Validate extension
        ext = os.path.splitext(file.filename)[1].lower()
        if ext not in self.ALLOWED_EXTENSIONS:
            return {"success": False, "error": f"Invalid file type: {ext}"}
        
        # Validate size
        if file.size and file.size > self.MAX_FILE_SIZE:
            return {"success": False, "error": "File too large"}
        
        # Read file
        file_data = file.file.read()
        
        # Upload to R2
        r2_result = self.r2.upload_image(file_data, file.filename)
        if not r2_result.get("success"):
            return r2_result
        
        # Save to database
        imagen = Imagen(
            entity_id=entity_id,
            entity_type=entity_type,
            r2_key=r2_result["key"],
            filename=file.filename,
            size=r2_result["size"],
            url=r2_result["url"],
            orden=0
        )
        
        self.db.add(imagen)
        self.db.commit()
        self.db.refresh(imagen)
        
        return {
            "success": True,
            "id_imagen": imagen.id_imagen,
            "url": imagen.url,
            "filename": imagen.filename
        }
    
    def get_presigned_download_url(self, id_imagen: int, expires_in: int = 31536000) -> Dict:
        """Get presigned URL for downloading an image"""
        
        imagen = self.db.query(Imagen).filter(
            Imagen.id_imagen == id_imagen
        ).first()
        
        if not imagen:
            return {"success": False, "error": "Image not found"}
        
        result = self.r2.generate_presigned_download_url(imagen.r2_key, expires_in)
        
        if result.get("success"):
            result["id_imagen"] = id_imagen
            result["filename"] = imagen.filename
        
        return result
    
    def delete_image(self, id_imagen: int) -> Dict:
        """Delete one image"""
        
        imagen = self.db.query(Imagen).filter(
            Imagen.id_imagen == id_imagen
        ).first()
        
        if not imagen:
            return {"success": False, "error": "Image not found"}
        
        r2_result = self.r2.delete_image(imagen.r2_key)
        if not r2_result.get("success"):
            return r2_result
        
        self.db.delete(imagen)
        self.db.commit()
        
        return {"success": True}
    
    def get_entity_images(self, entity_id: int, entity_type: str) -> Dict:
        """Get all images for any entity"""
        
        imagenes = self.db.query(Imagen).filter(
            Imagen.entity_id == entity_id,
            Imagen.entity_type == entity_type
        ).order_by(Imagen.orden).all()
        
        return {
            "success": True,
            "images": [
                {
                    "id_imagen": img.id_imagen,
                    "url": img.url,
                    "filename": img.filename,
                    "orden": img.orden
                }
                for img in imagenes
            ]
        }