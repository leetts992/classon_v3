from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from datetime import datetime, timedelta
from app.models.product import Product
from app.schemas.product import ProductCreate, ProductUpdate


async def get_product(db: AsyncSession, product_id: str) -> Optional[Product]:
    """Get a product by ID"""
    result = await db.execute(select(Product).filter(Product.id == product_id))
    return result.scalars().first()


async def get_products_by_instructor(
    db: AsyncSession,
    instructor_id: str,
    skip: int = 0,
    limit: int = 100
) -> List[Product]:
    """Get all products for an instructor"""
    result = await db.execute(
        select(Product)
        .filter(Product.instructor_id == instructor_id)
        .offset(skip)
        .limit(limit)
        .order_by(Product.created_at.desc())
    )
    return result.scalars().all()


async def get_published_products_by_instructor(
    db: AsyncSession,
    instructor_id: str,
    skip: int = 0,
    limit: int = 100
) -> List[Product]:
    """Get published products for an instructor (for public store)"""
    result = await db.execute(
        select(Product)
        .filter(Product.instructor_id == instructor_id, Product.is_published == True)
        .offset(skip)
        .limit(limit)
        .order_by(Product.created_at.desc())
    )
    return result.scalars().all()


async def create_product(
    db: AsyncSession,
    product_in: ProductCreate,
    instructor_id: str
) -> Product:
    """Create a new product"""
    # 카운트다운 종료 시간 계산 (현재 시간 + 설정된 시간)
    modal_end_time = None
    if product_in.modal_count_days or product_in.modal_count_hours or product_in.modal_count_minutes or product_in.modal_count_seconds:
        now = datetime.now()
        modal_end_time = now + timedelta(
            days=product_in.modal_count_days or 0,
            hours=product_in.modal_count_hours or 0,
            minutes=product_in.modal_count_minutes or 0,
            seconds=product_in.modal_count_seconds or 0
        )

    db_product = Product(
        instructor_id=instructor_id,
        title=product_in.title,
        description=product_in.description,
        detailed_description=product_in.detailed_description,
        price=product_in.price,
        discount_price=product_in.discount_price,
        thumbnail=product_in.thumbnail,
        type=product_in.type,
        category=product_in.category,
        duration=product_in.duration,
        file_url=product_in.file_url,
        is_published=product_in.is_published,
        modal_bg_color=product_in.modal_bg_color,
        modal_bg_opacity=product_in.modal_bg_opacity,
        modal_text=product_in.modal_text,
        modal_text_color=product_in.modal_text_color,
        modal_button_text=product_in.modal_button_text,
        modal_button_color=product_in.modal_button_color,
        modal_count_days=product_in.modal_count_days,
        modal_count_hours=product_in.modal_count_hours,
        modal_count_minutes=product_in.modal_count_minutes,
        modal_count_seconds=product_in.modal_count_seconds,
        modal_end_time=modal_end_time,
    )
    db.add(db_product)
    await db.commit()
    await db.refresh(db_product)
    return db_product


async def update_product(
    db: AsyncSession,
    product_id: str,
    product_in: ProductUpdate
) -> Optional[Product]:
    """Update a product"""
    result = await db.execute(select(Product).filter(Product.id == product_id))
    db_product = result.scalars().first()

    if not db_product:
        return None

    # Update only provided fields
    update_data = product_in.model_dump(exclude_unset=True)

    # 카운트다운 시간 설정이 변경되면 modal_end_time 재계산
    countdown_fields = ['modal_count_days', 'modal_count_hours', 'modal_count_minutes', 'modal_count_seconds']
    if any(field in update_data for field in countdown_fields):
        # 기존 값 유지 + 업데이트된 값 병합
        days = update_data.get('modal_count_days', db_product.modal_count_days) or 0
        hours = update_data.get('modal_count_hours', db_product.modal_count_hours) or 0
        minutes = update_data.get('modal_count_minutes', db_product.modal_count_minutes) or 0
        seconds = update_data.get('modal_count_seconds', db_product.modal_count_seconds) or 0

        if days or hours or minutes or seconds:
            now = datetime.now()
            update_data['modal_end_time'] = now + timedelta(
                days=days, hours=hours, minutes=minutes, seconds=seconds
            )

    for field, value in update_data.items():
        setattr(db_product, field, value)

    await db.commit()
    await db.refresh(db_product)
    return db_product


async def delete_product(db: AsyncSession, product_id: str) -> bool:
    """Delete a product"""
    result = await db.execute(select(Product).filter(Product.id == product_id))
    db_product = result.scalars().first()

    if not db_product:
        return False

    await db.delete(db_product)
    await db.commit()
    return True


async def count_products_by_instructor(db: AsyncSession, instructor_id: str) -> int:
    """Count total products for an instructor"""
    result = await db.execute(
        select(Product).filter(Product.instructor_id == instructor_id)
    )
    return len(result.scalars().all())
