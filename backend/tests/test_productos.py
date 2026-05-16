import pytest
from app.main import app
from app.core.deps import require_emprendedora, require_emprendedora_or_admin
from app.models.usuario import Usuario

# Mocks para dependencias

def mock_require_emprendedora():
    """
    Simula un usuario autenticado que pasa la validación de emprendedora.
    """
    return Usuario(id_usuario=999, email="emprendedora@test.com", rol="emprendedora")

def mock_emprendedora():
    """Simula una emprendedora autenticada para saltar la validación del JWT"""
    return Usuario(id_usuario=1, email="emprendedora@test.com", rol="emprendedora")

# Tests 
@pytest.mark.asyncio
async def test_listar_productos_sin_autorizacion(async_client):
    """
    Verifica que la ruta esté protegida si no hay sesión.
    """
    response = await async_client.get("/productos/")
    assert response.status_code in [401, 403]


@pytest.mark.asyncio
async def test_listar_productos_con_autorizacion(async_client):
    """
    Verifica que la ruta responda cuando SÍ hay una emprendedora autenticada.
    """
    app.dependency_overrides[require_emprendedora] = mock_require_emprendedora
    
    response = await async_client.get("/productos/")

    app.dependency_overrides = {}
    
    assert response.status_code in [200, 404]


@pytest.mark.asyncio
async def test_crear_producto_invalido(async_client):
    """
    Verifica la validación de Pydantic al intentar crear un producto sin datos.
    """
    app.dependency_overrides[require_emprendedora] = mock_require_emprendedora
    
    response = await async_client.post("/productos/", json={"nombre": "Camiseta"})
    
    app.dependency_overrides = {}
    
    assert response.status_code == 422

@pytest.mark.asyncio
async def test_obtener_producto_inexistente(async_client):
    """Debe retornar 404 al buscar un ID que no existe en la base de datos"""
    response = await async_client.get("/productos/999999")
    assert response.status_code == 404

@pytest.mark.asyncio
async def test_crear_producto_sin_autenticacion(async_client):
    """Debe bloquear la creación de productos si no hay sesión iniciada"""
    response = await async_client.post("/productos/", json={"nombre": "Bolsa Artesanal"})
    assert response.status_code in [401, 403]

@pytest.mark.asyncio
async def test_crear_producto_con_autenticacion_datos_incompletos(async_client):
    """Simula el login, pero falla intencionalmente la validación de Pydantic"""
    app.dependency_overrides[require_emprendedora] = mock_emprendedora
    
    response = await async_client.post("/productos/", json={"nombre": "Camisa"})

    app.dependency_overrides = {}

    assert response.status_code == 422

@pytest.mark.asyncio
async def test_obtener_imagenes_producto(async_client):
    """Verifica que el endpoint de imágenes responda correctamente"""
    response = await async_client.get("/productos/1/imagenes")
    assert response.status_code in [200, 404]

@pytest.mark.asyncio
async def test_crear_atributo_sin_permisos(async_client):
    """Verifica la protección de las rutas anidadas de atributos"""
    payload = {
        "tipo": "COLOR",
        "valor": "Rojo",
        "atributo_activo": True
    }
    response = await async_client.post("/productos/1/atributos?tipo=COLOR&valor=Rojo")
    assert response.status_code in [401, 403]

@pytest.mark.asyncio
async def test_actualizar_producto_sin_autorizacion(async_client):
    """Debe bloquear la edición (PUT) si no hay token"""
    response = await async_client.put("/productos/1", json={"nombre": "Nuevo Nombre"})
    assert response.status_code in [401, 403]

@pytest.mark.asyncio
async def test_actualizar_producto_con_autorizacion(async_client):
    """Verifica que el endpoint de edición intente procesar la solicitud con sesión"""
    app.dependency_overrides[require_emprendedora_or_admin] = mock_emprendedora
    
    response = await async_client.put("/productos/1", json={"nombre": "Producto Editado"})
    
    app.dependency_overrides = {}
    
    assert response.status_code == 404

@pytest.mark.asyncio
async def test_eliminar_producto_con_autorizacion(async_client):
    """Verifica el flujo de eliminación lógica/física con sesión válida"""
    app.dependency_overrides[require_emprendedora_or_admin] = mock_emprendedora
    
    response = await async_client.delete("/productos/1")
    
    app.dependency_overrides = {}

    assert response.status_code == 404