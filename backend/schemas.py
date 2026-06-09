from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional, List, Dict
from datetime import datetime

class UserCreate(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    email: str
    created_at: datetime

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

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

class SessionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    started_at: datetime
    ended_at: Optional[datetime] = None
    duration_minutes: Optional[int] = None

class BudgetResponse(BaseModel):
    earned_minutes: int
    used_minutes: int
    remaining_minutes: int
    can_play: bool
    active_session_id: Optional[int] = None
    active_session_started_at: Optional[datetime] = None