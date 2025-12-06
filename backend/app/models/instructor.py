from sqlalchemy import Column, String, Boolean, DateTime, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import uuid


class Instructor(Base):
    __tablename__ = "instructors"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    subdomain = Column(String, unique=True, index=True, nullable=False)
    store_name = Column(String, nullable=False)
    bio = Column(Text, nullable=True)
    profile_image = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)

    # Footer information
    footer_company_name = Column(String, nullable=True)
    footer_ceo_name = Column(String, nullable=True)
    footer_privacy_officer = Column(String, nullable=True)
    footer_business_number = Column(String, nullable=True)
    footer_sales_number = Column(String, nullable=True)
    footer_contact = Column(String, nullable=True)
    footer_business_hours = Column(String, nullable=True)
    footer_address = Column(String, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    customers = relationship("Customer", back_populates="instructor", cascade="all, delete-orphan")
