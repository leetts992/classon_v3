from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional


# Shared properties
class InstructorBase(BaseModel):
    email: EmailStr
    full_name: str
    subdomain: str
    store_name: str
    bio: Optional[str] = None


# Properties to receive via API on creation
class InstructorCreate(InstructorBase):
    password: str


# Properties to receive via API on update
class InstructorUpdate(BaseModel):
    full_name: Optional[str] = None
    store_name: Optional[str] = None
    subdomain: Optional[str] = None
    bio: Optional[str] = None
    profile_image: Optional[str] = None
    email: Optional[EmailStr] = None

    # Footer information
    footer_company_name: Optional[str] = None
    footer_ceo_name: Optional[str] = None
    footer_privacy_officer: Optional[str] = None
    footer_business_number: Optional[str] = None
    footer_sales_number: Optional[str] = None
    footer_contact: Optional[str] = None
    footer_business_hours: Optional[str] = None
    footer_address: Optional[str] = None

    # Kakao Login Settings
    kakao_client_id: Optional[str] = None
    kakao_client_secret: Optional[str] = None
    kakao_redirect_uri: Optional[str] = None
    kakao_enabled: Optional[bool] = None


# Properties to return to client
class InstructorResponse(InstructorBase):
    id: str
    profile_image: Optional[str] = None
    is_active: bool
    is_verified: bool
    created_at: datetime

    # Footer information
    footer_company_name: Optional[str] = None
    footer_ceo_name: Optional[str] = None
    footer_privacy_officer: Optional[str] = None
    footer_business_number: Optional[str] = None
    footer_sales_number: Optional[str] = None
    footer_contact: Optional[str] = None
    footer_business_hours: Optional[str] = None
    footer_address: Optional[str] = None

    # Kakao Login Settings (don't expose client_secret!)
    kakao_enabled: Optional[bool] = False
    kakao_client_id: Optional[str] = None
    kakao_redirect_uri: Optional[str] = None

    class Config:
        from_attributes = True


# Properties stored in DB
class InstructorInDB(InstructorBase):
    id: str
    hashed_password: str
    profile_image: Optional[str] = None
    is_active: bool
    is_verified: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
