from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.core.database import get_db
from app.core.dependencies import get_current_instructor
from app.crud import product as product_crud
from app.crud import instructor as instructor_crud
from app.schemas.product import ProductCreate, ProductUpdate, ProductResponse
from app.models.instructor import Instructor

router = APIRouter()


@router.post("/products", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
async def create_product(
    product_in: ProductCreate,
    current_instructor: Instructor = Depends(get_current_instructor),
    db: AsyncSession = Depends(get_db)
):
    """Create a new product (instructor only)"""
    product = await product_crud.create_product(
        db,
        product_in=product_in,
        instructor_id=current_instructor.id
    )
    return product


@router.get("/products", response_model=List[ProductResponse])
async def list_products(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    current_instructor: Instructor = Depends(get_current_instructor),
    db: AsyncSession = Depends(get_db)
):
    """List all products for current instructor"""
    products = await product_crud.get_products_by_instructor(
        db,
        instructor_id=current_instructor.id,
        skip=skip,
        limit=limit
    )
    return products


@router.get("/products/{product_id}", response_model=ProductResponse)
async def get_product(
    product_id: str,
    current_instructor: Instructor = Depends(get_current_instructor),
    db: AsyncSession = Depends(get_db)
):
    """Get a specific product"""
    product = await product_crud.get_product(db, product_id=product_id)

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )

    # Check if product belongs to current instructor
    if product.instructor_id != current_instructor.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this product"
        )

    return product


@router.put("/products/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: str,
    product_in: ProductUpdate,
    current_instructor: Instructor = Depends(get_current_instructor),
    db: AsyncSession = Depends(get_db)
):
    """Update a product"""
    # Check if product exists and belongs to instructor
    existing_product = await product_crud.get_product(db, product_id=product_id)

    if not existing_product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )

    if existing_product.instructor_id != current_instructor.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this product"
        )

    updated_product = await product_crud.update_product(
        db,
        product_id=product_id,
        product_in=product_in
    )

    return updated_product


@router.delete("/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(
    product_id: str,
    current_instructor: Instructor = Depends(get_current_instructor),
    db: AsyncSession = Depends(get_db)
):
    """Delete a product"""
    # Check if product exists and belongs to instructor
    existing_product = await product_crud.get_product(db, product_id=product_id)

    if not existing_product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )

    if existing_product.instructor_id != current_instructor.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this product"
        )

    await product_crud.delete_product(db, product_id=product_id)
    return None


@router.get("/products/stats/summary")
async def get_products_stats(
    current_instructor: Instructor = Depends(get_current_instructor),
    db: AsyncSession = Depends(get_db)
):
    """Get products statistics for current instructor"""
    total_count = await product_crud.count_products_by_instructor(
        db,
        instructor_id=current_instructor.id
    )

    return {
        "total_products": total_count,
        "instructor_id": current_instructor.id,
    }


# Public endpoints (no authentication required)
@router.get("/public/store/{subdomain}/products", response_model=List[ProductResponse])
async def get_public_store_products(
    subdomain: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    """Get published products for a store (public access)"""
    # Find instructor by subdomain
    instructor = await instructor_crud.get_instructor_by_subdomain(db, subdomain=subdomain)

    if not instructor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Store not found"
        )

    # Get only published products
    products = await product_crud.get_published_products_by_instructor(
        db,
        instructor_id=instructor.id,
        skip=skip,
        limit=limit
    )

    return products


@router.get("/public/store/{subdomain}/info")
async def get_public_store_info(
    subdomain: str,
    db: AsyncSession = Depends(get_db)
):
    """Get store information (public access)"""
    instructor = await instructor_crud.get_instructor_by_subdomain(db, subdomain=subdomain)

    if not instructor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Store not found"
        )

    return {
        "store_name": instructor.store_name,
        "full_name": instructor.full_name,
        "bio": instructor.bio,
        "profile_image": instructor.profile_image,
        "subdomain": instructor.subdomain,
        # Footer information
        "footer_company_name": instructor.footer_company_name,
        "footer_ceo_name": instructor.footer_ceo_name,
        "footer_privacy_officer": instructor.footer_privacy_officer,
        "footer_business_number": instructor.footer_business_number,
        "footer_sales_number": instructor.footer_sales_number,
        "footer_contact": instructor.footer_contact,
        "footer_business_hours": instructor.footer_business_hours,
        "footer_address": instructor.footer_address,
        # Banner slides
        "banner_slides": instructor.banner_slides or [],
        # Kakao Channel Chat
        "kakao_channel_id": instructor.kakao_channel_id,
    }


@router.get("/public/store/{subdomain}/products/{product_id}", response_model=ProductResponse)
async def get_public_product(
    subdomain: str,
    product_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Get a single published product (public access)"""
    # Find instructor by subdomain
    instructor = await instructor_crud.get_instructor_by_subdomain(db, subdomain=subdomain)

    if not instructor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Store not found"
        )

    # Get product
    product = await product_crud.get_product(db, product_id=product_id)

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )

    # Check if product belongs to this instructor and is published
    if product.instructor_id != instructor.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )

    if not product.is_published:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )

    return product
