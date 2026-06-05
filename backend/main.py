import os

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

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

# temporary in-memory list until we wire up PostgreSQL
fake_db = []

class Quest(BaseModel):
    id: int
    title: str
    duration_minutes: int
    completed: bool = False

@app.get("/")
def read_root():
    return {"status": "System Online"}

@app.post("/quests/", response_model=Quest)
def create_quest(quest: Quest):
    fake_db.append(quest)
    return quest

@app.get("/quests/")
def get_quests():
    return fake_db