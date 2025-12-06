from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Enum as SQLEnum, Text, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import uuid
import enum


class OrderStatus(str, enum.Enum):
    PENDING = "PENDING"  # 결제 대기
    PAID = "PAID"  # 결제 완료
    CANCELLED = "CANCELLED"  # 취소됨
    REFUNDED = "REFUNDED"  # 환불됨


class Order(Base):
    __tablename__ = "orders"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    customer_id = Column(String, ForeignKey("customers.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(String, ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    instructor_id = Column(String, ForeignKey("instructors.id", ondelete="CASCADE"), nullable=False, index=True)

    # Order details
    order_number = Column(String, unique=True, nullable=False, index=True)
    status = Column(SQLEnum(OrderStatus, name="order_status"), default=OrderStatus.PENDING, nullable=False)

    # Pricing
    original_price = Column(Integer, nullable=False)  # 원가
    paid_price = Column(Integer, nullable=False)  # 실제 결제 금액

    # Payment info
    payment_method = Column(String, nullable=True)  # 결제 수단 (card, transfer, etc.)
    payment_id = Column(String, nullable=True)  # 외부 결제 시스템 ID
    paid_at = Column(DateTime(timezone=True), nullable=True)  # 결제 완료 시각

    # Cancellation/Refund info
    cancelled_at = Column(DateTime(timezone=True), nullable=True)
    refunded_at = Column(DateTime(timezone=True), nullable=True)
    refund_reason = Column(Text, nullable=True)

    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    customer = relationship("Customer", back_populates="orders")
