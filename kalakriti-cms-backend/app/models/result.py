from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base
import enum

class PrizeCategory(enum.Enum):
    FIRST = "first"
    SECOND = "second"
    THIRD = "third"
    SPECIAL_MENTION = "special_mention"

class Result(Base):
    __tablename__ = "results"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"))
    submission_id = Column(Integer, ForeignKey("submissions.id"))
    prize_category = Column(Enum(PrizeCategory))
    prize_description = Column(Text)
    certificate_url = Column(String(512))  # S3 URL
    announcement_date = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    event = relationship("Event", back_populates="results")
    submission = relationship("Submission", back_populates="results")