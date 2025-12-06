from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import uuid


class Customer(Base):
    """
    Customer model - represents customers/students who sign up on instructor's subdomain site
    Each instructor has their own customer database
    """
    __tablename__ = "customers"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    instructor_id = Column(String, ForeignKey("instructors.id", ondelete="CASCADE"), nullable=False, index=True)

    # Basic Info
    email = Column(String, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    phone = Column(String, nullable=True)

    # Status
    is_active = Column(Boolean, default=True)
    is_email_verified = Column(Boolean, default=False)

    # Additional fields
    notes = Column(Text, nullable=True)  # Instructor's notes about this customer
    tags = Column(String, nullable=True)  # Comma-separated tags for categorization

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_login = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    instructor = relationship("Instructor", back_populates="customers")
    orders = relationship("Order", back_populates="customer", cascade="all, delete-orphan")

    # Unique constraint: each instructor can have unique customer emails
    __table_args__ = (
        # Email must be unique per instructor
        # (Different instructors can have customers with the same email)
    )
