from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel, EmailStr
from app.core.database import get_db
from app.core.security import verify_password, create_access_token, get_password_hash
from app.core.dependencies import get_current_instructor
from app.schemas.auth import Token, LoginRequest
from app.schemas.user import UserCreate, UserResponse
from app.schemas.instructor import InstructorCreate, InstructorResponse, InstructorUpdate
from app.crud import user as user_crud
from app.crud import instructor as instructor_crud
from app.models.instructor import Instructor

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"/api/v1/auth/login")


@router.post("/auth/signup/user", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def signup_user(
    user_in: UserCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    사용자 회원가입
    """
    # Check if user already exists
    existing_user = await user_crud.get_user_by_email(db, email=user_in.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="이미 등록된 이메일입니다."
        )

    # Create new user
    user = await user_crud.create_user(db, user_in=user_in)
    return user


@router.post("/auth/signup/instructor", response_model=InstructorResponse, status_code=status.HTTP_201_CREATED)
async def signup_instructor(
    instructor_in: InstructorCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    강사 회원가입
    """
    # Check if email already exists
    existing_instructor = await instructor_crud.get_instructor_by_email(db, email=instructor_in.email)
    if existing_instructor:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="이미 등록된 이메일입니다."
        )

    # Check if subdomain already exists
    existing_subdomain = await instructor_crud.get_instructor_by_subdomain(db, subdomain=instructor_in.subdomain)
    if existing_subdomain:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="이미 사용 중인 서브도메인입니다."
        )

    # Create new instructor
    instructor = await instructor_crud.create_instructor(db, instructor_in=instructor_in)
    return instructor


@router.post("/auth/login/user", response_model=Token)
async def login_user(
    login_data: LoginRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    사용자 로그인
    """
    # Get user by email
    user = await user_crud.get_user_by_email(db, email=login_data.email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="이메일 또는 비밀번호가 올바르지 않습니다."
        )

    # Verify password
    if not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="이메일 또는 비밀번호가 올바르지 않습니다."
        )

    # Create access token
    access_token = create_access_token(subject=user.email)
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/auth/login/instructor", response_model=Token)
async def login_instructor(
    login_data: LoginRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    강사 로그인
    """
    # Get instructor by email
    instructor = await instructor_crud.get_instructor_by_email(db, email=login_data.email)
    if not instructor:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="이메일 또는 비밀번호가 올바르지 않습니다."
        )

    # Verify password
    if not verify_password(login_data.password, instructor.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="이메일 또는 비밀번호가 올바르지 않습니다."
        )

    # Create access token
    access_token = create_access_token(subject=instructor.email)
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/auth/me/instructor", response_model=InstructorResponse)
async def get_current_instructor_profile(
    current_instructor: Instructor = Depends(get_current_instructor)
):
    """
    Get current instructor profile (requires authentication)
    """
    return current_instructor


@router.put("/auth/me/instructor", response_model=InstructorResponse)
async def update_current_instructor_profile(
    instructor_update: InstructorUpdate,
    current_instructor: Instructor = Depends(get_current_instructor),
    db: AsyncSession = Depends(get_db)
):
    """
    Update current instructor profile (requires authentication)
    """
    # Check if email is being updated and already exists
    if instructor_update.email and instructor_update.email != current_instructor.email:
        existing_instructor = await instructor_crud.get_instructor_by_email(db, email=instructor_update.email)
        if existing_instructor:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="이미 등록된 이메일입니다."
            )

    # Check if subdomain is being updated and already exists
    if instructor_update.subdomain and instructor_update.subdomain != current_instructor.subdomain:
        existing_subdomain = await instructor_crud.get_instructor_by_subdomain(db, subdomain=instructor_update.subdomain)
        if existing_subdomain:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="이미 사용 중인 서브도메인입니다."
            )

    # Update instructor
    updated_instructor = await instructor_crud.update_instructor(db, current_instructor, instructor_update)
    return updated_instructor


# Pydantic models for password reset
class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    email: EmailStr
    new_password: str


@router.post("/auth/forgot-password")
async def forgot_password(
    request: ForgotPasswordRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    비밀번호 찾기 (간단한 버전 - 이메일 인증 없이)
    실제 프로덕션에서는 이메일 인증 토큰을 보내야 합니다
    """
    # Check if instructor exists
    instructor = await instructor_crud.get_instructor_by_email(db, email=request.email)

    # 보안상 이메일 존재 여부를 알려주지 않음
    # 항상 성공 메시지 반환
    return {
        "message": "이메일이 등록되어 있다면 비밀번호 재설정 안내를 발송했습니다.",
        "email": request.email
    }


@router.post("/auth/reset-password")
async def reset_password(
    request: ResetPasswordRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    비밀번호 재설정 (간단한 버전)
    실제 프로덕션에서는 토큰 검증이 필요합니다
    """
    # Check if instructor exists
    instructor = await instructor_crud.get_instructor_by_email(db, email=request.email)

    if not instructor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="해당 이메일로 등록된 계정을 찾을 수 없습니다."
        )

    # Update password
    instructor.hashed_password = get_password_hash(request.new_password)
    db.add(instructor)
    await db.commit()

    return {
        "message": "비밀번호가 성공적으로 변경되었습니다."
    }
