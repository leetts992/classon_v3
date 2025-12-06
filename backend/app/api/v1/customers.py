from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.crud import customer as customer_crud
from app.crud import instructor as instructor_crud
from app.schemas.customer import (
    CustomerCreate,
    CustomerUpdate,
    CustomerResponse,
    CustomerListItem,
    CustomerLoginRequest,
)
from app.schemas.auth import Token
from app.core.security import verify_password, create_access_token
from app.core.dependencies import get_current_instructor, get_current_customer
from app.models.instructor import Instructor
from app.models.customer import Customer
from typing import List

router = APIRouter()


# ===========================
# PUBLIC CUSTOMER AUTH (for subdomain sites)
# These endpoints are used by customers signing up/logging in on instructor's subdomain site
# ===========================


@router.post("/public/store/{subdomain}/signup", response_model=CustomerResponse, status_code=status.HTTP_201_CREATED)
async def customer_signup(
    subdomain: str,
    customer_in: CustomerCreate,
    db: AsyncSession = Depends(get_db),
):
    """
    Customer signup on instructor's subdomain site
    Creates a new customer account for the specific instructor
    """
    # Get instructor by subdomain
    instructor = await instructor_crud.get_instructor_by_subdomain(db, subdomain=subdomain)
    if not instructor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Store not found"
        )

    # Check if customer already exists for this instructor
    existing_customer = await customer_crud.get_customer_by_email_and_instructor(
        db, email=customer_in.email, instructor_id=instructor.id
    )
    if existing_customer:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered on this store",
        )

    # Create customer
    customer = await customer_crud.create_customer(
        db, customer_in=customer_in, instructor_id=instructor.id
    )
    return customer


@router.post("/public/store/{subdomain}/login", response_model=Token)
async def customer_login(
    subdomain: str,
    login_data: CustomerLoginRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Customer login on instructor's subdomain site
    Returns JWT token for accessing customer-specific resources
    """
    # Get instructor by subdomain
    instructor = await instructor_crud.get_instructor_by_subdomain(db, subdomain=subdomain)
    if not instructor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Store not found"
        )

    # Get customer
    customer = await customer_crud.get_customer_by_email_and_instructor(
        db, email=login_data.email, instructor_id=instructor.id
    )

    # Verify credentials
    if not customer or not verify_password(
        login_data.password, customer.hashed_password
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    # Check if customer is active
    if not customer.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated. Please contact the instructor.",
        )

    # Update last login
    await customer_crud.update_last_login(db, customer_id=customer.id)

    # Create access token with customer type
    access_token = create_access_token(
        data={
            "sub": customer.email,
            "user_type": "customer",
            "customer_id": customer.id,
            "instructor_id": instructor.id,
        }
    )

    return Token(access_token=access_token, token_type="bearer")


@router.get("/public/store/{subdomain}/me", response_model=CustomerResponse)
async def get_current_customer_profile(
    subdomain: str,
    current_customer: Customer = Depends(get_current_customer),
    db: AsyncSession = Depends(get_db),
):
    """Get current customer's profile"""
    return current_customer


# ===========================
# INSTRUCTOR CUSTOMER MANAGEMENT
# These endpoints are used by instructors to manage their customers
# ===========================


@router.get("/customers", response_model=List[CustomerListItem])
async def list_customers(
    skip: int = 0,
    limit: int = 100,
    search: str = None,
    is_active: bool = None,
    current_instructor: Instructor = Depends(get_current_instructor),
    db: AsyncSession = Depends(get_db),
):
    """
    List all customers for the current instructor
    Supports search and filtering
    """
    if search:
        customers = await customer_crud.search_customers(
            db,
            instructor_id=current_instructor.id,
            search_query=search,
            is_active=is_active,
            skip=skip,
            limit=limit,
        )
    else:
        customers = await customer_crud.list_customers_by_instructor(
            db, instructor_id=current_instructor.id, skip=skip, limit=limit
        )
    return customers


@router.get("/customers/{customer_id}", response_model=CustomerResponse)
async def get_customer(
    customer_id: str,
    current_instructor: Instructor = Depends(get_current_instructor),
    db: AsyncSession = Depends(get_db),
):
    """Get a specific customer's details"""
    customer = await customer_crud.get_customer(db, customer_id=customer_id)
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found"
        )

    # Verify customer belongs to this instructor
    if customer.instructor_id != current_instructor.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this customer",
        )

    return customer


@router.put("/customers/{customer_id}", response_model=CustomerResponse)
async def update_customer(
    customer_id: str,
    customer_update: CustomerUpdate,
    current_instructor: Instructor = Depends(get_current_instructor),
    db: AsyncSession = Depends(get_db),
):
    """Update customer information"""
    customer = await customer_crud.get_customer(db, customer_id=customer_id)
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found"
        )

    # Verify customer belongs to this instructor
    if customer.instructor_id != current_instructor.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to modify this customer",
        )

    updated_customer = await customer_crud.update_customer(
        db, customer_id=customer_id, customer_update=customer_update
    )
    return updated_customer


@router.delete("/customers/{customer_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_customer(
    customer_id: str,
    current_instructor: Instructor = Depends(get_current_instructor),
    db: AsyncSession = Depends(get_db),
):
    """Delete a customer"""
    customer = await customer_crud.get_customer(db, customer_id=customer_id)
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found"
        )

    # Verify customer belongs to this instructor
    if customer.instructor_id != current_instructor.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this customer",
        )

    await customer_crud.delete_customer(db, customer_id=customer_id)
    return None


@router.get("/customers/stats/summary")
async def get_customer_stats(
    current_instructor: Instructor = Depends(get_current_instructor),
    db: AsyncSession = Depends(get_db),
):
    """Get customer statistics for the instructor"""
    total_customers = await customer_crud.count_customers_by_instructor(
        db, instructor_id=current_instructor.id
    )

    return {
        "total_customers": total_customers,
        "instructor_id": current_instructor.id,
    }
