from sqlalchemy.orm import Session
from fastapi import HTTPException
from models.event_registration import EventRegistration
from models.user import User
from schemas.event_registration import EventRegistrationCreate, EventRegistrationUpdate, EventRegistrationResponse
from Bizlayer.EmailStrategy.EmailStrategy import SMTPEmailStrategy
from utils.email_template_renderer import render_template
from typing import List, Optional
from datetime import datetime

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
        
        # Send registration success email
        self._send_registration_email(db, new_registration)
        
        return {
            "message": "Event registration created successfully",
            "registration": EventRegistrationResponse.model_validate(new_registration)
        }
    
    def _send_registration_email(self, db: Session, registration: EventRegistration):
        """Send registration success email to user"""
        try:
            # Get user details
            user = db.query(User).filter(User.user_id == registration.user_id).first()
            if not user:
                return
            
            # Prepare email data
            email_data = {
                "user_name": user.full_name if user.full_name else user.email,
                "registration_id": registration.event_registration_id,
                "event_name": registration.event_name,
                "season": registration.season,
                "artwork_count": registration.artwork_count,
                "registration_date": registration.created_dt.strftime("%B %d, %Y") if registration.created_dt else datetime.now().strftime("%B %d, %Y"),
                "registration_status": registration.registration_status.title()
            }
            
            # Render email template
            email_body = render_template("successful_registration.html", email_data)
            
            # Send email using SMTPEmailStrategy
            email_strategy = SMTPEmailStrategy()
            email_strategy.send_email(
                to_email=user.email,
                subject=f"Registration Successful - {registration.event_name}",
                body=email_body,
                html=True
            )
            
        except Exception as e:
            # Log error but don't fail the registration
            print(f"Failed to send registration email: {str(e)}")
    
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