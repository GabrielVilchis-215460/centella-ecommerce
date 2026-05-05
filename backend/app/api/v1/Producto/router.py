from fastapi import APIRouter, Depends, status, UploadFile, File, HTTPException, Form
from sqlalchemy.orm import Session
from app.core.database import get_db
from .schemas import ProductoCreate, ProductoUpdate, ProductoRead, ImagenRead
from . import service
from app.core.deps import require_emprendedora_or_admin, require_emprendedora
from app.api.v1.Imagenes.service import ImageUploadService
from app.api.v1.Imagenes.router import get_service as get_image_service
from app.models.emprendedora import Emprendedora
from app.models.usuario import Usuario

router = APIRouter(prefix="/productos", tags=["Productos"])

@router.get("/", response_model=list[ProductoRead])
def listar(
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_emprendedora),
):
    emp = db.query(Emprendedora).filter(
        Emprendedora.id_usuario == current_user.id_usuario
    ).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Perfil no encontrado")
    return service.get_by_emprendedora(db, emp.id_emprendedora, skip, limit)

@router.get("/{id_producto}", response_model=ProductoRead)
def obtener(id_producto: int, db: Session = Depends(get_db)):
    return service.get_by_id(db, id_producto)

@router.post("/", response_model=ProductoRead, status_code=status.HTTP_201_CREATED)
def crear(
    data: ProductoCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_emprendedora),
):
    emp = db.query(Emprendedora).filter(
        Emprendedora.id_usuario == current_user.id_usuario
    ).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Perfil no encontrado")
    return service.create(db, data, emp.id_emprendedora)

@router.put("/{id_producto}", response_model=ProductoRead, dependencies=[Depends(require_emprendedora_or_admin)])
def actualizar(id_producto: int, data: ProductoUpdate, db: Session = Depends(get_db)):
    return service.update(db, id_producto, data)

@router.delete("/{id_producto}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_emprendedora_or_admin)])
def eliminar(id_producto: int, db: Session = Depends(get_db)):
    service.delete(db, id_producto)

@router.post(
    "/{id_producto}/imagenes",
    response_model=dict,
    status_code=status.HTTP_201_CREATED,
    openapi_extra={
        "requestBody": {
            "content": {
                "multipart/form-data": {
                    "schema": {
                        "type": "object",
                        "properties": {
                            "files": {
                                "type": "array",
                                "items": {
                                    "type": "string",
                                    "format": "binary"   
                                }
                            }
                        },
                        "required": ["files"]
                    }
                }
            }
        }
    }
)
def subir_imagenes_producto(
    id_producto: int,
    files: list[UploadFile] = File(..., media_type="multipart/form-data"),
    db: Session = Depends(get_db),
    current_user = Depends(require_emprendedora),
    image_service: ImageUploadService = Depends(get_image_service)
):
    """Sube múltiples imágenes asociadas a un producto"""
    
    # 1. Obtener el producto (lanzará 404 automáticamente si no existe gracias a tu service)
    producto = service.get_by_id(db, id_producto)
    emprendedora = current_user.emprendedora
    
    # 2. Seguridad: Verificar que el producto pertenece a esta emprendedora
    if not emprendedora or producto.id_emprendedora != emprendedora.id_emprendedora:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="No tienes permiso para agregar imágenes a este producto"
        )
        
    uploaded_images = []
    errors = []

    # 3. Iterar sobre las imágenes y subirlas
    for file in files:
        result = image_service.upload_image(
            file=file,
            entity_id=id_producto,
            entity_type="producto"
        )
        if result.get("success"):
            uploaded_images.append(result)
        else:
            errors.append({"filename": file.filename, "error": result.get("error", "Error desconocido")})

    # 4. Manejo de fallos totales
    if not uploaded_images and errors:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail={"message": "No se pudo subir ninguna imagen", "errors": errors}
        )

    return {
        "success": True,
        "message": f"Se subieron {len(uploaded_images)} imágenes. {len(errors)} fallaron.",
        "uploaded_images": uploaded_images,
        "errors": errors
    }

@router.get("/{id_producto}/imagenes", response_model=list[ImagenRead])
def obtener_imagenes_producto(id_producto: int, db: Session = Depends(get_db)):
    """Obtiene la lista de imágenes de un producto"""
    return service.get_imagenes_by_producto(db, id_producto)