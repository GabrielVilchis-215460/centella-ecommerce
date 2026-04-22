from app.api.v1.Auth.schemas import RegistroRequest, LoginRequest, ResetPasswordRequest
from app.api.v1.Auth.service import register_user, verify_email, login_user, get_me_user, reset_password

@router.post("/register", status_code=201)
async def register(data: RegistroRequest, db: Session = Depends(get_db)):
    return await register_user(data, db)  # async por el email

@router.get("/verify")
def verify(token: str, db: Session = Depends(get_db)):
    return verify_email(token, db)

@router.put("/reset-password")
def reset_pwd(data: ResetPasswordRequest, current_user: Usuario = Depends(get_current_user), db: Session = Depends(get_db)):
    return reset_password(data, current_user, db)