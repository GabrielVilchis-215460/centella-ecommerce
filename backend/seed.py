import random
import uuid
from datetime import datetime, timedelta
from decimal import Decimal
from app.core.database import SessionLocal, engine, Base
from app.models import * 
from app.models.enum import (
    TipoUsuarioEnum, EstadoVerificacionEnum, TipoEntregaEnum, 
    TipoCategoriaEnum, TipoResenaEnum
)
from app.models.usuario import Usuario
from app.models.emprendedora import Emprendedora
from app.models.pagina_emprendimiento import PaginaEmprendimiento
from app.models.categoria import Categoria
from app.models.producto import Producto
from app.models.servicio import Servicio
from app.models.resena import Resena
from app.models.imagen import Imagen

# --- DATOS DE PRUEBA REALISTAS Y ÚNICOS ---

COLORES_PERFIL = [
    {"nombre": "Rojo", "hex": "#C7696B", "tipo": TipoCategoriaEnum.producto},
    {"nombre": "Naranja", "hex": "#D3946D", "tipo": TipoCategoriaEnum.producto},
    {"nombre": "Amarillo", "hex": "#DACA70", "tipo": TipoCategoriaEnum.producto},
    {"nombre": "Verde", "hex": "#79BD75", "tipo": TipoCategoriaEnum.producto},
    {"nombre": "Azul claro", "hex": "#75B2BD", "tipo": TipoCategoriaEnum.producto},
    {"nombre": "Azul oscuro", "hex": "#7589BD", "tipo": TipoCategoriaEnum.servicio},
    {"nombre": "Morado", "hex": "#8D75BD", "tipo": TipoCategoriaEnum.servicio},
    {"nombre": "Magenta", "hex": "#B86FC7", "tipo": TipoCategoriaEnum.servicio},
    {"nombre": "Rosa", "hex": "#BD759A", "tipo": TipoCategoriaEnum.servicio},
    {"nombre": "Gris", "hex": "#898989", "tipo": TipoCategoriaEnum.servicio},
]

CATEGORIAS_NOMBRES = [
    "Joyería Fina", "Artesanías Locales", "Cuidado Personal", "Cerámica y Barro", 
    "Ropa Tradicional", "Talleres de Manualidades", "Reparación de Bisutería", 
    "Asesoría de Imagen", "Personalización", "Cursos de Costura"
]

IMAGENES_PERFIL_MUJERES = [
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1554151228-14d9def656e4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
]

IMAGENES_PRODUCTOS = [
    "https://images.unsplash.com/photo-1596944924616-7b38e7cfac36?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80", 
    "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80", 
    "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80", 
    "https://images.unsplash.com/photo-1610701596007-11502861dcfa?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80", 
    "https://images.unsplash.com/photo-1584916201218-f4242ceb4809?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"  
]

# Nombres y negocios únicos
NOMBRES_MUJERES = ["Mariana", "Sofía", "Valentina", "Fernanda", "Camila", "Valeria", "Ximena", "Daniela", "Lucía", "Andrea"]
APELLIDOS_MUJERES = ["García", "Martínez", "López", "González", "Pérez", "Rodríguez", "Sánchez", "Ramírez", "Cruz", "Flores"]
NOMBRES_NEGOCIOS = [
    "Joyería del Desierto", "Barro Mágico Juárez", "Telares de la Frontera",
    "Manos Creativas", "Bisutería Fina El Paso", "Cerámica Nómada",
    "Artesanías Sol y Arena", "Diseño Autóctono", "Raíces Vivas", "Hilos y Colores"
]

# 30 Productos únicos
NOMBRES_PRODUCTOS = [
    "Collar de Ámbar", "Pulsera Tejida a Mano", "Anillo de Plata 925", "Taza de Cerámica Pintada", "Jabón Artesanal de Lavanda",
    "Aretes de Cobre", "Bufanda de Lana", "Bolso de Macramé", "Vela Aromática de Vainilla", "Libreta Encuadernada a Mano",
    "Dije de Cuarzo Rosa", "Cinturón Bordado", "Maceta de Barro", "Set de Anillos Bohemios", "Crema Facial Natural",
    "Gargantilla de Perlas", "Sombrero Pintado a Mano", "Cojín Decorativo Artesanal", "Shampoo Sólido Ecológico", "Caja de Madera Tallada",
    "Pulsera de Piedra Volcánica", "Manta de Algodón Fresco", "Aretes de Filigrana", "Tazón de Cerámica Rústico", "Bálsamo Labial Orgánico",
    "Collar de Hilo Encerado", "Cesto de Mimbre Teñido", "Anillo con Piedra Turquesa", "Portavasos de Resina", "Morral Étnico Tradicional"
]

