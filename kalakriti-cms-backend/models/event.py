from sqlalchemy import Column, String, DateTime, Date
from sqlalchemy.sql import func
from core.database import Base
import uuid

class Event(Base):
    __tablename__ = "events"

    event_id = Column(String(20), primary_key=True, index=True)
    event_name = Column(String(255), nullable=False)
    season = Column(String(100), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __init__(self, event_name, season, start_date, end_date):
        self.event_id = self.generate_event_id()
        self.event_name = event_name
        self.season = season
        self.start_date = start_date
        self.end_date = end_date

    @staticmethod
    def generate_event_id():
        """Generate a unique event ID like 'EVT1234567'"""
        return f"EVT{uuid.uuid4().int % 10000000}"