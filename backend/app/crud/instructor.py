from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.instructor import Instructor
from app.schemas.instructor import InstructorCreate, InstructorUpdate
from app.core.security import get_password_hash
from typing import Optional
from datetime import datetime


async def get_instructor_by_email(db: AsyncSession, email: str) -> Optional[Instructor]:
    """Get instructor by email"""
    result = await db.execute(select(Instructor).filter(Instructor.email == email))
    return result.scalars().first()


async def get_instructor_by_subdomain(db: AsyncSession, subdomain: str) -> Optional[Instructor]:
    """Get instructor by subdomain"""
    result = await db.execute(select(Instructor).filter(Instructor.subdomain == subdomain))
    return result.scalars().first()


async def get_instructor_by_id(db: AsyncSession, instructor_id: str) -> Optional[Instructor]:
    """Get instructor by ID"""
    result = await db.execute(select(Instructor).filter(Instructor.id == instructor_id))
    return result.scalars().first()


async def create_instructor(db: AsyncSession, instructor_in: InstructorCreate) -> Instructor:
    """Create new instructor"""
    db_instructor = Instructor(
        email=instructor_in.email,
        hashed_password=get_password_hash(instructor_in.password),
        full_name=instructor_in.full_name,
        subdomain=instructor_in.subdomain,
        store_name=instructor_in.store_name,
        bio=instructor_in.bio,
    )
    db.add(db_instructor)
    await db.commit()
    await db.refresh(db_instructor)
    return db_instructor


async def update_instructor(
    db: AsyncSession,
    instructor: Instructor,
    instructor_update: InstructorUpdate
) -> Instructor:
    """Update instructor"""
    update_data = instructor_update.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(instructor, field, value)

    instructor.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(instructor)
    return instructor
