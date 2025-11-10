from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text
from sqlalchemy.sql import func
from core.database import Base
import uuid

class User(Base):
    __tablename__ = "users"

    user_id = Column(String(20), primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True)
    full_name = Column(String(255))
    password = Column(String(255))
    phone_number = Column(String(20))
    age = Column(String, nullable=True)
    address = Column(Text, nullable=True)
    city = Column(String, nullable=True)
    state = Column(String, nullable=True)
    previous_experience = Column(Text, nullable=True)
    status = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __init__(self, email, full_name, phone_number, age, address, city, state, previous_experience=None, password=None):
        self.user_id = self.generate_user_id()
        self.email = email
        self.password = password
        self.full_name = full_name
        self.phone_number = phone_number
        self.age = age
        self.address = address
        self.city = city
        self.state = state
        self.previous_experience = previous_experience

    @staticmethod
    def generate_user_id():
        """Generate a unique user ID like 'USER1234567'"""
        return f"USER{uuid.uuid4().int % 10000000}"