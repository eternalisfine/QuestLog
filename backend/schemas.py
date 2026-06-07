from pydantic import BaseModel
from pydantic import ConfigDict
from datetime import datetime

class QuestCreate(BaseModel):
    title: str
    duration_minutes: int

class QuestResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    duration_minutes: int
    completed: bool
    created_at: datetime