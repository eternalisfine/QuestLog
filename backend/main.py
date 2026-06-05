from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="QuestLog API")

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