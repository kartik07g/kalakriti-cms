from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from core.database import Base
import uuid

class EventRegistration(Base):
    __tablename__ = "event_registrations"

    event_registration_id = Column(String(20), primary_key=True, index=True)
    user_id = Column(String(20), ForeignKey("users.user_id"), nullable=False)
    event_name = Column(String(255), nullable=False)
    season = Column(String(100), nullable=False)
    artwork_count = Column(Integer, nullable=False)
    registration_status = Column(String(50), default="pending")
    created_dt = Column(DateTime(timezone=True), server_default=func.now())
    updated_dt = Column(DateTime(timezone=True), onupdate=func.now())

    def __init__(self, user_id, event_name, season, artwork_count):
        self.event_registration_id = self.generate_registration_id()
        self.user_id = user_id
        self.event_name = event_name
        self.season = season
        self.artwork_count = artwork_count

    @staticmethod
    def generate_registration_id():
        """Generate a unique registration ID like 'REG1234567'"""
        return f"REG{uuid.uuid4().int % 10000000}"