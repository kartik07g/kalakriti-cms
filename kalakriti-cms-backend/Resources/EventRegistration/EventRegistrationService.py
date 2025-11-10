from sqlalchemy.orm import Session
from fastapi import HTTPException
from models.event_registration import EventRegistration
from schemas.event_registration import EventRegistrationCreate, EventRegistrationUpdate, EventRegistrationResponse
from typing import List, Optional

class EventRegistrationService:
    
    def create_registration(self, db: Session, registration_data: EventRegistrationCreate):
        """Create a new event registration"""
        new_registration = EventRegistration(
            user_id=registration_data.user_id,
            event_name=registration_data.event_name,
            season=registration_data.season,
            artwork_count=registration_data.artwork_count
        )
        
        db.add(new_registration)
        db.commit()
        db.refresh(new_registration)
        
        return {
            "message": "Event registration created successfully",
            "registration": EventRegistrationResponse.model_validate(new_registration)
        }
    
    def get_registrations(self, db: Session, **filters) -> List[EventRegistrationResponse]:
        """Get event registrations with optional filtering"""
        query = db.query(EventRegistration)
        
        # Apply filters
        if filters.get('user_id'):
            query = query.filter(EventRegistration.user_id == filters['user_id'])
        if filters.get('event_name'):
            query = query.filter(EventRegistration.event_name.ilike(f"%{filters['event_name']}%"))
        if filters.get('season'):
            query = query.filter(EventRegistration.season.ilike(f"%{filters['season']}%"))
        if filters.get('registration_status'):
            query = query.filter(EventRegistration.registration_status == filters['registration_status'])
        
        registrations = query.all()
        return [EventRegistrationResponse.model_validate(registration) for registration in registrations]
    
    def get_registration_by_id(self, db: Session, registration_id: str):
        """Get a specific event registration by ID"""
        registration = db.query(EventRegistration).filter(
            EventRegistration.event_registration_id == registration_id
        ).first()
        
        if not registration:
            raise HTTPException(status_code=404, detail="Event registration not found")
        
        return EventRegistrationResponse.model_validate(registration)
    
    def update_registration(self, db: Session, registration_id: str, registration_data: EventRegistrationUpdate):
        """Update event registration information"""
        registration = db.query(EventRegistration).filter(
            EventRegistration.event_registration_id == registration_id
        ).first()
        
        if not registration:
            raise HTTPException(status_code=404, detail="Event registration not found")
        
        # Update fields
        update_data = registration_data.model_dump(exclude_unset=True)
        
        for field, value in update_data.items():
            setattr(registration, field, value)
        
        db.commit()
        db.refresh(registration)
        
        return {
            "message": "Event registration updated successfully",
            "registration": EventRegistrationResponse.model_validate(registration)
        }
    
    def delete_registration(self, db: Session, registration_id: str):
        """Delete an event registration"""
        registration = db.query(EventRegistration).filter(
            EventRegistration.event_registration_id == registration_id
        ).first()
        
        if not registration:
            raise HTTPException(status_code=404, detail="Event registration not found")
        
        db.delete(registration)
        db.commit()
        
        return {"message": "Event registration deleted successfully"}