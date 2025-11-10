from sqlalchemy.orm import Session
from fastapi import HTTPException
from models.contact_us import ContactUs
from schemas.contact_us import ContactUsCreate, ContactUsUpdate, ContactUsResponseSchema
from typing import List

class ContactUsService:
    
    def create_contact_us(self, db: Session, contact_data: ContactUsCreate):
        """Create a new contact us entry"""
        new_contact = ContactUs(
            name=contact_data.name,
            email=contact_data.email,
            phone_number=contact_data.phone_number,
            subject=contact_data.subject,
            message=contact_data.message
        )
        
        db.add(new_contact)
        db.commit()
        db.refresh(new_contact)
        
        return {
            "message": "Contact us entry created successfully",
            "contact_us": ContactUsResponseSchema.model_validate(new_contact)
        }
    
    def get_contact_us_list(self, db: Session, **filters) -> List[ContactUsResponseSchema]:
        """Get all contact us entries with optional filtering"""
        query = db.query(ContactUs)
        
        # Apply filters
        if filters.get('email'):
            query = query.filter(ContactUs.email.ilike(f"%{filters['email']}%"))
        if filters.get('name'):
            query = query.filter(ContactUs.name.ilike(f"%{filters['name']}%"))
        if filters.get('subject'):
            query = query.filter(ContactUs.subject.ilike(f"%{filters['subject']}%"))
        
        contacts = query.order_by(ContactUs.created_at.desc()).all()
        return [ContactUsResponseSchema.model_validate(contact) for contact in contacts]
    
    def get_contact_us_by_id(self, db: Session, contact_id: int):
        """Get a specific contact us entry by ID"""
        contact = db.query(ContactUs).filter(ContactUs.id == contact_id).first()
        if not contact:
            raise HTTPException(status_code=404, detail="Contact us entry not found")
        
        return ContactUsResponseSchema.model_validate(contact)
    
    def update_contact_us(self, db: Session, contact_id: int, contact_data: ContactUsUpdate):
        """Update a contact us entry"""
        contact = db.query(ContactUs).filter(ContactUs.id == contact_id).first()
        if not contact:
            raise HTTPException(status_code=404, detail="Contact us entry not found")
        
        # Update fields
        update_data = contact_data.model_dump(exclude_unset=True)
        
        for field, value in update_data.items():
            setattr(contact, field, value)
        
        db.commit()
        db.refresh(contact)
        
        return {
            "message": "Contact us entry updated successfully",
            "contact_us": ContactUsResponseSchema.model_validate(contact)
        }
    
    def delete_contact_us(self, db: Session, contact_id: int):
        """Delete a contact us entry"""
        contact = db.query(ContactUs).filter(ContactUs.id == contact_id).first()
        if not contact:
            raise HTTPException(status_code=404, detail="Contact us entry not found")
        
        db.delete(contact)
        db.commit()
        
        return {"message": "Contact us entry deleted successfully"}