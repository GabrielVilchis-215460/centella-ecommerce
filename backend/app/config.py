# bilchis
import json
from typing import List
#from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # Datos de la app
    APP_NAME: str = "Centella E-Commerce API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    # BD
    DATABASE_URL: str

    # API de envios
    ENVIA_BASE_URL: str
    ENVIA_API_KEY: str
    STORE_NAME: str
    STORE_PHONE: str
    STORE_STREET: str
    STORE_CITY: str
    STORE_STATE: str
    STORE_COUNTRY: str
    STORE_POSTAL_CODE: str
    STORE_NUMBER: str

    # Stripe
    STRIPE_API: str
    STRIPE_SECRET_API: str

    # CloudFlare bucket
    BUCKET_NAME: str
    BUCKET_API: str
    BUCKET_API_TOKEN: str
    BUCKET_ACCESS_KEY: str
    BUCKET_ACCESS_KEY_SECRET: str
    BUCKET_ACCOUNT_ID: str

    # Paypal
    PAYPAL_SECRET_API: str
    PAYPAL_CLIENT_ID: str
    PAYPAL_API_BASE_URL: str

    # Fastapi mail config
    MAIL_USERNAME: str
    MAIL_PASSWORD: str
    MAIL_FROM: str
    MAIL_PORT: int
    MAIL_SERVER: str
    MAIL_FROM_NAME: str
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [] # localhost y los urls de app del backend y front desplegados
    APP_URL: str # url del back desplegado
    CANCEL_URL: str # url del front desplegado (vista de checkout o carrito puede ser)

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )
    """
    Funcion para verificar el estado de las variables de entorno, solo se ejecuta si DEBUG esta en true
    """
    def print_debug_info(self):
        print("\n" + "="*50)
        # Estado del debug
        print(f"DEBUG INFO - {self.APP_NAME} v{self.APP_VERSION}")
        print("="*50)
        # Info de la app
        #print(f"App URL: {self.APP_URL}")
        # Info de los origines del CORS
        print(f"CORS: {self.BACKEND_CORS_ORIGINS}")
        # Api de envio    
        print("\n Api de Envia.com:")
        print(f"   API Key: {'✓' if self.ENVIA_API_KEY else '✗'}")
        # Apis de pagos    
        print("\n Apis de pagos (Stripe, PayPal):")
        print(f"   Stripe API:    {'✓' if self.STRIPE_API else '✗'}")
        print(f"   PayPal Client: {'✓' if self.PAYPAL_CLIENT_ID else '✗'}")
        # Bucket de cloudflare 
        print("\nCloudFlare bucket:")
        print(f"   Bucket: {self.BUCKET_NAME}")
        print(f"   API:    {'✓' if self.BUCKET_API else '✗'}")
        # Base de datos
        print("\n Base de datos:")
        db_preview = self.DATABASE_URL[:25] + "..." if self.DATABASE_URL else "✗ NO DEFINIDA"
        print(f"   URL: {db_preview}")
        print("="*50 + "\n")


# Instancia global de configuracion
settings = Settings()
