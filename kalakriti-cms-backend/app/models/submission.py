from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base

class Submission(Base):
    __tablename__ = "submissions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    event_id = Column(Integer, ForeignKey("events.id"))
    submission_title = Column(String(255))
    description = Column(Text)
    file_url = Column(String(512))  # S3 URL
    thumbnail_url = Column(String(512))  # S3 URL for preview
    score = Column(Float, nullable=True)
    feedback = Column(Text, nullable=True)
    submission_date = Column(DateTime(timezone=True), server_default=func.now())
    is_qualified = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="submissions")
    event = relationship("Event", back_populates="submissions")