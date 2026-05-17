from app.config import settings
import base64
import httpx

RESEND_API_URL = "https://api.resend.com/emails"

# Estilos comunes para reutilizar
FONT_IMPORT = '<link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@700&family=Poppins:wght@400;600&display=swap" rel="stylesheet">'
BASE_STYLE = "font-family: 'Poppins', Arial, sans-serif; border: 1px solid #ddd; padding: 20px; border-radius: 10px; max-width: 600px; color: #333;"
TITLE_STYLE = "font-family: 'Libre Baskerville', serif; color: #872B3D; margin-top: 0;"

async def _send_email(to: str, subject: str, html: str, attachments: list = None):
    """Función base para enviar correos via Resend HTTP API."""
    payload = {
        "from": f"{settings.MAIL_FROM_NAME} <onboarding@resend.dev>",
        "to": [to],
        "subject": subject,
        "html": html,
    }

    if attachments:
        payload["attachments"] = attachments

    async with httpx.AsyncClient() as client:
        response = await client.post(
            RESEND_API_URL,
            headers={
                "Authorization": f"Bearer {settings.RESEND_API_KEY}",
                "Content-Type": "application/json",
            },
            json=payload
        )
        response.raise_for_status()

async def enviar_correo_guia(email_destino: str, nombre_cliente: str, tracking_number: str, label_url: str):
    """Envía el link del PDF y el rastreo al cliente."""
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
    await _send_email(email_destino, "Información de tu Envío - Centella", html)

async def enviar_correo_qr(
    email_destino: str,
    nombre_cliente: str,
    pedido_id: int,
    qr_base64: str,
):
    """Envía el código QR para recoger el pedido como adjunto."""
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

    attachments = [
        {
            "filename": f"qr_pedido_{pedido_id}.png",
            "content": qr_base64,  
        }
    ]

    await _send_email(
        email_destino,
        f"Código QR para recoger tu pedido #{pedido_id}",
        html,
        attachments=attachments
    )


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
    """Decide qué correo(s) mandar según el tipo de entrega del pedido."""
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


async def enviar_correo_verificacion(email_destino: str, nombre: str, codigo: str):
    """Envía el código de verificación al registrarse."""
    html = f"""
    <html>
    <head>{FONT_IMPORT}</head>
    <body>
        <div style="{BASE_STYLE}">
            <h2 style="{TITLE_STYLE}">Verifica tu cuenta en Centella</h2>
            <p>Hola <strong>{nombre}</strong>,</p>
            <p>Gracias por registrarte. Tu código de verificación es:</p>
            <div style="text-align: center; margin: 25px 0;">
                <span style="font-size: 36px; font-weight: bold; color: #872B3D; letter-spacing: 8px;">
                    {codigo}
                </span>
            </div>
            <p>Este código expira en <strong>15 minutos</strong>.</p>
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
    await _send_email(email_destino, "Verifica tu cuenta - Centella", html)


async def enviar_correo_reset(email_destino: str, nombre: str, codigo: str):
    """Envía el código para restablecer la contraseña."""
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
    await _send_email(email_destino, "Código de recuperación - Centella", html)