from dotenv import load_dotenv
load_dotenv()

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
import os


DATABASE_URL = os.getenv("DATABASE_URL")
READ_DATABASE_URL =os.getenv("READ_DATABASE_URL", DATABASE_URL)

# Primary
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Replica
read_engine = create_engine(READ_DATABASE_URL)
ReadSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=read_engine)

class Base(DeclarativeBase):
    pass

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_read_db():
    db = ReadSessionLocal()
    try:
        yield db
    finally:
        db.close()