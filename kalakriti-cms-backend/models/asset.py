from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from core.database import Base
import uuid

class Asset(Base):
    __tablename__ = "assets"

    asset_id = Column(String(20), primary_key=True, index=True)
    event_registration_id = Column(String(20), ForeignKey("event_registrations.event_registration_id"), nullable=False)
    asset_url = Column(String(500), nullable=False)
    asset_name = Column(String(255), nullable=False)
    create_dt = Column(DateTime(timezone=True), server_default=func.now())

    def __init__(self, event_registration_id, asset_url, asset_name):
        self.asset_id = self.generate_asset_id()
        self.event_registration_id = event_registration_id
        self.asset_url = asset_url
        self.asset_name = asset_name

    @staticmethod
    def generate_asset_id():
        """Generate a unique asset ID like 'AST1234567'"""
        return f"AST{uuid.uuid4().int % 10000000}"