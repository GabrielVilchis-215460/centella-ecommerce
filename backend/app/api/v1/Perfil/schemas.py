from pydantic import BaseModel
from typing import Optional
from datetime import date


#  Schemas de Usuario (perfil general) 

class ActualizarPerfilRequest(BaseModel):
    nombre: Optional[str] = None
    apellido: Optional[str] = None
    fecha_nacimiento: Optional[date] = None
    foto_perfil_url: Optional[str] = None


#  Schemas de Direccion 

class DireccionRequest(BaseModel):
    calle: str
    numero_ext: Optional[str] = None
    numero_int: Optional[str] = None
    colonia: str
    ciudad: str
    estado: str
    numero_telefonico: str
    codigo_postal: str
    es_principal: bool = False


class DireccionResponse(BaseModel):
    id_direccion: int
    calle: str
    numero_ext: Optional[str] = None
    numero_int: Optional[str] = None
    colonia: str
    ciudad: str
    estado: str
    numero_telefonico: str
    codigo_postal: str
    es_principal: bool

    class Config:
        from_attributes = True


#  Schemas de Emprendedora 

class ActualizarEmprendedoraRequest(BaseModel):
    nombre_negocio: Optional[str] = None
    logo_url: Optional[str] = None
    descripcion_negocio: Optional[str] = None
    enlace_redes_sociales: Optional[dict] = None
    color_emprendedora_hex: Optional[str] = None


class CrearEmprendedoraRequest(BaseModel):
    nombre_negocio: str
    logo_url: Optional[str] = None
    descripcion_negocio: Optional[str] = None
    enlace_redes_sociales: dict = {}
    color_emprendedora_hex: str = "#872B3D"


#  Schemas de Pagina Emprendimiento 

class ActualizarPaginaRequest(BaseModel):
    contenido: Optional[dict] = None