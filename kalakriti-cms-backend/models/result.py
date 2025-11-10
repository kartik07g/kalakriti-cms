from sqlalchemy import Column, String, Integer, Text, DateTime
from sqlalchemy.sql import func
from core.database import Base
import uuid

class Result(Base):
    __tablename__ = "results"

    result_id = Column(String(20), primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    user_id = Column(String(20), nullable=False)
    score = Column(Integer, nullable=False)
    remarks = Column(Text, nullable=True)
    category = Column(String(255), nullable=False)
    rank = Column(Integer, nullable=False)
    event_name = Column(String, nullable=False)
    season = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __init__(self, name, user_id, score, category, rank, event_name, season, remarks=None):
        self.result_id = self.generate_result_id()
        self.name = name
        self.user_id = user_id
        self.score = score
        self.remarks = remarks
        self.category = category
        self.rank = rank
        self.event_name= event_name
        self.season= season

    @staticmethod
    def generate_result_id():
        """Generate a unique result ID like 'RES1234567'"""
        return f"RES{uuid.uuid4().int % 10000000}"