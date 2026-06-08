from sqlalchemy import Column, Integer, String, Boolean, DateTime, func
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer,primary_key=True, index=True)
    email = Column(String,  unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    quests = relationship("Quest", back_populates="owner", cascade="all, delete-orphan")


class Quest(Base):
    __tablename__ = "quests"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    duration_minutes = Column(Integer, nullable=False)
    completed = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    owner = relationship("User", back_populates="quests")