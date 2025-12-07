from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum


class ProductType(str, Enum):
    EBOOK = "ebook"
    VIDEO = "video"


class ProductBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    detailed_description: Optional[str] = None
    price: int = Field(..., ge=0)
    discount_price: Optional[int] = Field(None, ge=0)
    thumbnail: Optional[str] = None
    type: ProductType
    category: Optional[str] = None
    duration: Optional[int] = Field(None, ge=0)  # in minutes
    file_url: Optional[str] = None
    is_published: bool = False

    # 결제 유도 모달 설정
    modal_bg_color: Optional[str] = "#1a1a1a"
    modal_text: Optional[str] = "선착순 마감입니다!"
    modal_text_color: Optional[str] = "#ffffff"
    modal_button_text: Optional[str] = "0원 무료 신청하기"
    modal_button_color: Optional[str] = "#ff0000"
    modal_count_days: Optional[int] = 3
    modal_count_hours: Optional[int] = 0
    modal_count_minutes: Optional[int] = 0
    modal_count_seconds: Optional[int] = 48


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    detailed_description: Optional[str] = None
    price: Optional[int] = Field(None, ge=0)
    discount_price: Optional[int] = Field(None, ge=0)
    thumbnail: Optional[str] = None
    type: Optional[ProductType] = None
    category: Optional[str] = None
    duration: Optional[int] = Field(None, ge=0)
    file_url: Optional[str] = None
    is_published: Optional[bool] = None

    # 결제 유도 모달 설정
    modal_bg_color: Optional[str] = None
    modal_text: Optional[str] = None
    modal_text_color: Optional[str] = None
    modal_button_text: Optional[str] = None
    modal_button_color: Optional[str] = None
    modal_count_days: Optional[int] = None
    modal_count_hours: Optional[int] = None
    modal_count_minutes: Optional[int] = None
    modal_count_seconds: Optional[int] = None


class ProductResponse(ProductBase):
    id: str
    instructor_id: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
