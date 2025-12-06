from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.models.order import Order, OrderStatus
from app.models.product import Product
from app.schemas.order import OrderCreate, OrderUpdate
from typing import List, Optional
from datetime import datetime
import uuid


def generate_order_number() -> str:
    """Generate unique order number"""
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    random_id = str(uuid.uuid4())[:8].upper()
    return f"ORD{timestamp}{random_id}"


async def get_order(db: AsyncSession, order_id: str) -> Optional[Order]:
    """Get a single order by ID"""
    result = await db.execute(
        select(Order).filter(Order.id == order_id)
    )
    return result.scalars().first()


async def get_order_by_number(db: AsyncSession, order_number: str) -> Optional[Order]:
    """Get a single order by order number"""
    result = await db.execute(
        select(Order).filter(Order.order_number == order_number)
    )
    return result.scalars().first()


async def get_orders_by_user(
    db: AsyncSession,
    user_id: str,
    skip: int = 0,
    limit: int = 100
) -> List[Order]:
    """Get all orders for a user"""
    result = await db.execute(
        select(Order)
        .filter(Order.user_id == user_id)
        .offset(skip)
        .limit(limit)
        .order_by(Order.created_at.desc())
    )
    return result.scalars().all()


async def get_orders_by_instructor(
    db: AsyncSession,
    instructor_id: str,
    skip: int = 0,
    limit: int = 100,
    status: Optional[OrderStatus] = None
) -> List[Order]:
    """Get all orders for an instructor's products"""
    query = select(Order).filter(Order.instructor_id == instructor_id)

    if status:
        query = query.filter(Order.status == status)

    result = await db.execute(
        query
        .offset(skip)
        .limit(limit)
        .order_by(Order.created_at.desc())
    )
    return result.scalars().all()


async def create_order(
    db: AsyncSession,
    order_in: OrderCreate,
    user_id: str,
    instructor_id: str
) -> Order:
    """Create a new order"""
    db_order = Order(
        user_id=user_id,
        product_id=order_in.product_id,
        instructor_id=instructor_id,
        order_number=generate_order_number(),
        original_price=order_in.original_price,
        paid_price=order_in.paid_price,
        payment_method=order_in.payment_method,
        status=OrderStatus.PENDING,
    )
    db.add(db_order)
    await db.commit()
    await db.refresh(db_order)
    return db_order


async def update_order(
    db: AsyncSession,
    order_id: str,
    order_update: OrderUpdate
) -> Optional[Order]:
    """Update an order"""
    db_order = await get_order(db, order_id)
    if not db_order:
        return None

    update_data = order_update.model_dump(exclude_unset=True)

    # Handle status-specific timestamps
    if "status" in update_data:
        if update_data["status"] == OrderStatus.PAID and not db_order.paid_at:
            update_data["paid_at"] = datetime.now()
        elif update_data["status"] == OrderStatus.CANCELLED and not db_order.cancelled_at:
            update_data["cancelled_at"] = datetime.now()
        elif update_data["status"] == OrderStatus.REFUNDED and not db_order.refunded_at:
            update_data["refunded_at"] = datetime.now()

    for field, value in update_data.items():
        setattr(db_order, field, value)

    await db.commit()
    await db.refresh(db_order)
    return db_order


async def delete_order(db: AsyncSession, order_id: str) -> bool:
    """Delete an order"""
    db_order = await get_order(db, order_id)
    if not db_order:
        return False

    await db.delete(db_order)
    await db.commit()
    return True


async def count_orders_by_instructor(
    db: AsyncSession,
    instructor_id: str,
    status: Optional[OrderStatus] = None
) -> int:
    """Count total orders for an instructor"""
    query = select(func.count(Order.id)).filter(Order.instructor_id == instructor_id)

    if status:
        query = query.filter(Order.status == status)

    result = await db.execute(query)
    return result.scalar()


async def get_total_revenue_by_instructor(
    db: AsyncSession,
    instructor_id: str
) -> int:
    """Calculate total revenue for an instructor (only PAID orders)"""
    result = await db.execute(
        select(func.sum(Order.paid_price))
        .filter(Order.instructor_id == instructor_id)
        .filter(Order.status == OrderStatus.PAID)
    )
    total = result.scalar()
    return total or 0
