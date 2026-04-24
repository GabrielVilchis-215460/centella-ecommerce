from app.config import settings
import base64
from fastapi_mail import ConnectionConfig, FastMail, MessageSchema, MessageType
import tempfile
import os

conf = ConnectionConfig(
    MAIL_USERNAME = settings.MAIL_USERNAME,
    MAIL_PASSWORD = settings.MAIL_PASSWORD,
    MAIL_FROM = settings.MAIL_FROM,
    MAIL_PORT = settings.MAIL_PORT,
    MAIL_SERVER = settings.MAIL_SERVER,
    MAIL_FROM_NAME = settings.MAIL_FROM_NAME,
    MAIL_STARTTLS = True,
    MAIL_SSL_TLS = False,
    USE_CREDENTIALS = True,
    VALIDATE_CERTS = True
)

# Estilos comunes para reutilizar
FONT_IMPORT = '<link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@700&family=Poppins:wght@400;600&display=swap" rel="stylesheet">'
BASE_STYLE = "font-family: 'Poppins', Arial, sans-serif; border: 1px solid #ddd; padding: 20px; border-radius: 10px; max-width: 600px; color: #333;"
TITLE_STYLE = "font-family: 'Libre Baskerville', serif; color: #872B3D; margin-top: 0;"

async def enviar_correo_guia(email_destino: str, nombre_cliente: str, tracking_number: str, label_url: str):
    """
    Función para enviar el link del PDF y el rastreo al cliente con la nueva identidad visual.
    """
    html = f"""
    <html>
    <head>{FONT_IMPORT}</head>
    <body>
        <div style="{BASE_STYLE}">
            <h2 style="{TITLE_STYLE}">¡Tu pedido de Centella ha sido enviado!</h2>
            <p>Hola <strong>{nombre_cliente}</strong>,</p>
            <p>Tu paquete ya está en manos de la paquetería.</p>
            <p><strong>Número de rastreo:</strong> <span style="color: #8D75BD; font-weight: bold;">{tracking_number}</span></p>
            <br>
            <div style="margin-bottom: 25px;">
                <a href="{label_url}" 
                   style="background-color: #872B3D; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: 600;">
                   Descargar Etiqueta de Envío (PDF)
                </a>
            </div>
            <p>Para rastrear tu pedido en tiempo real, haz clic abajo:</p>
            <a href="https://dev.envia.com/es-MX/tracking" 
               style="background-color: #9F4658; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: 600;">
               Rastrear mi pedido
            </a>
            <p style="margin-top: 30px; font-size: 11px; color: #7f8c8d; border-top: 1px solid #eee; padding-top: 10px;">
                Este es un correo automático de prueba generado por el sistema Centella.
            </p>
        </div>
    </body>
    </html>
    """

    message = MessageSchema(
        subject="Información de tu Envío - Centella",
        recipients=[email_destino],
        body=html,
        subtype=MessageType.html
    )

    fm = FastMail(conf)
    await fm.send_message(message)

async def enviar_correo_qr(
    email_destino: str,
    nombre_cliente: str,
    pedido_id: int,
    qr_base64: str,
):
    html = f"""
    <html>
    <head>{FONT_IMPORT}</head>
    <body>
        <div style="{BASE_STYLE}">
            <h2 style="{TITLE_STYLE}">¡Tu pedido está listo para recoger!</h2>
            <p>Hola <strong>{nombre_cliente}</strong>,</p>
            <p>Tu pedido <strong style="color: #8D75BD;">#{pedido_id}</strong> está listo para ser recogido en el punto de entrega.</p>
            <p>Presenta el siguiente código QR al momento de recoger tu pedido:</p>
            <div style="text-align: center; margin: 25px 0;">
                <img src="cid:qr_pedido" alt="QR Pedido #{pedido_id}" style="width: 200px; height: 200px; border: 1px solid #eee;" />
            </div>
            <p style="margin-top: 30px; font-size: 11px; color: #7f8c8d; border-top: 1px solid #eee; padding-top: 10px;">
                Este es un correo automático generado por el sistema.
            </p>
        </div>
    </body>
    </html>
    """

    img_bytes = base64.b64decode(qr_base64)
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".png")
    tmp.write(img_bytes)
    tmp.close()

    try:
        message = MessageSchema(
            subject=f"Código QR para recoger tu pedido #{pedido_id}",
            recipients=[email_destino],
            body=html,
            subtype=MessageType.html,
            attachments=[tmp.name],
        )
        fm = FastMail(conf)
        await fm.send_message(message)
    finally:
        os.unlink(tmp.name)

