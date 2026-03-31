# bilchis
# luego le pongo docstrings
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

basedir = os.path.abspath(os.path.dirname(__file__))
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("No se encontro DATABASE_URL en el archivo .env")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bing=engine)
Base = declarative_base()

"""
Funcion para obtener una sesion de la base de datos
"""
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()