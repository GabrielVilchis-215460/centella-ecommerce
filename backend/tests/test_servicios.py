import pytest
from app.main import app
from app.core.deps import require_emprendedora, require_emprendedora_or_admin
from app.models.usuario import Usuario

def mock_emprendedora():
    return Usuario(id_usuario=2, email="servicios@test.com", rol="emprendedora")

@pytest.mark.asyncio
async def test_crear_servicio_sin_autorizacion(async_client):
    """Debe retornar error de seguridad al intentar crear un servicio anónimo"""
    response = await async_client.post("/servicios/", json={"titulo": "Lectura Tarot"})
    assert response.status_code in [401, 403]

@pytest.mark.asyncio
async def test_crear_servicio_con_autorizacion_datos_incompletos(async_client):
    """Prueba que el validador de pydantic funcione al crear un servicio"""
    app.dependency_overrides[require_emprendedora] = mock_emprendedora
    
    response = await async_client.post("/servicios/", json={"titulo": "Asesoría"})
    
    app.dependency_overrides = {}
    assert response.status_code == 422

@pytest.mark.asyncio
async def test_eliminar_servicio_con_autorizacion(async_client):
    """Prueba que se intente eliminar un servicio con permisos suficientes"""
    app.dependency_overrides[require_emprendedora_or_admin] = mock_emprendedora
    
    response = await async_client.delete("/servicios/1")
    
    app.dependency_overrides = {}

    assert response.status_code == 404