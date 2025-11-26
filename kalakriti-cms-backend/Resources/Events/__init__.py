from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from schemas.event import EventCreate, EventUpdate, EventResponse
from core.database import get_db
from .EventService import EventService

event_router = APIRouter(prefix="/v1/backend", tags=["Events"])

@event_router.post("/events", response_model=dict)
def create_event(event_data: EventCreate, db: Session = Depends(get_db)):
    return EventService().create_event(db, event_data)

@event_router.get("/events")
def get_events(request: Request, db: Session = Depends(get_db)):
    filters = dict(request.query_params)
    response = EventService().get_events(db, **filters)
    return {"events": response}

@event_router.get("/events/{event_id}", response_model=EventResponse)
def get_event(event_id: str, db: Session = Depends(get_db)):
    return EventService().get_event_by_id(db, event_id)

@event_router.patch("/events/{event_id}", response_model=dict)
def update_event(event_id: str, event_data: EventUpdate, db: Session = Depends(get_db)):
    return EventService().update_event(db, event_id, event_data)

@event_router.delete("/events/{event_id}")
def delete_event(event_id: str, db: Session = Depends(get_db)):
    return EventService().delete_event(db, event_id)