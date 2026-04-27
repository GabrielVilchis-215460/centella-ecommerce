from fastapi import APIRouter
from app.api.v1.Producto.router import router as producto_router
from app.api.v1.Servicio.router import router as servicio_router
from app.api.v1.Catalogo.router import router as catalogo_router
from app.api.v1.Auth.routes import router as auth_router
from app.api.v1.Imagenes.router import router as imagen_router
from app.api.v1.Resenas.router import router as resena_router
from app.api.v1.Reportes.routes import router as reportes_router
from app.api.v1.Dashboard_emprendedora import router as dashboard_emprendedora
from app.api.v1.Admin_panel import router as admin_panel
from app.api.v1.Pedidos.router import router as pedidos_router
from app.api.v1.Perfil_emprendedora.router import router as perfil_emprendedora_router
from app.api.v1.Envios.routes import router as envios_router
from app.api.v1.Pagos.routes import router as pagos_router

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(auth_router)
api_router.include_router(producto_router)
api_router.include_router(servicio_router)
api_router.include_router(catalogo_router)
api_router.include_router(imagen_router)
api_router.include_router(resena_router)
api_router.include_router(reportes_router)
api_router.include_router(dashboard_emprendedora)
api_router.include_router(admin_panel)
api_router.include_router(pedidos_router)
api_router.include_router(perfil_emprendedora_router)
api_router.include_router(envios_router)
api_router.include_router(pagos_router)