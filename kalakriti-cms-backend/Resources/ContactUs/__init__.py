from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from schemas.contact_us import ContactUsCreate, ContactUsUpdate, ContactUsResponseSchema
from core.database import get_db
from .ContactUsService import ContactUsService

contact_us_router = APIRouter(prefix="/v1/backend", tags=["ContactUs"])

@contact_us_router.post("/contact-us")
def create_contact_us(contact_data: ContactUsCreate, db: Session = Depends(get_db)):
    return ContactUsService().create_contact_us(db, contact_data)

@contact_us_router.get("/contact-us")
def get_contact_us_list(request: Request, db: Session = Depends(get_db)):
    filters = dict(request.query_params)
    response = ContactUsService().get_contact_us_list(db, **filters)
    return {"contact_us": response}

@contact_us_router.get("/contact-us/{contact_id}")
def get_contact_us_by_id(contact_id: int, db: Session = Depends(get_db)):
    return ContactUsService().get_contact_us_by_id(db, contact_id)

@contact_us_router.patch("/contact-us/{contact_id}")
def update_contact_us(contact_id: int, contact_data: ContactUsUpdate, db: Session = Depends(get_db)):
    return ContactUsService().update_contact_us(db, contact_id, contact_data)

@contact_us_router.delete("/contact-us/{contact_id}")
def delete_contact_us(contact_id: int, db: Session = Depends(get_db)):
    return ContactUsService().delete_contact_us(db, contact_id)