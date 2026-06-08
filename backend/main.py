from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from database import engine, get_db, Base
import models, schemas, auth, os


Base.metadata.create_all(bind=engine)

# Parsing comma-separated origins from .env to fallback to localhost for local dev  
ALLOWED_ORIGINS = [o.strip() for o in os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")]

app = FastAPI(title="QuestLog API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# AUTH

@app.post("/auth/register", response_model=schemas.UserResponse, status_code=201)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    if db.query(models.User).filter(models.User.email == user.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    db_user = models.User(
        email=user.email,
        hashed_password=auth.hash_password(user.password)
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.post("/auth/token", response_model=schemas.Token)
def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # take username as email
    user = db.query(models.User).filter(models.User.email == form.username).first()
    if not user or not auth.verify_password(form.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    return {"access_token": auth.create_access_token(user.id), "token_type": "bearer"}

# QUESTS
@app.get("/quests/", response_model=list[schemas.QuestResponse])
def get_quests(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    return db.query(models.Quest).filter(models.Quest.owner_id == current_user.id).all()

@app.post("/quests/", response_model=schemas.QuestResponse, status_code=201)
def create_quest(
    quest: schemas.QuestCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    db_quest = models.Quest(**quest.model_dump(), owner_id=current_user.id)
    db.add(db_quest)
    db.commit()
    db.refresh(db_quest)
    return db_quest

@app.patch("/quests/{quest_id}/complete", response_model=schemas.QuestResponse)
def complete_quest(
    quest_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    # Filtering id and owner_id for security
    quest = db.query(models.Quest).filter(
        models.Quest.id == quest_id,
        models.Quest.owner_id == current_user.id
    ).first()
    if not quest:
        raise HTTPException(status_code=404, detail="Quest not found")
    quest.completed = True
    db.commit()
    db.refresh(quest)
    return quest