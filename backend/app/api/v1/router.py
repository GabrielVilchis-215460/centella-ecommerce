from fastapi import APIRouter
from app.api.v1.Producto.router import router as producto_router
from app.api.v1.Servicio.router import router as servicio_router

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(producto_router)
api_router.include_router(servicio_router)