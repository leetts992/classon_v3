from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func
from sqlalchemy.orm import selectinload
from typing import List
from app.core.database import get_db
from app.core.security import get_current_instructor, get_current_customer
from app.models.instructor import Instructor
from app.models.customer import Customer
from app.models.ebook import EbookChapter, EbookSection, UserEbookProgress, UserEbookBookmark
from app.models.product import Product
from app.models.order import Order, OrderStatus
from app.schemas.ebook import (
    EbookChapterCreate,
    EbookChapterUpdate,
    EbookChapterResponse,
    EbookChapterWithSections,
    EbookSectionCreate,
    EbookSectionUpdate,
    EbookSectionResponse,
    EbookStructureResponse,
    UserEbookProgressCreate,
    UserEbookProgressUpdate,
    UserEbookProgressResponse,
    UserEbookBookmarkCreate,
    UserEbookBookmarkUpdate,
    UserEbookBookmarkResponse,
)
import uuid

router = APIRouter()


# ========== 강사용 API (챕터/섹션 관리) ==========

@router.post("/instructor/chapters", response_model=EbookChapterResponse)
async def create_chapter(
    chapter: EbookChapterCreate,
    db: AsyncSession = Depends(get_db),
    current_instructor: Instructor = Depends(get_current_instructor),
):
    """챕터 생성"""
    # 상품이 현재 강사의 것인지 확인
    result = await db.execute(
        select(Product).where(
            and_(
                Product.id == chapter.product_id,
                Product.instructor_id == current_instructor.id
            )
        )
    )
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found or not owned by instructor"
        )

    # 챕터 생성
    db_chapter = EbookChapter(
        id=str(uuid.uuid4()),
        **chapter.model_dump()
    )
    db.add(db_chapter)
    await db.commit()
    await db.refresh(db_chapter)
    return db_chapter


@router.get("/instructor/products/{product_id}/chapters", response_model=List[EbookChapterWithSections])
async def get_product_chapters(
    product_id: str,
    db: AsyncSession = Depends(get_db),
    current_instructor: Instructor = Depends(get_current_instructor),
):
    """상품의 모든 챕터 및 섹션 조회 (강사용)"""
    # 상품이 현재 강사의 것인지 확인
    result = await db.execute(
        select(Product).where(
            and_(
                Product.id == product_id,
                Product.instructor_id == current_instructor.id
            )
        )
    )
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found or not owned by instructor"
        )

    # 챕터 및 섹션 조회
    result = await db.execute(
        select(EbookChapter)
        .where(EbookChapter.product_id == product_id)
        .options(selectinload(EbookChapter.sections))
        .order_by(EbookChapter.order_index)
    )
    chapters = result.scalars().all()
    return chapters


@router.put("/instructor/chapters/{chapter_id}", response_model=EbookChapterResponse)
async def update_chapter(
    chapter_id: str,
    chapter_update: EbookChapterUpdate,
    db: AsyncSession = Depends(get_db),
    current_instructor: Instructor = Depends(get_current_instructor),
):
    """챕터 수정"""
    # 챕터 조회 및 권한 확인
    result = await db.execute(
        select(EbookChapter)
        .join(Product)
        .where(
            and_(
                EbookChapter.id == chapter_id,
                Product.instructor_id == current_instructor.id
            )
        )
    )
    db_chapter = result.scalar_one_or_none()
    if not db_chapter:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chapter not found"
        )

    # 업데이트
    for key, value in chapter_update.model_dump(exclude_unset=True).items():
        setattr(db_chapter, key, value)

    await db.commit()
    await db.refresh(db_chapter)
    return db_chapter


@router.delete("/instructor/chapters/{chapter_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_chapter(
    chapter_id: str,
    db: AsyncSession = Depends(get_db),
    current_instructor: Instructor = Depends(get_current_instructor),
):
    """챕터 삭제"""
    result = await db.execute(
        select(EbookChapter)
        .join(Product)
        .where(
            and_(
                EbookChapter.id == chapter_id,
                Product.instructor_id == current_instructor.id
            )
        )
    )
    db_chapter = result.scalar_one_or_none()
    if not db_chapter:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chapter not found"
        )

    await db.delete(db_chapter)
    await db.commit()


