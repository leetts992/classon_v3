from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


# Base Customer Schema
class CustomerBase(BaseModel):
    email: EmailStr
    full_name: str = Field(..., min_length=1, max_length=100)
    phone: Optional[str] = None


# Customer Registration (for subdomain site signup)
class CustomerCreate(CustomerBase):
    password: str = Field(..., min_length=6)


# Customer Update (for instructors to update customer info)
class CustomerUpdate(BaseModel):
    full_name: Optional[str] = Field(None, min_length=1, max_length=100)
    phone: Optional[str] = None
    is_active: Optional[bool] = None
    notes: Optional[str] = None
    tags: Optional[str] = None


# Customer Response
class CustomerResponse(CustomerBase):
    id: str
    instructor_id: str
    is_active: bool
    is_email_verified: bool
    notes: Optional[str] = None
    tags: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    last_login: Optional[datetime] = None

    class Config:
        from_attributes = True


# Customer Login Request
class CustomerLoginRequest(BaseModel):
    email: EmailStr
    password: str


# Customer List Item (for instructor's customer management)
class CustomerListItem(BaseModel):
    id: str
    email: str
    full_name: str
    phone: Optional[str] = None
    is_active: bool
    is_email_verified: bool
    tags: Optional[str] = None
    created_at: datetime
    last_login: Optional[datetime] = None

    class Config:
        from_attributes = True
