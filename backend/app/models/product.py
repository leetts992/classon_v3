from sqlalchemy import Column, String, Integer, Boolean, DateTime, Text, Enum, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base
import uuid
import enum


class ProductType(str, enum.Enum):
    EBOOK = "ebook"
    VIDEO = "video"


class Product(Base):
    __tablename__ = "products"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    instructor_id = Column(String, ForeignKey("instructors.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)  # 간단한 설명 (목록용)
    detailed_description = Column(Text, nullable=True)  # 상세 설명 (HTML/Markdown)
    price = Column(Integer, nullable=False)  # 원화 단위
    discount_price = Column(Integer, nullable=True)
    thumbnail = Column(String, nullable=True)
    type = Column(Enum(ProductType), nullable=False)
    category = Column(String, nullable=True)
    duration = Column(Integer, nullable=True)  # 동영상 길이 (분)
    file_url = Column(String, nullable=True)  # S3 URL
    is_published = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships (will be added later)
    # instructor = relationship("Instructor", back_populates="products")
