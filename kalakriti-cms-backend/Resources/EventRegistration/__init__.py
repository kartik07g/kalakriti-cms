from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from schemas.event_registration import EventRegistrationCreate, EventRegistrationUpdate, EventRegistrationResponse
from core.database import get_db
from .EventRegistrationService import EventRegistrationService

event_registration_router = APIRouter(prefix="/v1/backend", tags=["Event Registration"])

@event_registration_router.post("/event-registrations", response_model=dict)
def create_event_registration(registration_data: EventRegistrationCreate, db: Session = Depends(get_db)):
    return EventRegistrationService().create_registration(db, registration_data)

@event_registration_router.get("/event-registrations")
def get_event_registrations(request: Request, db: Session = Depends(get_db)):
    filters = dict(request.query_params)
    response = EventRegistrationService().get_registrations(db, **filters)
    return {"event_registrations": response}

@event_registration_router.get("/event-registrations/{registration_id}", response_model=EventRegistrationResponse)
def get_event_registration(registration_id: str, db: Session = Depends(get_db)):
    return EventRegistrationService().get_registration_by_id(db, registration_id)

@event_registration_router.patch("/event-registrations/{registration_id}", response_model=dict)
def update_event_registration(registration_id: str, registration_data: EventRegistrationUpdate, db: Session = Depends(get_db)):
    return EventRegistrationService().update_registration(db, registration_id, registration_data)

@event_registration_router.delete("/event-registrations/{registration_id}")
def delete_event_registration(registration_id: str, db: Session = Depends(get_db)):
    return EventRegistrationService().delete_registration(db, registration_id)