from sqlalchemy import Column, Integer, String, Float, DateTime, Enum, Text
from sqlalchemy.sql import func
from ..database import Base
import enum

class EventCategory(enum.Enum):
    ART = "Art"
    PHOTOGRAPHY = "Photography"
    MEHNDI = "Mehndi"
    RANGOLI = "Rangoli"
    DANCE = "Dance"
    SINGING = "Singing"

class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255))
    description = Column(Text)
    category = Column(Enum(EventCategory))
    registration_fee = Column(Float)
    start_date = Column(DateTime(timezone=True))
    end_date = Column(DateTime(timezone=True))
    submission_deadline = Column(DateTime(timezone=True))
    max_participants = Column(Integer)
    current_participants = Column(Integer, default=0)
    rules = Column(Text)
    prizes = Column(Text)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())