# 20 Servicios únicos
NOMBRES_SERVICIOS = [
    "Taller de Cerámica Básica", "Curso Práctico de Bisutería", "Asesoría de Imagen y Estilo", "Reparación y Arreglo de Joyería", "Personalización de Prendas a Medida",
    "Clase de Pintura en Barro", "Taller Intensivo de Macramé", "Restauración de Artesanías Antiguas", "Diseño de Accesorios para Eventos", "Clase de Bordado Tradicional",
    "Taller de Creación de Velas", "Curso de Cosmética Natural", "Taller de Encuadernación Artesanal", "Clase de Pintura sobre Tela", "Reparación de Relojes de Pulsera",
    "Taller de Telar de Cintura", "Asesoría en Moda Sostenible", "Clase de Joyería en Resina", "Taller Práctico de Cestería", "Grabado Personalizado en Metal"
]


def run_seed(db):
    print("Iniciando inserción de datos (Seed)...")

    # 1. Crear Categorías
    categorias_db = []
    for i, color in enumerate(COLORES_PERFIL):
        cat = Categoria(
            nombre=CATEGORIAS_NOMBRES[i],
            descripcion=f"Categoría enfocada en {CATEGORIAS_NOMBRES[i].lower()}.",
            color_preferencia_hex=color["hex"],
            tipo_categoria=color["tipo"]
        )
        db.add(cat)
        categorias_db.append(cat)
    db.commit()
    print("Categorías creadas.")

    # 2. Crear 5 Clientes (Nombres únicos simulados)
    clientes_nombres = ["Carlos", "Miguel", "Roberto", "José", "Luis"]
    clientes_db = []
    for i in range(5):
        cliente = Usuario(
            email=f"cliente_{clientes_nombres[i].lower()}@correo.com",
            contrasena="hashed_password_123", 
            tipo_usuario=TipoUsuarioEnum.cliente,
            nombre=clientes_nombres[i],
            apellido="Mendoza",
            fecha_registro=datetime.now(),
            activo=True,
            email_verificado=True
        )
        db.add(cliente)
        clientes_db.append(cliente)
    db.commit()
    print("Clientes creados.")

    # 3. Crear 10 Emprendedoras y Usuarios
    emprendedoras_db = []
    for i in range(10):
        nombre_emp = NOMBRES_MUJERES[i]
        apellido_emp = APELLIDOS_MUJERES[i]
        nombre_negocio = NOMBRES_NEGOCIOS[i]

        # Crear Usuario base
        user_emp = Usuario(
            email=f"{nombre_emp.lower()}.{apellido_emp.lower()}@centella.com",
            contrasena="hashed_password_123",
            tipo_usuario=TipoUsuarioEnum.emprendedora,
            nombre=nombre_emp,
            apellido=apellido_emp,
            foto_perfil_url=IMAGENES_PERFIL_MUJERES[i],
            fecha_registro=datetime.now() - timedelta(days=random.randint(10, 100)),
            activo=True,
            email_verificado=True
        )
        db.add(user_emp)
        db.commit()

        # Crear Perfil Emprendedora
        emp = Emprendedora(
            id_usuario=user_emp.id_usuario,
            nombre_negocio=nombre_negocio,
            logo_url=IMAGENES_PERFIL_MUJERES[i],
            descripcion_negocio=f"Productos elaborados con pasión y dedicación en Ciudad Juárez por {nombre_emp}.",
            estado_verificacion=EstadoVerificacionEnum.verificada,
            insignia_hecho_juarez=random.choice([True, False]),
            enlace_redes_sociales={"instagram": f"@{nombre_negocio.replace(' ', '').lower()}", "facebook": f"/{nombre_negocio.replace(' ', '').lower()}"},
            color_emprendedora_hex=COLORES_PERFIL[i]["hex"]
        )
        db.add(emp)
        db.commit()
        emprendedoras_db.append(emp)

        # Crear Página de Emprendimiento con el formato HTML
        html_content = f"""
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
            <div style="background-color: {emp.color_emprendedora_hex}; padding: 40px; border-radius: 10px; color: white; text-align: center;">
                <img src="{emp.logo_url}" alt="Logo" style="width: 150px; height: 150px; border-radius: 50%; border: 4px solid white; object-fit: cover;">
                <h1 style="margin-top: 15px;">{emp.nombre_negocio}</h1>
                <p style="font-size: 18px;">{emp.descripcion_negocio}</p>
            </div>
            <div style="margin-top: 30px; text-align: center;">
                <h2>Nuestra Historia</h2>
                <p>Somos una marca originaria de la frontera, orgullosas de fomentar el consumo local y llevar el talento de nuestras manos a toda la república.</p>
                <img src="{IMAGENES_PRODUCTOS[random.randint(0, 4)]}" alt="Producto destacado" style="width: 100%; max-height: 300px; object-fit: cover; border-radius: 8px; margin-top: 20px;">
            </div>
        </div>
        """
        
        pagina = PaginaEmprendimiento(
            id_emprendedora=emp.id_emprendedora,
            contenido={"html": html_content},
            ultima_actualizacion=datetime.now()
        )
        db.add(pagina)
    db.commit()
    print("Emprendedoras y páginas creadas con nombres únicos.")

    # 4. Crear Productos y Servicios
    productos_db = []
    servicios_db = []
    
    indice_producto = 0
    indice_servicio = 0

    for emp in emprendedoras_db:
        # 3 Productos únicos por emprendedora
        for j in range(3):
            prod = Producto(
                id_emprendedora=emp.id_emprendedora,
                id_categoria=categorias_db[random.randint(0, 4)].id_categoria, 
                nombre=NOMBRES_PRODUCTOS[indice_producto],
                descripcion="Una pieza única, elaborada a mano con materiales de primera calidad.",
                precio=Decimal(random.randint(150, 1500)),
                cantidad_stock=random.randint(5, 50),
                tipo_entrega=random.choice(list(TipoEntregaEnum)), 
                activo=True,
                fecha_creacion=datetime.now()
            )
            db.add(prod)
            db.commit() 
            productos_db.append(prod)
            
            # --- CREAR LA IMAGEN Y VINCULARLA AL PRODUCTO ---
            url_imagen_elegida = IMAGENES_PRODUCTOS[random.randint(0, 4)]
            
            imagen_producto = Imagen(
                entity_id=prod.id_producto,
                entity_type="producto",
                r2_key=f"productos/{uuid.uuid4().hex}.jpg",
                filename=f"producto_{prod.id_producto}.jpg",
                size=random.randint(20000, 150000),
                url=url_imagen_elegida,
                orden=0
            )
            db.add(imagen_producto)
            db.commit()
            
            indice_producto += 1
            
        # 2 Servicios únicos por emprendedora
        for j in range(2):
            serv = Servicio(
                id_emprendedora=emp.id_emprendedora,
                id_categoria=categorias_db[random.randint(5, 9)].id_categoria, 
                nombre=NOMBRES_SERVICIOS[indice_servicio],
                descripcion="Una experiencia presencial para aprender y disfrutar del proceso creativo.",
                precio=Decimal(random.randint(300, 2500)),
                enlace_reservacion="https://calendly.com/ejemplo-centella",
                activo=True,
                fecha_creacion=datetime.now()
            )
            db.add(serv)
            servicios_db.append(serv)
            
            indice_servicio += 1
            
    db.commit()
    print("Productos, imágenes y servicios creados con nombres únicos.")

    # 5. Crear Reseñas
    for _ in range(30):
        cliente_azar = random.choice(clientes_db)
        emp_azar = random.choice(emprendedoras_db)
        es_producto = random.choice([True, False])
        
        item_ref = random.choice(productos_db) if es_producto else random.choice(servicios_db)
        tipo_res = TipoResenaEnum.producto if es_producto else TipoResenaEnum.servicio
        
        calif_item = random.choices([5, 4, 3, 2, 1], weights=[50, 30, 10, 5, 5])[0]
        calif_vendedora = random.choices([5, 4, 3, 2, 1], weights=[60, 20, 10, 5, 5])[0]

        resena = Resena(
            id_cliente=cliente_azar.id_usuario,
            id_emprendedora=emp_azar.id_emprendedora,
            tipo_resena=tipo_res,
            id_referencia=item_ref.id_producto if es_producto else item_ref.id_servicio,
            calificacion_item=calif_item,
            calificacion_vendedora=calif_vendedora,
            comentario="¡Excelente trabajo! Me encantó la calidad y la atención brindada." if calif_item > 3 else "El artículo es aceptable, pero la logística podría mejorar un poco.",
            fecha=datetime.now() - timedelta(days=random.randint(1, 30))
        )
        db.add(resena)
        
    db.commit()
    print("Seed completado exitosamente.")

if __name__ == "__main__":
    print("Creando tablas en la base de datos...")
    Base.metadata.create_all(bind=engine)
    print("Tablas creadas/verificadas.")

    db = SessionLocal()
    try:
        run_seed(db)
    finally:
        db.close()