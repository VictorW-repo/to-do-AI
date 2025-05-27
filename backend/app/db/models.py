from datetime import datetime
from enum import Enum as PyEnum
from typing import Optional

from sqlalchemy import Boolean, Column, DateTime, Enum, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.session import Base


class TodoStatus(str, PyEnum):
    """Todo status enumeration"""
    PENDING = "PENDING"
    COMPLETED = "COMPLETED"


class User(Base):
    """User model for future authentication"""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    todos = relationship("Todo", back_populates="user", cascade="all, delete-orphan")


class Todo(Base):
    """Todo model for storing task items"""
    __tablename__ = "todos"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(Enum(TodoStatus), default=TodoStatus.PENDING, nullable=False)
    priority = Column(Integer, default=1, nullable=False)
    due_date = Column(DateTime(timezone=True), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    is_ai_generated = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)

    user = relationship("User", back_populates="todos")

    def mark_completed(self) -> None:
        """Mark todo as completed and set completed timestamp"""
        self.status = TodoStatus.COMPLETED
        self.completed_at = datetime.utcnow()

    def mark_pending(self) -> None:
        """Mark todo as pending and reset completed timestamp"""
        self.status = TodoStatus.PENDING
        self.completed_at = None

    @property
    def is_completed(self) -> bool:
        """Check if todo is completed"""
        return self.status == TodoStatus.COMPLETED

    @property
    def is_overdue(self) -> bool:
        """Check if todo is overdue"""
        if not self.due_date:
            return False
        return not self.is_completed and self.due_date < datetime.utcnow()