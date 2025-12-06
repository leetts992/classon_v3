from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
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
    db_product = Product(
        instructor_id=instructor_id,
        title=product_in.title,
        description=product_in.description,
        price=product_in.price,
        discount_price=product_in.discount_price,
        thumbnail=product_in.thumbnail,
        type=product_in.type,
        category=product_in.category,
        duration=product_in.duration,
        file_url=product_in.file_url,
        is_published=product_in.is_published,
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
