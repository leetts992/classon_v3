from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from jose import jwt, JWTError
from app.core.config import settings
from app.core.database import get_db
from app.crud import instructor as instructor_crud, user as user_crud, customer as customer_crud
from app.models.instructor import Instructor
from app.models.user import User
from app.models.customer import Customer
from typing import Optional

security = HTTPBearer()


async def get_current_user_email(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> str:
    """Extract and validate JWT token, return user email"""
    try:
        token = credentials.credentials
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
            )
        return email
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
        )


async def get_current_instructor(
    email: str = Depends(get_current_user_email),
    db: AsyncSession = Depends(get_db)
) -> Instructor:
    """Get current authenticated instructor"""
    instructor = await instructor_crud.get_instructor_by_email(db, email=email)
    if not instructor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Instructor not found"
        )
    if not instructor.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive instructor"
        )
    return instructor


async def get_current_user(
    email: str = Depends(get_current_user_email),
    db: AsyncSession = Depends(get_db)
) -> User:
    """Get current authenticated user"""
    user = await user_crud.get_user_by_email(db, email=email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user"
        )
    return user


async def get_current_active_instructor(
    current_instructor: Instructor = Depends(get_current_instructor)
) -> Instructor:
    """Get current active instructor (additional check)"""
    if not current_instructor.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive instructor"
        )
    return current_instructor


async def get_current_customer(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db)
) -> Customer:
    """Get current authenticated customer"""
    try:
        token = credentials.credentials
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )

        # Check if this is a customer token
        user_type = payload.get("user_type")
        if user_type != "customer":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token type",
            )

        customer_id = payload.get("customer_id")
        if not customer_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
            )

        customer = await customer_crud.get_customer(db, customer_id=customer_id)
        if not customer:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Customer not found"
            )

        if not customer.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Inactive customer account"
            )

        return customer

    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
        )