@router.post("/instructor/sections", response_model=EbookSectionResponse)
async def create_section(
    section: EbookSectionCreate,
    db: AsyncSession = Depends(get_db),
    current_instructor: Instructor = Depends(get_current_instructor),
):
    """섹션 생성"""
    # 챕터가 현재 강사의 것인지 확인
    result = await db.execute(
        select(EbookChapter)
        .join(Product)
        .where(
            and_(
                EbookChapter.id == section.chapter_id,
                Product.instructor_id == current_instructor.id
            )
        )
    )
    chapter = result.scalar_one_or_none()
    if not chapter:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chapter not found"
        )

    # 섹션 생성
    db_section = EbookSection(
        id=str(uuid.uuid4()),
        **section.model_dump()
    )
    db.add(db_section)
    await db.commit()
    await db.refresh(db_section)
    return db_section


@router.put("/instructor/sections/{section_id}", response_model=EbookSectionResponse)
async def update_section(
    section_id: str,
    section_update: EbookSectionUpdate,
    db: AsyncSession = Depends(get_db),
    current_instructor: Instructor = Depends(get_current_instructor),
):
    """섹션 수정"""
    # 섹션 조회 및 권한 확인
    result = await db.execute(
        select(EbookSection)
        .join(EbookChapter)
        .join(Product)
        .where(
            and_(
                EbookSection.id == section_id,
                Product.instructor_id == current_instructor.id
            )
        )
    )
    db_section = result.scalar_one_or_none()
    if not db_section:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Section not found"
        )

    # 업데이트
    for key, value in section_update.model_dump(exclude_unset=True).items():
        setattr(db_section, key, value)

    await db.commit()
    await db.refresh(db_section)
    return db_section


@router.delete("/instructor/sections/{section_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_section(
    section_id: str,
    db: AsyncSession = Depends(get_db),
    current_instructor: Instructor = Depends(get_current_instructor),
):
    """섹션 삭제"""
    result = await db.execute(
        select(EbookSection)
        .join(EbookChapter)
        .join(Product)
        .where(
            and_(
                EbookSection.id == section_id,
                Product.instructor_id == current_instructor.id
            )
        )
    )
    db_section = result.scalar_one_or_none()
    if not db_section:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Section not found"
        )

    await db.delete(db_section)
    await db.commit()


# ========== 학습자용 API (전자책 뷰어) ==========

@router.get("/customer/products/{product_id}/structure", response_model=EbookStructureResponse)
async def get_ebook_structure(
    product_id: str,
    db: AsyncSession = Depends(get_db),
    current_customer: Customer = Depends(get_current_customer),
):
    """전자책 구조 조회 (학습자용 - 구매 확인 포함)"""
    # 상품 조회
    result = await db.execute(select(Product).where(Product.id == product_id))
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    # 구매 확인
    result = await db.execute(
        select(Order).where(
            and_(
                Order.customer_id == current_customer.id,
                Order.product_id == product_id,
                Order.status == OrderStatus.COMPLETED
            )
        )
    )
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You need to purchase this product first"
        )

    # 챕터 및 섹션 조회 (공개된 것만)
    result = await db.execute(
        select(EbookChapter)
        .where(
            and_(
                EbookChapter.product_id == product_id,
                EbookChapter.is_published == True
            )
        )
        .options(selectinload(EbookChapter.sections))
        .order_by(EbookChapter.order_index)
    )
    chapters = result.scalars().all()

    # 공개된 섹션만 필터링
    for chapter in chapters:
        chapter.sections = [s for s in chapter.sections if s.is_published]

    return {
        "product_id": product.id,
        "product_title": product.title,
        "chapters": chapters,
    }


