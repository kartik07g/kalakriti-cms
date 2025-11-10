from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class EventRegistrationCreate(BaseModel):
    user_id: str
    event_name: str
    season: str
    artwork_count: int = Field(gt=0, description="Number of artworks must be greater than 0")

class EventRegistrationUpdate(BaseModel):
    event_name: Optional[str] = None
    season: Optional[str] = None
    artwork_count: Optional[int] = Field(None, gt=0, description="Number of artworks must be greater than 0")
    registration_status: Optional[str] = None

class EventRegistrationResponse(BaseModel):
    event_registration_id: str
    user_id: str
    event_name: str
    season: str
    artwork_count: int
    registration_status: str
    created_dt: datetime
    updated_dt: Optional[datetime] = None

    model_config = {
        "from_attributes": True
    }

class EventRegistrationListResponse(BaseModel):
    registrations: List[EventRegistrationResponse]