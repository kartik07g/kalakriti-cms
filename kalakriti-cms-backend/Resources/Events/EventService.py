from sqlalchemy.orm import Session
from fastapi import HTTPException
from models.event import Event
from schemas.event import EventCreate, EventUpdate, EventResponse
from typing import List

class EventService:
    
    def create_event(self, db: Session, event_data: EventCreate):
        """Create a new event"""
        new_event = Event(
            event_name=event_data.event_name,
            season=event_data.season,
            start_date=event_data.start_date,
            end_date=event_data.end_date
        )
        
        db.add(new_event)
        db.commit()
        db.refresh(new_event)
        
        return {
            "message": "Event created successfully",
            "event": EventResponse.model_validate(new_event)
        }
    
    def get_events(self, db: Session, **filters) -> List[EventResponse]:
        """Get events with optional filtering"""
        query = db.query(Event)
        
        if filters.get('event_name'):
            query = query.filter(Event.event_name.ilike(f"%{filters['event_name']}%"))
        if filters.get('season'):
            query = query.filter(Event.season.ilike(f"%{filters['season']}%"))
        if filters.get('event_id'):
            query = query.filter(Event.event_id == filters['event_id'])
        
        events = query.all()
        return [EventResponse.model_validate(event) for event in events]
    
    def get_event_by_id(self, db: Session, event_id: str):
        """Get a specific event by ID"""
        event = db.query(Event).filter(Event.event_id == event_id).first()
        
        if not event:
            raise HTTPException(status_code=404, detail="Event not found")
        
        return EventResponse.model_validate(event)
    
    def update_event(self, db: Session, event_id: str, event_data: EventUpdate):
        """Update event information"""
        event = db.query(Event).filter(Event.event_id == event_id).first()
        
        if not event:
            raise HTTPException(status_code=404, detail="Event not found")
        
        update_data = event_data.model_dump(exclude_unset=True)
        
        for field, value in update_data.items():
            setattr(event, field, value)
        
        db.commit()
        db.refresh(event)
        
        return {
            "message": "Event updated successfully",
            "event": EventResponse.model_validate(event)
        }
    
    def delete_event(self, db: Session, event_id: str):
        """Delete an event"""
        event = db.query(Event).filter(Event.event_id == event_id).first()
        
        if not event:
            raise HTTPException(status_code=404, detail="Event not found")
        
        db.delete(event)
        db.commit()
        
        return {"message": "Event deleted successfully"}