async def enviar_correo_pedido(
    email_destino: str,
    nombre_cliente: str,
    pedido_id: int,
    tiene_envio: bool,
    tiene_fisica: bool,
    tracking_number: str | None = None,
    label_url: str | None = None,
    track_url: str | None = None,
    qr_base64: str | None = None,
):
    """
    Decide qué correo(s) mandar según el tipo de entrega del pedido.
    """
    if tiene_envio and tracking_number:
        await enviar_correo_guia(
            email_destino=email_destino,
            nombre_cliente=nombre_cliente,
            tracking_number=tracking_number,
            label_url=label_url,
        )

    if tiene_fisica and qr_base64:
        await enviar_correo_qr(
            email_destino=email_destino,
            nombre_cliente=nombre_cliente,
            pedido_id=pedido_id,
            qr_base64=qr_base64,
        )
        
async def enviar_correo_verificacion(email_destino: str, nombre: str, token: str):
    url_verificacion = f"{settings.APP_URL}/api/v1/auth/verify?token={token}"
    html = f"""
    <html>
    <head>{FONT_IMPORT}</head>
    <body>
        <div style="{BASE_STYLE}">
            <h2 style="{TITLE_STYLE}">Verifica tu cuenta en Centella</h2>
            <p>Hola <strong>{nombre}</strong>,</p>
            <p>Gracias por registrarte. Haz clic en el botón para verificar tu correo:</p>
            <div style="margin: 25px 0;">
                <a href="{url_verificacion}"
                   style="background-color: #872B3D; color: white; padding: 12px 25px;
                          text-decoration: none; border-radius: 5px; display: inline-block; font-weight: 600;">
                   Verificar mi cuenta
                </a>
            </div>
            <p style="font-size: 12px; color: #7f8c8d;">
                Si no creaste una cuenta, ignora este correo.
            </p>
            <p style="margin-top: 30px; font-size: 11px; color: #7f8c8d; border-top: 1px solid #eee; padding-top: 10px;">
                Este es un correo automático generado por el sistema Centella.
            </p>
        </div>
    </body>
    </html>
    """
    message = MessageSchema(
        subject="Verifica tu cuenta - Centella",
        recipients=[email_destino],
        body=html,
        subtype=MessageType.html
    )
    fm = FastMail(conf)
    await fm.send_message(message)
    
async def enviar_correo_reset(email_destino: str, nombre: str, codigo: str):
    html = f"""
    <html>
    <head>{FONT_IMPORT}</head>
    <body>
        <div style="{BASE_STYLE}">
            <h2 style="{TITLE_STYLE}">Recupera tu contraseña - Centella</h2>
            <p>Hola <strong>{nombre}</strong>,</p>
            <p>Recibimos una solicitud para restablecer tu contraseña.</p>
            <p>Tu código de verificación es:</p>
            <div style="text-align: center; margin: 25px 0;">
                <span style="font-size: 36px; font-weight: bold; color: #872B3D; letter-spacing: 8px;">
                    {codigo}
                </span>
            </div>
            <p>Este código expira en <strong>15 minutos</strong>.</p>
            <p style="font-size: 12px; color: #7f8c8d;">
                Si no solicitaste restablecer tu contraseña, ignora este correo.
            </p>
            <p style="margin-top: 30px; font-size: 11px; color: #7f8c8d; border-top: 1px solid #eee; padding-top: 10px;">
                Este es un correo automático generado por el sistema Centella.
            </p>
        </div>
    </body>
    </html>
    """
    message = MessageSchema(
        subject="Código de recuperación - Centella",
        recipients=[email_destino],
        body=html,
        subtype=MessageType.html
    )
    fm = FastMail(conf)
    await fm.send_message(message)