from pydantic import BaseModel, EmailStr, ConfigDict
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