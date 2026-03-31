from enum import Enum

class TipoUsuarioEnum(str, Enum):
    cliente = "cliente"
    emprendedora = "emprendedora"
    administrador = "administrador"
 
class EstadoVerificacionEnum(str, Enum):
    pendiente = "pendiente"
    verificada = "verificada"
    suspendida = "suspendida"
 
class TipoEntregaEnum(str, Enum):
    envio = "envio"
    fisica = "fisica"
    ambas = "ambas"
 
class TipoAtributoEnum(str, Enum):
    talla = "talla"
    color = "color"
    tamanio = "tamaño"
    material = "material"
 
class TipoResenaEnum(str, Enum):
    producto = "producto"
    servicio = "servicio"
 
class TipoEntregaItemEnum(str, Enum):
    envio = "envio"
    fisica = "fisica"

class EstadoPedidoEnum(str, Enum):
    pendiente = "pendiente"
    confirmado = "confirmado"
    enviado = "enviado"
    entregado = "entregado"
    cancelado = "cancelado"
 
class MetodoPagoEnum(str, Enum):
    stripe = "stripe"
    paypal = "paypal"
    conekta_spei = "conekta_spei"
 
class TipoContenidoReporteEnum(str, Enum):
    producto = "producto"
    servicio = "servicio"
    resena = "resena"
    vendedora = "vendedora"

class EstadoReporteEnum(str, Enum):
    pendiente = "pendiente"
    resuelto = "resuelto"
    descartado = "descartado"
 
 