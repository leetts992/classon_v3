from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional

from app.core.database import get_db
from app.core.dependencies import get_current_instructor, get_current_user
from app.models.instructor import Instructor
from app.models.user import User
from app.models.order import OrderStatus
from app.schemas.order import OrderCreate, OrderUpdate, OrderResponse
from app.crud import order as order_crud, product as product_crud

router = APIRouter()


@router.post("/orders", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
async def create_order(
    order_in: OrderCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new order (User only)

    Users can purchase products by creating orders
    """
    # Verify product exists
    product = await product_crud.get_product(db, product_id=order_in.product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )

    # Create order
    order = await order_crud.create_order(
        db,
        order_in=order_in,
        user_id=current_user.id,
        instructor_id=product.instructor_id
    )

    return order


@router.get("/orders/my", response_model=List[OrderResponse])
async def list_my_orders(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    List all orders for current user

    Users can view their order history
    """
    orders = await order_crud.get_orders_by_user(
        db,
        user_id=current_user.id,
        skip=skip,
        limit=limit
    )
    return orders


@router.get("/orders/instructor", response_model=List[OrderResponse])
async def list_instructor_orders(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    status_filter: Optional[OrderStatus] = Query(None, alias="status"),
    current_instructor: Instructor = Depends(get_current_instructor),
    db: AsyncSession = Depends(get_db)
):
    """
    List all orders for current instructor's products

    Instructors can view orders for their products
    """
    orders = await order_crud.get_orders_by_instructor(
        db,
        instructor_id=current_instructor.id,
        skip=skip,
        limit=limit,
        status=status_filter
    )
    return orders


@router.get("/orders/{order_id}", response_model=OrderResponse)
async def get_order(
    order_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get a specific order

    Users can only view their own orders
    """
    order = await order_crud.get_order(db, order_id=order_id)
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )

    # Verify ownership
    if order.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this order"
        )

    return order


@router.get("/orders/instructor/{order_id}", response_model=OrderResponse)
async def get_instructor_order(
    order_id: str,
    current_instructor: Instructor = Depends(get_current_instructor),
    db: AsyncSession = Depends(get_db)
):
    """
    Get a specific order (Instructor view)

    Instructors can only view orders for their products
    """
    order = await order_crud.get_order(db, order_id=order_id)
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )

    # Verify instructor owns the product
    if order.instructor_id != current_instructor.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this order"
        )

    return order


@router.put("/orders/{order_id}", response_model=OrderResponse)
async def update_order(
    order_id: str,
    order_update: OrderUpdate,
    current_instructor: Instructor = Depends(get_current_instructor),
    db: AsyncSession = Depends(get_db)
):
    """
    Update an order (Instructor only)

    Instructors can update order status (e.g., mark as paid, refunded)
    """
    existing_order = await order_crud.get_order(db, order_id=order_id)
    if not existing_order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )

    # Verify instructor owns the product
    if existing_order.instructor_id != current_instructor.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this order"
        )

    updated_order = await order_crud.update_order(db, order_id=order_id, order_update=order_update)
    return updated_order


@router.delete("/orders/{order_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_order(
    order_id: str,
    current_instructor: Instructor = Depends(get_current_instructor),
    db: AsyncSession = Depends(get_db)
):
    """
    Delete an order (Instructor only)

    Instructors can delete orders for their products
    """
    existing_order = await order_crud.get_order(db, order_id=order_id)
    if not existing_order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )

    # Verify instructor owns the product
    if existing_order.instructor_id != current_instructor.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this order"
        )

    await order_crud.delete_order(db, order_id=order_id)
    return None


@router.get("/orders/stats/summary")
async def get_order_stats(
    current_instructor: Instructor = Depends(get_current_instructor),
    db: AsyncSession = Depends(get_db)
):
    """
    Get order statistics for current instructor

    Returns total orders, total revenue, and orders by status
    """
    total_orders = await order_crud.count_orders_by_instructor(db, instructor_id=current_instructor.id)
    total_revenue = await order_crud.get_total_revenue_by_instructor(db, instructor_id=current_instructor.id)

    # Count by status
    pending_count = await order_crud.count_orders_by_instructor(
        db, instructor_id=current_instructor.id, status=OrderStatus.PENDING
    )
    paid_count = await order_crud.count_orders_by_instructor(
        db, instructor_id=current_instructor.id, status=OrderStatus.PAID
    )
    cancelled_count = await order_crud.count_orders_by_instructor(
        db, instructor_id=current_instructor.id, status=OrderStatus.CANCELLED
    )
    refunded_count = await order_crud.count_orders_by_instructor(
        db, instructor_id=current_instructor.id, status=OrderStatus.REFUNDED
    )

    return {
        "instructor_id": current_instructor.id,
        "total_orders": total_orders,
        "total_revenue": total_revenue,
        "orders_by_status": {
            "PENDING": pending_count,
            "PAID": paid_count,
            "CANCELLED": cancelled_count,
            "REFUNDED": refunded_count,
        }
    }
