from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class ContactUsCreate(BaseModel):
    name: str
    email: EmailStr
    phone_number: Optional[str] = None
    subject: str
    message: str

class ContactUsUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone_number: Optional[str] = None
    subject: Optional[str] = None
    message: Optional[str] = None

class ContactUsResponseSchema(BaseModel):
    id: int
    name: str
    email: EmailStr
    phone_number: Optional[str] = None
    subject: str
    message: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = {
        "from_attributes": True
    }

class ContactUsListResponseSchema(BaseModel):
    contact_us: List[ContactUsResponseSchema]