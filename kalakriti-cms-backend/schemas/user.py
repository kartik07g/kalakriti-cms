from pydantic import BaseModel, EmailStr, UUID4, Field
from typing import Optional, List, Literal
from datetime import datetime


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    phone_number: str
    age: str
    address: str
    city: str
    state: str
    previous_experience: Optional[str] = None


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    full_name: Optional[str] = None
    phone_number: Optional[str] = None
    age: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    previous_experience: Optional[str] = None

class UserResponseSchema(BaseModel):
    user_id: str
    email: EmailStr
    full_name: str
    phone_number: str
    age: str
    address: str
    city: str
    state: str
    previous_experience: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = {
        "from_attributes": True
    }

    
class UserListResponseSchema(BaseModel):
    users: List[UserResponseSchema]

class UserLogin(BaseModel):
    email: EmailStr
    password: str