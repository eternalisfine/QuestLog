from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import func
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone
from database import engine, get_db, get_read_db, Base
import models, schemas, auth, os
from redis_client import r


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

# HELPERS

def seconds_until_midnight_utc() -> int:
    now = datetime.now(timezone.utc)
    midnight = (now + timedelta(days=1)).replace(hour=0, minute=0, second=0, microsecond=0)
    return int((midnight - now).total_seconds())

def earned_cache_key(user_id: int, date) -> str:
    return f"budget:earned:{user_id}:{date}"

def get_earned_minutes(user_id: int, date, db: Session) -> int:
    """Cache-aside: check Redis first, fall back to DB, then cache the result."""
    key = earned_cache_key(user_id, date)
    cached = r.get(key)
    if cached is not None:
        return int(cached)  # cache HIT

    # cache MISS
    result = db.query(func.sum(models.Quest.duration_minutes)).filter(
        models.Quest.owner_id == user_id,
        models.Quest.completed == True,
        func.date(models.Quest.created_at) == date
    ).scalar()
    earned = result or 0
    r.setex(key, seconds_until_midnight_utc(), earned)
    return earned

def get_used_minutes(user_id: int, date, db: Session) -> int:
    result = db.query(func.sum(models.GamingSession.duration_minutes)).filter(
        models.GamingSession.user_id == user_id,
        func.date(models.GamingSession.started_at) == date,
        models.GamingSession.duration_minutes.isnot(None)
    ).scalar()
    return result or 0


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
    read_db: Session = Depends(get_read_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    return read_db.query(models.Quest).filter(models.Quest.owner_id == current_user.id).all()

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

    today_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    cache_key = earned_cache_key(current_user.id, today_str)
    r.delete(cache_key)

    return quest


# BUDGET

@app.get("/budget/today", response_model=schemas.BudgetResponse)
def get_budget(read_db: Session = Depends(get_read_db), current_user: models.User = Depends(auth.get_current_user)):
    today = datetime.now(timezone.utc).date()
    earned = get_earned_minutes(current_user.id, today, read_db)
    used = get_used_minutes(current_user.id, today, read_db)

    active = read_db.query(models.GamingSession).filter(
        models.GamingSession.user_id == current_user.id,
        models.GamingSession.ended_at.is_(None)
    ).first()

    return {
        "earned_minutes": earned,
        "used_minutes": used,
        "remaining_minutes": max(0, earned - used),
        "can_play": (earned - used) > 0,
        "active_session_id": active.id if active else None,
        "active_session_started_at": active.started_at if active else None,
    }


# GAMING SESSIONS

@app.post("/sessions/start", response_model=schemas.SessionResponse, status_code=201)
def start_session(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    # Block for already running sesh
    if db.query(models.GamingSession).filter(
        models.GamingSession.user_id == current_user.id,
        models.GamingSession.ended_at.is_(None)
    ).first():
        raise HTTPException(status_code=400, detail="Session already active")

    # Block for broke people
    today = datetime.now(timezone.utc).date()
    earned = get_earned_minutes(current_user.id, today, db)
    used = get_used_minutes(current_user.id, today, db)
    if (earned - used) <= 0:
        raise HTTPException(status_code=403, detail="No gaming budget remaining. Complete more quests first.")

    session = models.GamingSession(user_id=current_user.id)
    db.add(session)
    db.commit()
    db.refresh(session)
    return session

@app.post("/sessions/end", response_model=schemas.SessionResponse)
def end_session(db:Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    session = db.query(models.GamingSession).filter(
        models.GamingSession.user_id == current_user.id,
        models.GamingSession.ended_at.is_(None)
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="No active session found")

    now = datetime.now(timezone.utc)
    session.ended_at = now
    session.duration_minutes = max(1, int((now - session.started_at).total_seconds() / 60))
    db.commit()
    db.refresh(session)
    return session

@app.get("/ping")
def ping():
    return {"message": "pong", "database": "connected"}