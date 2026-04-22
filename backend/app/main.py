from fastapi import FastAPI
from app.config import settings
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.api.v1.Auth.routes import router as auth_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Variables de entorno cargadas con exito!")
    settings.print_debug_info()
    yield
    print("Deteniendo la API..")

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api/v1") 

@app.get("/")
def root():
    return {
        "message": "API corriendo exitosamente!",
        "docs": "/docs",
        "api_v1":"/api/v1"
        }
