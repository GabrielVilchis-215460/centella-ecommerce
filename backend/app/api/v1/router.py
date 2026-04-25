from fastapi import APIRouter
from app.api.v1.Producto.router import router as producto_router
from app.api.v1.Servicio.router import router as servicio_router
from app.api.v1.Catalogo.router import router as catalogo_router
from app.api.v1.Imagenes.router import router as imagen_router
from app.api.v1.Resenas.router import router as resena_router
api_router = APIRouter(prefix="/api/v1")

api_router.include_router(producto_router)
api_router.include_router(servicio_router)
api_router.include_router(catalogo_router)
api_router.include_router(imagen_router)
api_router.include_router(resena_router)