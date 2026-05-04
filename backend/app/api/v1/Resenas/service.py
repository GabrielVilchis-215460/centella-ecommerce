"""
app/api/v1/resenas/service.py
Business logic for reviews
"""

from datetime import datetime
from typing import Dict, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.resena import Resena
from app.models.enum import TipoResenaEnum
from app.models.usuario import Usuario

def create_resena(
    db: Session,
    id_cliente: int,
    id_emprendedora: int,
    tipo_resena: TipoResenaEnum,
    id_referencia: int,
    calificacion_item: int,
    calificacion_vendedora: int,
    comentario: Optional[str] = None
) -> Dict:
    """Create a new review"""
    
    # Check if review already exists
    existing = db.query(Resena).filter(
        Resena.id_cliente == id_cliente,
        Resena.id_emprendedora == id_emprendedora,
        Resena.tipo_resena == tipo_resena,
        Resena.id_referencia == id_referencia
    ).first()
    
    if existing:
        return {"success": False, "error": "Review already exists for this item"}
    
    # Create review
    resena = Resena(
        id_cliente=id_cliente,
        id_emprendedora=id_emprendedora,
        tipo_resena=tipo_resena,
        id_referencia=id_referencia,
        calificacion_item=calificacion_item,
        calificacion_vendedora=calificacion_vendedora,
        comentario=comentario,
        fecha=datetime.utcnow()
    )
    
    db.add(resena)
    db.commit()
    db.refresh(resena)
    
    return {
        "success": True,
        "id_resena": resena.id_resena,
        "message": "Review created successfully"
    }
 
 
def get_resena(db: Session, id_resena: int) -> Dict:
    """Get a specific review"""
    
    resena = db.query(Resena).filter(Resena.id_resena == id_resena).first()
    
    if not resena:
        return {"success": False, "error": "Review not found"}
    
    return {
        "success": True,
        "resena": {
            "id_resena": resena.id_resena,
            "id_cliente": resena.id_cliente,
            "id_emprendedora": resena.id_emprendedora,
            "tipo_resena": resena.tipo_resena.value,
            "id_referencia": resena.id_referencia,
            "calificacion_item": resena.calificacion_item,
            "calificacion_vendedora": resena.calificacion_vendedora,
            "comentario": resena.comentario,
            "fecha": resena.fecha.isoformat()
        }
    }
 
 
def get_resenas_by_referencia(
    db: Session,
    id_referencia: int,
    tipo_resena: TipoResenaEnum
) -> Dict:
    """Get all reviews for a product/service"""
    
    resenas = db.query(Resena).filter(
        Resena.id_referencia == id_referencia,
        Resena.tipo_resena == tipo_resena
    ).all()
    
    # Calculate averages
    promedio_item = 0
    promedio_vendedora = 0
    
    if resenas:
        promedio_item = sum(r.calificacion_item for r in resenas) / len(resenas)
        promedio_vendedora = sum(r.calificacion_vendedora for r in resenas) / len(resenas)

    ids_clientes = [r.id_cliente for r in resenas]
    usuarios = {
        u.id_usuario: u
        for u in db.query(Usuario).filter(Usuario.id_usuario.in_(ids_clientes)).all()
    } if ids_clientes else {}
    
    return {
        "success": True,
        "resenas": [
            {
                "id_resena": r.id_resena,
                "id_cliente": r.id_cliente,
                "nombre_cliente": f"{usuarios[r.id_cliente].nombre} {usuarios[r.id_cliente].apellido}" if r.id_cliente in usuarios else "Usuario",
                "foto_perfil_url": usuarios[r.id_cliente].foto_perfil_url if r.id_cliente in usuarios else None,
                "id_emprendedora": r.id_emprendedora,
                "tipo_resena": r.tipo_resena.value,
                "id_referencia": r.id_referencia,
                "calificacion_item": r.calificacion_item,
                "calificacion_vendedora": r.calificacion_vendedora,
                "comentario": r.comentario,
                "fecha": r.fecha.isoformat()
            }
            for r in resenas
        ],
        "total": len(resenas),
        "promedio_item": round(promedio_item, 2),
        "promedio_vendedora": round(promedio_vendedora, 2)
    }
 
 
def get_resenas_by_vendedora(db: Session, id_emprendedora: int) -> Dict:
    """Get all reviews for a seller"""
    
    resenas = db.query(Resena).filter(
        Resena.id_emprendedora == id_emprendedora
    ).all()
    
    promedio_item = 0
    promedio_vendedora = 0
    
    if resenas:
        promedio_item = sum(r.calificacion_item for r in resenas) / len(resenas)
        promedio_vendedora = sum(r.calificacion_vendedora for r in resenas) / len(resenas)
    
    return {
        "success": True,
        "resenas": [
            {
                "id_resena": r.id_resena,
                "id_cliente": r.id_cliente,
                "id_emprendedora": r.id_emprendedora,
                "tipo_resena": r.tipo_resena.value,
                "id_referencia": r.id_referencia,
                "calificacion_item": r.calificacion_item,
                "calificacion_vendedora": r.calificacion_vendedora,
                "comentario": r.comentario,
                "fecha": r.fecha.isoformat()
            }
            for r in resenas
        ],
        "total": len(resenas),
        "promedio_item": round(promedio_item, 2),
        "promedio_vendedora": round(promedio_vendedora, 2)
    }
 
 
def update_resena(
    db: Session,
    id_resena: int,
    id_cliente: int,
    calificacion_item: Optional[int] = None,
    calificacion_vendedora: Optional[int] = None,
    comentario: Optional[str] = None
) -> Dict:
    """Update a review (only by the author)"""
    
    resena = db.query(Resena).filter(Resena.id_resena == id_resena).first()
    
    if not resena:
        return {"success": False, "error": "Review not found"}
    
    # Check if user is the author
    if resena.id_cliente != id_cliente:
        return {"success": False, "error": "Unauthorized"}
    
    # Update fields
    if calificacion_item is not None:
        resena.calificacion_item = calificacion_item
    if calificacion_vendedora is not None:
        resena.calificacion_vendedora = calificacion_vendedora
    if comentario is not None:
        resena.comentario = comentario
    
    db.commit()
    db.refresh(resena)
    
    return {
        "success": True,
        "message": "Review updated successfully"
    }
 
 
def delete_resena(db: Session, id_resena: int, id_cliente: int) -> Dict:
    """Delete a review (only by the author)"""
    
    resena = db.query(Resena).filter(Resena.id_resena == id_resena).first()
    
    if not resena:
        return {"success": False, "error": "Review not found"}
    
    # Check if user is the author
    if resena.id_cliente != id_cliente:
        return {"success": False, "error": "Unauthorized"}
    
    db.delete(resena)
    db.commit()
    
    return {"success": True, "message": "Review deleted successfully"}
 
 
def get_average_ratings(
    db: Session,
    id_referencia: int,
    tipo_resena: TipoResenaEnum
) -> Dict:
    """Get average ratings for a product/service"""
    
    resenas = db.query(Resena).filter(
        Resena.id_referencia == id_referencia,
        Resena.tipo_resena == tipo_resena
    ).all()
    
    if not resenas:
        return {
            "success": True,
            "promedio_item": 0,
            "promedio_vendedora": 0,
            "total_resenas": 0
        }
    
    promedio_item = sum(r.calificacion_item for r in resenas) / len(resenas)
    promedio_vendedora = sum(r.calificacion_vendedora for r in resenas) / len(resenas)
    
    return {
        "success": True,
        "promedio_item": round(promedio_item, 2),
        "promedio_vendedora": round(promedio_vendedora, 2),
        "total_resenas": len(resenas)
    }