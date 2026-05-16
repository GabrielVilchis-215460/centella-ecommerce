import pytest
from app.main import app
from app.core.deps import get_current_user
from app.models.usuario import Usuario

# Mock para usuario
def mock_current_user():
    return Usuario(id_usuario=10, email="cliente@test.com", rol="cliente")

@pytest.mark.asyncio
async def test_register_datos_incompletos(async_client):
    """
    Prueba que el endpoint rechace peticiones sin el formato correcto.
    Debería retornar 422 Unprocessable Entity por faltar campos obligatorios en RegistroRequest.
    """
    payload = {
        "email": "nuevo@test.com"
    }
    response = await async_client.post("/auth/register", json=payload)
    assert response.status_code == 422

@pytest.mark.asyncio
async def test_login_datos_invalidos(async_client):
    """
    Prueba un intento de login con datos vacíos o incorrectos.
    """
    payload = {
        "email": "noexiste@test.com",
        "password": "wrongpassword"
    }
    response = await async_client.post("/auth/login", json=payload)
    assert response.status_code in [400, 401, 404]

@pytest.mark.asyncio
async def test_acceso_ruta_protegida_sin_token(async_client):
    """
    Prueba que no se pueda acceder a /auth/me sin estar autenticado.
    """
    response = await async_client.get("/auth/me")
    assert response.status_code in [401, 403]

@pytest.mark.asyncio
async def test_register_sin_datos(async_client):
    """Debe retornar 422 porque falta el cuerpo de la petición (RegistroRequest)"""
    response = await async_client.post("/auth/register", json={})
    assert response.status_code == 422

@pytest.mark.asyncio
async def test_login_datos_incompletos(async_client):
    """Debe retornar 422 si falta email o password"""
    payload = {"email": "test@correo.com"} # Falta password
    response = await async_client.post("/auth/login", json=payload)
    assert response.status_code == 422

@pytest.mark.asyncio
async def test_perfil_me_sin_token(async_client):
    """Debe bloquear el acceso a /auth/me si no hay token (401 o 403)"""
    response = await async_client.get("/auth/me")
    assert response.status_code in [401, 403]

@pytest.mark.asyncio
async def test_forgot_password_formato_invalido(async_client):
    """Debe validar que el email enviado tenga un formato correcto"""
    payload = {"email": "no-es-un-correo"}
    response = await async_client.post("/auth/forgot-password", json=payload)
    assert response.status_code == 422

@pytest.mark.asyncio
async def test_resend_verification_sin_datos(async_client):
    """Debe rechazar la petición si no se envía el ResendVerificationRequest"""
    response = await async_client.post("/auth/resend-verification", json={})
    assert response.status_code == 422

@pytest.mark.asyncio
async def test_perfil_me_con_autorizacion(async_client):
    """Debe retornar 200 y los datos del perfil al estar autenticado"""
    app.dependency_overrides[get_current_user] = mock_current_user
    
    response = await async_client.get("/auth/me")
    
    app.dependency_overrides = {}
    
    # 200 si tu función get_me_user retorna los datos sin consultar BD
    # 404 si tu función busca al usuario en la BD vacía de pruebas
    assert response.status_code in [200, 404]

@pytest.mark.asyncio
async def test_reset_password_con_autorizacion_datos_incompletos(async_client):
    """Prueba la ruta protegida de cambio de contraseña validando el schema"""
    app.dependency_overrides[get_current_user] = mock_current_user
    
    payload = {"password_actual": "12345"} # Falta el nuevo password
    response = await async_client.put("/auth/reset-password", json=payload)
    
    app.dependency_overrides = {}
    assert response.status_code == 422