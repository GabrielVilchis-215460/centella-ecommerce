# _☪️ Centella E-commerce_
> _"Ilumminando tu camino al éxito."_

## Integrantes del Equipo

| Matrícula | Nombre                            |
| --------- | --------------------------------- |
| 214715    | **Eliezer Abisaí López Pascual**  |
| 215460    | **Gabriel Alberto Vilchis Ríos**  |
| 215861    | **Berenice Flores Hernández**     |
| 215983    | **Adrián Rivas Escárcega**        |
| 222835    | **Anna Lizbeth Barajas Sandoval** |

## 🏛️ Arquitectura de Software

<img width="1391" height="421" alt="Untitled Diagram" src="https://github.com/user-attachments/assets/e48cf388-5890-41c9-bd04-d2004207ba0d" />

## ⚙️ Tecnologías Utilizadas

<p align="center">
  <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white"/>
  <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white"/>
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black"/>
  <img src="https://img.shields.io/badge/React-20232a?style=for-the-badge&logo=react&logoColor=61DAFB"/>
  <img src="https://img.shields.io/badge/TailwindCSS-0EA5E9?style=for-the-badge&logo=tailwindcss&logoColor=white"/>
  <img src="https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white"/>
  <img src="https://img.shields.io/badge/postgresql-4169e1?style=for-the-badge&logo=postgresql&logoColor=white"/>
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white"/>
</p>

## 🌿 Ramas Clave
 
El proyecto utiliza una estrategia de ramas basada en **Jira** para la gestión de tareas y sprints.
 
| Rama | Descripción |
| ---- | ----------- |
| `main` | Rama de **producción**. Contiene el código estable y listo para despliegue. |
| `develop` | Rama de **desarrollo**. Contiene el código estable y listo para testeos antes de hacer el despliegue. |
| `SCRUM-#<número>-<descripción>` | Ramas de **features**, creadas automáticamente desde Jira al iniciar una tarea del backlog. Cada número corresponde al ID de la tarea en el tablero SCRUM. |
 
### Ejemplos de ramas de features
 
| Rama | Vista / Funcionalidad |
| ---- | --------------------- |
| `SCRUM-115-Vista-Panel-de-administración` | Panel de administración |
| `SCRUM-117-Vista-Codigo-de-verificaci...` | Código de verificación |
| `SCRUM-119-Vista-Ajustes-de-cuenta` | Ajustes de cuenta |
| `SCRUM-120-Vista-Resumen-de-compra` | Resumen de compra |
| `SCRUM-123-Vista-Carrito-de-compras` | Carrito de compras |
| `SCRUM-125-Vista-CRUD-servicios` | CRUD de servicios |
| `SCRUM-128-Vista-Gestion-de-emprend...` | Gestión de emprendimientos |
| `SCRUM-129-Vista-Gestion-de-insignias` | Gestión de insignias |
| `SCRUM-130-Vista-Moderacion-de-plat...` | Moderación de plataforma |
 
> Cada rama de feature se fusiona a `main` una vez que la tarea ha sido revisada y aprobada.

## 🛠️ Instrucciones de Uso
### 🔧 Backend (FastAPI)

Para instalar las dependencias requeridas ubicadas en "requirements.txt", es necesario realizar los siguientes pasos:

### 1. Para crear el ambiente virtual:

```bash
python -m venv venv
```

### 2. Para activar el ambiente virtual: ./venv/Scripts/activate

```bash
./venv/Scripts/activate
```

### 3. Para desactivar el ambiente virtual:

```bash
deactivate
```

### 4. Para instalar las dependencias: pip install -r requirements.txt

```bash
pip install -r requirements.txt
```

### 5. Levantar el server de FastAPI

Para leventar el server de fastapi mediante la uvicorn, es necesario realizar lo siguiente:

```bash
cd Backend
uvicorn app.main:app --reload
# Para cerrar el server una vez que se este ejecutando: ctrl + c
```

### 6. Correr las pruebas unitarias e integración con Pytest:
```bash
cd Backend
pytest
```

### 🔧 Frontend (React)

Verificar si Node.js y npm están instalados correctamente:

```bash
node --version
npm --version
```

### 1. Instalación de dependencias

Navegar a la carpeta del Frontend e instalar las dependencias desde package.json:

```bash
cd Frontend
npm install
```

### 2. Levantar el servidor de desarrollo

Para iniciar el servidor de desarrollo:

```bash
npm run dev
```

### 3. Correr las pruebas unitarias de componentes con Vitest:
```bash
npm run test
```

### 4. Levantar servidor de documentación interactiva con Storybook:
```bash
npm run storybook
```

---

