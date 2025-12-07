from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.models.instructor import Instructor
from app.models.customer import Customer
from app.core.security import create_access_token
import httpx
import urllib.parse
from typing import Optional
import secrets

router = APIRouter()


@router.get("/kakao/login/{subdomain}")
async def kakao_login(
    subdomain: str,
    redirect_uri: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """
    Initiate Kakao OAuth login flow for a specific instructor's store
    Returns the Kakao OAuth authorization URL
    """
    # Get instructor's Kakao settings
    result = await db.execute(
        select(Instructor).where(Instructor.subdomain == subdomain)
    )
    instructor = result.scalar_one_or_none()

    if not instructor:
        raise HTTPException(status_code=404, detail="스토어를 찾을 수 없습니다")

    if not instructor.kakao_enabled or not instructor.kakao_client_id:
        raise HTTPException(status_code=400, detail="카카오 로그인이 활성화되지 않았습니다")

    # Generate state token for CSRF protection
    state = secrets.token_urlsafe(32)

    # Use dynamic redirect_uri from frontend, fallback to DB value
    actual_redirect_uri = redirect_uri or instructor.kakao_redirect_uri

    # Build Kakao OAuth URL
    kakao_auth_url = "https://kauth.kakao.com/oauth/authorize"
    params = {
        "client_id": instructor.kakao_client_id,
        "redirect_uri": actual_redirect_uri,
        "response_type": "code",
        "state": state,
    }

    authorization_url = f"{kakao_auth_url}?{urllib.parse.urlencode(params)}"

    return {
        "authorization_url": authorization_url,
        "state": state,
        "redirect_uri": actual_redirect_uri
    }


@router.get("/kakao/callback")
async def kakao_callback(
    code: str = Query(...),
    state: str = Query(...),
    subdomain: str = Query(...),
    redirect_uri: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """
    Handle Kakao OAuth callback
    Exchange authorization code for access token and create/login customer
    """
    # Get instructor's Kakao settings
    result = await db.execute(
        select(Instructor).where(Instructor.subdomain == subdomain)
    )
    instructor = result.scalar_one_or_none()

    if not instructor:
        raise HTTPException(status_code=404, detail="스토어를 찾을 수 없습니다")

    if not instructor.kakao_enabled or not instructor.kakao_client_id or not instructor.kakao_client_secret:
        raise HTTPException(status_code=400, detail="카카오 로그인이 설정되지 않았습니다")

    # Use dynamic redirect_uri from frontend, fallback to DB value
    actual_redirect_uri = redirect_uri or instructor.kakao_redirect_uri

    # Exchange code for access token
    token_url = "https://kauth.kakao.com/oauth/token"
    token_data = {
        "grant_type": "authorization_code",
        "client_id": instructor.kakao_client_id,
        "client_secret": instructor.kakao_client_secret,
        "redirect_uri": actual_redirect_uri,
        "code": code,
    }

    async with httpx.AsyncClient() as client:
        # Get access token
        token_response = await client.post(token_url, data=token_data)

        if token_response.status_code != 200:
            raise HTTPException(
                status_code=400,
                detail=f"카카오 토큰 요청 실패: {token_response.text}"
            )

        token_json = token_response.json()
        access_token = token_json.get("access_token")

        # Get user info from Kakao
        user_info_url = "https://kapi.kakao.com/v2/user/me"
        headers = {"Authorization": f"Bearer {access_token}"}

        user_response = await client.get(user_info_url, headers=headers)

        if user_response.status_code != 200:
            raise HTTPException(
                status_code=400,
                detail=f"카카오 사용자 정보 요청 실패: {user_response.text}"
            )

        user_info = user_response.json()

    # Extract user information
    kakao_id = str(user_info.get("id"))
    kakao_account = user_info.get("kakao_account", {})
    profile = kakao_account.get("profile", {})

    email = kakao_account.get("email")
    name = profile.get("nickname", "")
    phone = kakao_account.get("phone_number")

    # Check if customer already exists
    result = await db.execute(
        select(Customer).where(
            Customer.instructor_id == instructor.id,
            Customer.kakao_id == kakao_id
        )
    )
    customer = result.scalar_one_or_none()

    if not customer:
        # Create new customer
        customer = Customer(
            instructor_id=instructor.id,
            email=email or f"kakao_{kakao_id}@kakao.user",
            full_name=name,
            phone=phone,
            kakao_id=kakao_id,
            is_active=True
        )
        db.add(customer)
        await db.commit()
        await db.refresh(customer)
    else:
        # Update existing customer info
        if email:
            customer.email = email
        if name:
            customer.full_name = name
        if phone:
            customer.phone = phone
        await db.commit()
        await db.refresh(customer)

    # Create JWT token for the customer
    jwt_token = create_access_token(subject=customer.id)

    return {
        "access_token": jwt_token,
        "token_type": "bearer",
        "customer": {
            "id": customer.id,
            "email": customer.email,
            "full_name": customer.full_name,
            "phone": customer.phone
        }
    }
