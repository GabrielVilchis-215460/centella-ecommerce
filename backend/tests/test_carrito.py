import pytest
from app.main import app
from app.core.deps import get_current_user
from app.models.usuario import Usuario

def mock_cliente():
    return Usuario(id_usuario=5, email="cliente@compras.com", rol="cliente")

@pytest.mark.asyncio
async def test_obtener_carrito_sin_autorizacion(async_client):
    """Debe bloquear el acceso al carrito a usuarios anónimos"""
    response = await async_client.get("/carrito/")
    assert response.status_code in [401, 403]

@pytest.mark.asyncio
async def test_obtener_carrito_con_autorizacion(async_client):
    """Debe permitir ver el carrito a un usuario logueado"""
    app.dependency_overrides[get_current_user] = mock_cliente
    
    response = await async_client.get("/carrito/")
    
    app.dependency_overrides = {}
    assert response.status_code in [200, 404]

@pytest.mark.asyncio
async def test_agregar_item_carrito_datos_invalidos(async_client):
    """Simula al cliente agregando algo pero olvidando la cantidad"""
    app.dependency_overrides[get_current_user] = mock_cliente
    
    # Falta la "cantidad" o "id_producto" en el cuerpo
    response = await async_client.post("/carrito/items", json={})
    
    app.dependency_overrides = {}
    assert response.status_code == 422