## 📁 Estructura del Proyecto

```
backend/
├── app/                  # Directorio principal de la aplicación
│   ├── api/              # Endpoints organizados por módulos (Lógica de negocio)
│   │   └── v1/           # Versión 1 de la API (Auth, Producto, Carrito, etc.)
│   ├── core/             # Configuración global, base de datos, seguridad y constantes
│   ├── models/           # Modelos de base de datos definidos con SQLAlchemy
│   ├── services/         # Integraciones y servicios externos (Stripe, PayPal, Email)
│   ├── config.py         # Carga de variables de entorno y settings globales
│   └── main.py           # Punto de entrada y montaje de rutas de FastAPI
├── migrations/           # Archivos de migración de base de datos mediante Alembic
├── tests/                # Directorio de pruebas automatizadas (Mocks y Cobertura)
│   ├── conftest.py       # Fixtures compartidas y cliente HTTP asíncrono
│   ├── test_auth.py      # Pruebas de endpoints de Autenticación
│   ├── test_carrito.py   # Pruebas del ecosistema del Carrito de compras
│   ├── test_main.py      # Pruebas base de conectividad de la aplicación
│   ├── test_productos.py # Pruebas del catálogo y lógica de productos
│   └── test_servicios.py # Pruebas asociadas al CRUD de servicios
├── alembic.ini           # Configuración de la herramienta de migraciones
├── logo.png              # Logo requerido para la generación de códigos QR de envíos
├── pytest.ini            # Configuración de comportamiento y rutas globales de Pytest
└── requirements.txt      # Dependencias del backend (incluye pytest-asyncio)

frontend/
├── .storybook/           # Configuración del entorno y estilos globales de Storybook
├── public/               # Archivos y recursos estáticos del cliente
├── src/
│   ├── assets/           # Imágenes, logos, fuentes y estilos CSS globales
│   ├── components/       # Componentes UI reutilizables de la aplicación
│   │   └── common/       # Botones, inputs, tarjetas y sus respectivos archivos *.test.jsx
│   │   └── layout/       # Header, footer y sidebar
│   ├── context/          # Contextos globales de React (AuthContext, CartContext, etc.)
│   ├── features/         # Módulos robustos por funcionalidad (Admin, Auth, Cliente, Emprendedora)
│   ├── hooks/            # Custom hooks globales para el manejo de estado
│   ├── services/         # Lógica y configuración de peticiones con Axios hacia la API
│   ├── stories/          # Historias centralizadas y estructuradas de Storybook (*.stories.jsx)
│   ├── App.css           # Estilos generales del componente raíz
│   ├── App.jsx           # Componente raíz y enrutamiento estructural
│   ├── index.css         # Estilos base e inyección de directivas de Tailwind CSS
│   ├── main.jsx          # Punto de entrada de renderizado del cliente en el DOM
│   ├── routes.jsx        # Definición explícita de rutas públicas y protegidas
│   └── setupTests.js     # Configuración previa de extensión de aserciones (@testing-library/jest-dom)
├── .gitignore            # Archivos y carpetas omitidos en el control de versiones
├── eslint.config.js      # Configuración de reglas de linter para JavaScript/React
├── index.html            # HTML principal de montaje de la aplicación
├── package-lock.json     # Árbol exacto de dependencias de Node
├── package.json          # Dependencias y scripts configurados (dev, build, test, storybook)
├── postcss.config.js     # Configuración de plugins de PostCSS
├── tailwind.config.js    # Configuración de temas, fuentes y extensiones de Tailwind CSS
└── vite.config.js        # Configuración de empaquetado de Vite y entorno jsdom para Vitest

.gitignore                # Gitignore raíz del repositorio de e-commerce
README.md                 # Documentación general y guía del ecosistema del proyecto
requirements.txt          # Dependencias globales del proyecto
```

## 🔑 Credenciales de Uso
 
### Credenciales de Admin
- **Email:** 
- **Password:** ``
### Métodos de Pago – Stripe
 
#### Email
- Puede ser cualquiera.
#### Tarjetas (valores de prueba)
- **Visa (pago exitoso):** `4242 4242 4242 4242`
- **MasterCard (pago exitoso):** `5555 5555 5555 4444`
- **Error de CVC:** `4000 0000 0000 0101`
- **Tarjeta declinada:** `4000 0000 0000 0002`
> Para todas las tarjetas de prueba:
> - Fecha: cualquier fecha futura
> - CVC: cualquier número
 
### Métodos de Pago – PayPal
- **Email:** `sb-08h9u47490918@personal.example.com`
- **Password:** `HjKy7H$&`
- **Código de verificación (en caso de ser requerido):** `1111`
