from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum


class OrderStatus(str, Enum):
    PENDING = "PENDING"
    PAID = "PAID"
    CANCELLED = "CANCELLED"
    REFUNDED = "REFUNDED"


class OrderBase(BaseModel):
    product_id: str
    original_price: int = Field(..., ge=0)
    paid_price: int = Field(..., ge=0)
    payment_method: Optional[str] = None


class OrderCreate(OrderBase):
    pass


class OrderUpdate(BaseModel):
    status: Optional[OrderStatus] = None
    payment_method: Optional[str] = None
    payment_id: Optional[str] = None
    refund_reason: Optional[str] = None


class OrderResponse(BaseModel):
    id: str
    user_id: str
    product_id: str
    instructor_id: str
    order_number: str
    status: OrderStatus
    original_price: int
    paid_price: int
    payment_method: Optional[str] = None
    payment_id: Optional[str] = None
    paid_at: Optional[datetime] = None
    cancelled_at: Optional[datetime] = None
    refunded_at: Optional[datetime] = None
    refund_reason: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class OrderWithProductResponse(OrderResponse):
    """Order response with product details"""
    product_title: str
    product_type: str
    product_thumbnail: Optional[str] = None
