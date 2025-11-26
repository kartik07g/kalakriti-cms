from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, date

class EventCreate(BaseModel):
    event_name: str
    season: str
    start_date: date
    end_date: date

class EventUpdate(BaseModel):
    event_name: Optional[str] = None
    season: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None

class EventResponse(BaseModel):
    event_id: str
    event_name: str
    season: str
    start_date: date
    end_date: date
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = {
        "from_attributes": True
    }

class EventListResponse(BaseModel):
    events: List[EventResponse]