@router.get("/customer/sections/{section_id}", response_model=EbookSectionResponse)
async def get_section_content(
    section_id: str,
    db: AsyncSession = Depends(get_db),
    current_customer: Customer = Depends(get_current_customer),
):
    """섹션 콘텐츠 조회 (학습자용 - 구매 확인 포함)"""
    # 섹션 조회
    result = await db.execute(
        select(EbookSection)
        .join(EbookChapter)
        .join(Product)
        .where(EbookSection.id == section_id)
    )
    section = result.scalar_one_or_none()
    if not section:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Section not found")

    # 무료 미리보기가 아닌 경우 구매 확인
    if not section.is_free:
        result = await db.execute(
            select(Order).where(
                and_(
                    Order.customer_id == current_customer.id,
                    Order.product_id == section.chapter.product_id,
                    Order.status == OrderStatus.COMPLETED
                )
            )
        )
        order = result.scalar_one_or_none()
        if not order:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You need to purchase this product first"
            )

    return section


@router.post("/customer/progress", response_model=UserEbookProgressResponse)
async def update_progress(
    progress: UserEbookProgressCreate,
    db: AsyncSession = Depends(get_db),
    current_customer: Customer = Depends(get_current_customer),
):
    """학습 진행률 업데이트"""
    # 기존 진행률 조회
    result = await db.execute(
        select(UserEbookProgress).where(
            and_(
                UserEbookProgress.customer_id == current_customer.id,
                UserEbookProgress.section_id == progress.section_id
            )
        )
    )
    db_progress = result.scalar_one_or_none()

    if db_progress:
        # 업데이트
        db_progress.is_completed = progress.is_completed
        db_progress.reading_progress = progress.reading_progress
        db_progress.last_read_at = func.now()
    else:
        # 새로 생성
        db_progress = UserEbookProgress(
            id=str(uuid.uuid4()),
            customer_id=current_customer.id,
            **progress.model_dump()
        )
        db.add(db_progress)

    await db.commit()
    await db.refresh(db_progress)
    return db_progress


@router.get("/customer/products/{product_id}/progress", response_model=List[UserEbookProgressResponse])
async def get_product_progress(
    product_id: str,
    db: AsyncSession = Depends(get_db),
    current_customer: Customer = Depends(get_current_customer),
):
    """상품의 전체 진행률 조회"""
    result = await db.execute(
        select(UserEbookProgress)
        .join(EbookSection)
        .join(EbookChapter)
        .where(
            and_(
                UserEbookProgress.customer_id == current_customer.id,
                EbookChapter.product_id == product_id
            )
        )
    )
    progress_list = result.scalars().all()
    return progress_list


@router.post("/customer/bookmarks", response_model=UserEbookBookmarkResponse)
async def create_bookmark(
    bookmark: UserEbookBookmarkCreate,
    db: AsyncSession = Depends(get_db),
    current_customer: Customer = Depends(get_current_customer),
):
    """북마크 생성"""
    db_bookmark = UserEbookBookmark(
        id=str(uuid.uuid4()),
        customer_id=current_customer.id,
        **bookmark.model_dump()
    )
    db.add(db_bookmark)
    await db.commit()
    await db.refresh(db_bookmark)
    return db_bookmark


@router.get("/customer/products/{product_id}/bookmarks", response_model=List[UserEbookBookmarkResponse])
async def get_product_bookmarks(
    product_id: str,
    db: AsyncSession = Depends(get_db),
    current_customer: Customer = Depends(get_current_customer),
):
    """상품의 모든 북마크 조회"""
    result = await db.execute(
        select(UserEbookBookmark)
        .join(EbookSection)
        .join(EbookChapter)
        .where(
            and_(
                UserEbookBookmark.customer_id == current_customer.id,
                EbookChapter.product_id == product_id
            )
        )
    )
    bookmarks = result.scalars().all()
    return bookmarks


@router.delete("/customer/bookmarks/{bookmark_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_bookmark(
    bookmark_id: str,
    db: AsyncSession = Depends(get_db),
    current_customer: Customer = Depends(get_current_customer),
):
    """북마크 삭제"""
    result = await db.execute(
        select(UserEbookBookmark).where(
            and_(
                UserEbookBookmark.id == bookmark_id,
                UserEbookBookmark.customer_id == current_customer.id
            )
        )
    )
    bookmark = result.scalar_one_or_none()
    if not bookmark:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bookmark not found")

    await db.delete(bookmark)
    await db.commit()
