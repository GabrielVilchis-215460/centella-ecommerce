from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import get_current_user, require_emprendedora
from app.models.usuario import Usuario
from app.api.v1.Perfil.schemas import (
    ActualizarPerfilRequest,
    DireccionRequest,
    ActualizarEmprendedoraRequest,
    CrearEmprendedoraRequest,
    ActualizarPaginaRequest
)
from app.api.v1.Perfil.service import (
    get_perfil,
    actualizar_perfil,
    eliminar_cuenta,
    get_direcciones,
    agregar_direccion,
    actualizar_direccion,
    eliminar_direccion,
    get_perfil_emprendedora,
    crear_perfil_emprendedora,
    actualizar_perfil_emprendedora,
    solicitar_insignia,
    subir_foto_perfil,
    solicitar_verificacion,
    get_pagina,
    actualizar_pagina,
    get_productos_negocio,
    get_servicios_negocio,
    subir_logo_emprendedora,
    get_etiquetas_negocio,
)
from app.models.emprendedora import Emprendedora

router = APIRouter(prefix="/perfil", tags=["Perfil"])


# Perfil general
@router.get("/", summary="Obtener perfil")
def obtener_perfil(current_user: Usuario = Depends(get_current_user)):
    return get_perfil(current_user)


@router.put("/", summary="Actualizar perfil")
def editar_perfil(
    data: ActualizarPerfilRequest,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return actualizar_perfil(data, current_user, db)


@router.post("/foto", summary="Subir foto de perfil")
def upload_foto_perfil(
    file: UploadFile = File(...),
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return subir_foto_perfil(file, current_user, db)


@router.delete("/", summary="Eliminar cuenta")
def borrar_cuenta(
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return eliminar_cuenta(current_user, db)


# Direcciones
@router.get("/direcciones", summary="Listar direcciones")
def listar_direcciones(
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return get_direcciones(current_user, db)


@router.post("/direcciones", status_code=201, summary="Agregar dirección")
def nueva_direccion(
    data: DireccionRequest,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return agregar_direccion(data, current_user, db)


@router.put("/direcciones/{id_direccion}", summary="Actualizar dirección")
def editar_direccion(
    id_direccion: int,
    data: DireccionRequest,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return actualizar_direccion(id_direccion, data, current_user, db)


@router.delete("/direcciones/{id_direccion}", summary="Eliminar dirección")
def borrar_direccion(
    id_direccion: int,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return eliminar_direccion(id_direccion, current_user, db)


# Emprendedora
@router.get("/negocio", summary="Obtener perfil de negocio")
def obtener_negocio(
    current_user: Usuario = Depends(require_emprendedora),
    db: Session = Depends(get_db),
):
    return get_perfil_emprendedora(current_user, db)


@router.post("/negocio", status_code=201, summary="Crear perfil de negocio")
def crear_negocio(
    data: CrearEmprendedoraRequest,
    current_user: Usuario = Depends(require_emprendedora),
    db: Session = Depends(get_db),
):
    return crear_perfil_emprendedora(data, current_user, db)


@router.put("/negocio", summary="Actualizar perfil de negocio")
def editar_negocio(
    data: ActualizarEmprendedoraRequest,
    current_user: Usuario = Depends(require_emprendedora),
    db: Session = Depends(get_db),
):
    return actualizar_perfil_emprendedora(data, current_user, db)


@router.post("/negocio/insignia", summary="Solicitar insignia Hecho en Juárez")
def pedir_insignia(
    current_user: Usuario = Depends(require_emprendedora),
    db: Session = Depends(get_db),
):
    return solicitar_insignia(current_user, db)


@router.post("/negocio/verificacion", summary="Solicitar verificación de negocio")
def pedir_verificacion(
    current_user: Usuario = Depends(require_emprendedora),
    db: Session = Depends(get_db),
):
    return solicitar_verificacion(current_user, db)

#  Página de emprendimiento 
@router.get("/negocio/pagina", summary="Obtener página de emprendimiento")
def obtener_pagina(
    current_user: Usuario = Depends(require_emprendedora),
    db: Session = Depends(get_db),
):
    return get_pagina(current_user, db)


@router.put("/negocio/pagina", summary="Actualizar página de emprendimiento")
def editar_pagina(
    data: ActualizarPaginaRequest,
    current_user: Usuario = Depends(require_emprendedora),
    db: Session = Depends(get_db),
):
    return actualizar_pagina(data, current_user, db)

###############################################
# NUEVO #
################################################
@router.get("/negocio/productos", summary="Obtener productos del negocio")
def obtener_productos_negocio(
    skip: int = 0,
    limit: int = 20,
    current_user: Usuario = Depends(require_emprendedora),
    db: Session = Depends(get_db),
):
    emp = db.query(Emprendedora).filter(
        Emprendedora.id_usuario == current_user.id_usuario
    ).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Perfil no encontrado")
    return get_productos_negocio(db, emp.id_emprendedora, skip, limit)

@router.get("/negocio/servicios", summary="Obtener servicios del negocio")
def obtener_servicios_negocio(
    skip: int = 0,
    limit: int = 20,
    current_user: Usuario = Depends(require_emprendedora),
    db: Session = Depends(get_db),
):
    emp = db.query(Emprendedora).filter(
        Emprendedora.id_usuario == current_user.id_usuario
    ).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Perfil no encontrado")
    return get_servicios_negocio(db, emp.id_emprendedora, skip, limit)

@router.post("/negocio/logo", summary="Subir logo del negocio")
def upload_logo(
    file: UploadFile = File(...),
    current_user: Usuario = Depends(require_emprendedora),
    db: Session = Depends(get_db),
):
    return subir_logo_emprendedora(file, current_user, db)

@router.get("/negocio/etiquetas", summary="Obtener etiquetas del negocio")
def obtener_etiquetas_negocio(
    #current_user: Usuario = Depends(require_emprendedora),
    id_emprendedora: int,
    db: Session = Depends(get_db),
):
    return get_etiquetas_negocio(id_emprendedora, db)