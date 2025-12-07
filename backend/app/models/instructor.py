from sqlalchemy import Column, String, Boolean, DateTime, Text, JSON
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

    # Banner slides for store main page
    # JSON array: [{"id": "...", "image_url": "...", "title": "...", "subtitle": "...", "link_url": "...", "order": 0}, ...]
    banner_slides = Column(JSON, nullable=True, default=list)

    # Kakao Login Settings
    kakao_client_id = Column(String, nullable=True)  # REST API 키
    kakao_client_secret = Column(String, nullable=True)  # 암호화 저장 필요
    kakao_redirect_uri = Column(String, nullable=True)  # 리다이렉트 URI
    kakao_enabled = Column(Boolean, default=False)  # 카카오 로그인 활성화 여부

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    customers = relationship("Customer", back_populates="instructor", cascade="all, delete-orphan")
