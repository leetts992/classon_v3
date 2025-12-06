from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func, update
from app.models.customer import Customer
from app.schemas.customer import CustomerCreate, CustomerUpdate
from app.core.security import get_password_hash
from typing import Optional, List
from datetime import datetime
import uuid


async def get_customer_by_email_and_instructor(
    db: AsyncSession, email: str, instructor_id: str
) -> Optional[Customer]:
    """Get customer by email within a specific instructor's customer base"""
    result = await db.execute(
        select(Customer).filter(
            and_(Customer.email == email, Customer.instructor_id == instructor_id)
        )
    )
    return result.scalars().first()


async def get_customer(db: AsyncSession, customer_id: str) -> Optional[Customer]:
    """Get customer by ID"""
    result = await db.execute(select(Customer).filter(Customer.id == customer_id))
    return result.scalars().first()


async def create_customer(
    db: AsyncSession, customer_in: CustomerCreate, instructor_id: str
) -> Customer:
    """Create new customer for an instructor"""
    db_customer = Customer(
        id=str(uuid.uuid4()),
        instructor_id=instructor_id,
        email=customer_in.email,
        hashed_password=get_password_hash(customer_in.password),
        full_name=customer_in.full_name,
        phone=customer_in.phone,
    )
    db.add(db_customer)
    await db.commit()
    await db.refresh(db_customer)
    return db_customer


async def update_customer(
    db: AsyncSession, customer_id: str, customer_update: CustomerUpdate
) -> Optional[Customer]:
    """Update customer information"""
    # Get the customer first
    customer = await get_customer(db, customer_id)
    if not customer:
        return None

    # Update fields
    update_data = customer_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(customer, field, value)

    customer.updated_at = datetime.now()
    await db.commit()
    await db.refresh(customer)
    return customer


async def delete_customer(db: AsyncSession, customer_id: str) -> bool:
    """Delete a customer"""
    customer = await get_customer(db, customer_id)
    if not customer:
        return False

    await db.delete(customer)
    await db.commit()
    return True


async def list_customers_by_instructor(
    db: AsyncSession, instructor_id: str, skip: int = 0, limit: int = 100
) -> List[Customer]:
    """List all customers for a specific instructor"""
    result = await db.execute(
        select(Customer)
        .filter(Customer.instructor_id == instructor_id)
        .order_by(Customer.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    return list(result.scalars().all())


async def count_customers_by_instructor(db: AsyncSession, instructor_id: str) -> int:
    """Count total customers for an instructor"""
    result = await db.execute(
        select(func.count(Customer.id)).filter(Customer.instructor_id == instructor_id)
    )
    return result.scalar() or 0


async def update_last_login(db: AsyncSession, customer_id: str) -> None:
    """Update customer's last login timestamp"""
    await db.execute(
        update(Customer)
        .where(Customer.id == customer_id)
        .values(last_login=datetime.now())
    )
    await db.commit()


async def search_customers(
    db: AsyncSession,
    instructor_id: str,
    search_query: Optional[str] = None,
    is_active: Optional[bool] = None,
    skip: int = 0,
    limit: int = 100,
) -> List[Customer]:
    """Search customers with filters"""
    query = select(Customer).filter(Customer.instructor_id == instructor_id)

    if search_query:
        search_filter = f"%{search_query}%"
        query = query.filter(
            (Customer.full_name.ilike(search_filter))
            | (Customer.email.ilike(search_filter))
        )

    if is_active is not None:
        query = query.filter(Customer.is_active == is_active)

    query = query.order_by(Customer.created_at.desc()).offset(skip).limit(limit)

    result = await db.execute(query)
    return list(result.scalars().all())
