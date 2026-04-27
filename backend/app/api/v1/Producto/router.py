from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from .schemas import ProductoCreate, ProductoUpdate, ProductoRead
from . import service
from app.core.deps import require_emprendedora_or_admin

router = APIRouter(prefix="/productos", tags=["Productos"])


@router.get("/", response_model=list[ProductoRead])
def listar(skip: int = 0, limit: int = 20, db: Session = Depends(get_db)):
    return service.get_all(db, skip, limit)


@router.get("/{id_producto}", response_model=ProductoRead)
def obtener(id_producto: int, db: Session = Depends(get_db)):
    return service.get_by_id(db, id_producto)


@router.post("/", response_model=ProductoRead, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_emprendedora_or_admin)])
def crear(data: ProductoCreate, db: Session = Depends(get_db)):
    return service.create(db, data)


@router.put("/{id_producto}", response_model=ProductoRead, dependencies=[Depends(require_emprendedora_or_admin)])
def actualizar(id_producto: int, data: ProductoUpdate, db: Session = Depends(get_db)):
    return service.update(db, id_producto, data)


@router.delete("/{id_producto}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_emprendedora_or_admin)])
def eliminar(id_producto: int, db: Session = Depends(get_db)):
    service.delete(db, id_producto)