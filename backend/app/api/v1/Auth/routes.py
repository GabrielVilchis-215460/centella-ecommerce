from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.usuario import Usuario

from app.api.v1.Auth.schemas import (
    RegistroRequest,
    LoginRequest,
    ResetPasswordRequest,
    ForgotPasswordRequest,
    ConfirmResetRequest,
    VerifyEmailRequest,
    NewPasswordRequest,
    ResendVerificationRequest,
    ForgotPasswordRequest,
)
from app.api.v1.Auth.service import (
    register_user,
    verify_email,
    login_user,
    get_me_user,
    reset_password,
    forgot_password,
    confirm_reset,
    new_password,
    resend_verification_code,
    resend_reset_code
)

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register", status_code=201, summary="Registrar usuario")
async def register(data: RegistroRequest, db: Session = Depends(get_db)):
    """Registra un nuevo usuario y envía código de verificación por correo."""
    return await register_user(data, db)


@router.post("/verify", summary="Verificar correo")
def verify(data: VerifyEmailRequest, db: Session = Depends(get_db)):
    """Verifica el email de un usuario mediante el código enviado por correo."""
    return verify_email(data.email, data.codigo, db)


@router.post("/login", summary="Iniciar sesión")
def login(data: LoginRequest, db: Session = Depends(get_db)):
    """Autentica al usuario y devuelve un JWT."""
    return login_user(data, db)


@router.get("/me", summary="Obtener perfil")
def me(current_user: Usuario = Depends(get_current_user)):
    """Devuelve el perfil del usuario autenticado."""
    return get_me_user(current_user)


@router.put("/reset-password", summary="Cambiar contraseña")
def reset_pwd(
    data: ResetPasswordRequest,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Cambia la contraseña del usuario autenticado."""
    return reset_password(data, current_user, db)


@router.post("/forgot-password", summary="Olvidé mi contraseña")
async def forgot_pwd(data: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """Envía un código de recuperación al correo del usuario."""
    return await forgot_password(data, db)


@router.post("/confirm-reset", summary="Confirmar código de recuperación")
def confirm_reset_pwd(data: ConfirmResetRequest, db: Session = Depends(get_db)):
    """Verifica el código de recuperación."""
    return confirm_reset(data, db)


@router.post("/new-password", summary="Establecer nueva contraseña")
def set_new_password(data: NewPasswordRequest, db: Session = Depends(get_db)):
    """Establece la nueva contraseña tras confirmar el código."""
    return new_password(data, db)

@router.post("/resend-verification", summary="Reenviar código de verificación")
async def resend_verification(data: ResendVerificationRequest, db: Session = Depends(get_db)):
    """Reenvía el código de verificación al correo, si aún no está verificado."""
    return await resend_verification_code(data, db)

@router.post("/resend-reset-code", summary="Reenviar código de contraseña")
async def resend_reset_code_route(data: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """Reenvia el codigo de reestablecimiento de contraseña al correo de ser solicitado"""
    return await resend_reset_code(data, db)