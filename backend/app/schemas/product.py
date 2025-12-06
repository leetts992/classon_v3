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


class ProductResponse(ProductBase):
    id: str
    instructor_id: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
