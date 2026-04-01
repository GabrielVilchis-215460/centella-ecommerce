# _Nota:_ Si quieren agregar algo o quitar algo, o inclusive, organizar, sientanse libres de hacerlo🤠.

## Integrantes del Equipo

| Matrícula | Nombre                            |
| --------- | --------------------------------- |
| 214715    | **Eliezer Abisaí López Pascual**  |
| 215460    | **Gabriel Alberto Vilchis Ríos**  |
| 215861    | **Berenice Flores Hernández**     |
| 215983    | **Adrián Rivas Escárcega**        |
| 222835    | **Anna Lizbeth Barajas Sandoval** |

## Arquitectura de Software

<img width="1412" height="1412" alt="image" src="https://github.com/user-attachments/assets/a46375c6-9552-440d-bc4e-317a409dbf4a" />

## ⚙️ Tecnologías Utilizadas

<p align="center">
  <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white"/>
  <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white"/>
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black"/>
  <img src="https://img.shields.io/badge/React-20232a?style=for-the-badge&logo=react&logoColor=61DAFB"/>
  <img src="https://img.shields.io/badge/TailwindCSS-0EA5E9?style=for-the-badge&logo=tailwindcss&logoColor=white"/>
  <img src="https://img.shields.io/badge/postgresql-4169e1?style=for-the-badge&logo=postgresql&logoColor=white"/>
</p>
En caso de requerir un deploy, agregar la badge correspondiente🗣️

## Ramas Clave

## Instrucciones de uso - Backend

Para instalar las dependencias requeridas ubicadas en "requirements.txt", es necesario realizar los siguientes pasos:

1. Para crear el ambiente virtual:

```bash
python -m venv venv
```

2. Para activar el ambiente virtual: ./venv/Scripts/activate

```bash
./venv/Scripts/activate
```

4. Para desactivar el ambiente virtual:

```bash
deactivate
```

6. Para instalar las dependencias: pip install -r requirements.txt

```bash
pip install -r requirements.txt
```

## Levantar el server de FastAPI

Para leventar el server de fastapi mediante la uvicorn, es necesario realizar lo siguiente:

```bash
cd Backend
uvicorn app.main:app --reload
# Para cerrar el server una vez que se este ejecutando: ctrl + c
```

## Instrucciones de uso - Frontend

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

Para iniciar el servidor de desarrollo con Vite (maybe):

```bash
npm run dev
```

---

## Estructura del Proyecto

```
backend/
├── app/                  # Directorio principal de la aplicación
│   ├── api/              # Endpoints organizados por módulos (Lógica de negocio)
│   │   └── v1/           # Versión 1 de la API
│   ├── core/             # Configuración global, seguridad y constantes
│   ├── models/           # Modelos de base de datos SQLAlchemy
│   ├── services/         # Servicios externos
│   ├── config.py         # Carga de variables de entorno y settings
│   └── main.py           # Punto de entrada de FastAPI
├── migrations/           # Archivos de migración de base de datos mediante Alembic
├── tests/                # Pruebas unitarias y de integración mediante PyTest
├── .env                  # Variables de entorno
├── .gitignore            # Archivos y carpetas ignorados por Git
├── alembic.ini           # Configuración de la herramienta de migraciones
├── pytest.ini            # Configuración de comportamiento de Pytest
Frontend/
├── README.md             # Documentación del proyecto
└── requirements.txt      # Dependencias del proyecto
```
