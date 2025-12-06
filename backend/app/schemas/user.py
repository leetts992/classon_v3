from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional


# Shared properties
class UserBase(BaseModel):
    email: EmailStr
    full_name: str


# Properties to receive via API on creation
class UserCreate(UserBase):
    password: str


# Properties to receive via API on update
class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    password: Optional[str] = None


# Properties to return to client
class UserResponse(UserBase):
    id: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


# Properties stored in DB
class UserInDB(UserBase):
    id: str
    hashed_password: str
    is_active: bool
    is_superuser: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
