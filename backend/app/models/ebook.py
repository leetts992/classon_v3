from sqlalchemy import Column, String, Integer, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import JSON
from app.core.database import Base
import uuid


class EbookChapter(Base):
    """전자책 챕터 (장)"""
    __tablename__ = "ebook_chapters"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    product_id = Column(String, ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)  # 챕터 설명
    order_index = Column(Integer, nullable=False, default=0)  # 정렬 순서
    is_published = Column(Boolean, default=True)  # 공개 여부

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    sections = relationship("EbookSection", back_populates="chapter", cascade="all, delete-orphan", order_by="EbookSection.order_index")


class EbookSection(Base):
    """전자책 섹션 (절/레슨)"""
    __tablename__ = "ebook_sections"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    chapter_id = Column(String, ForeignKey("ebook_chapters.id", ondelete="CASCADE"), nullable=False)
    title = Column(String, nullable=False)
    content = Column(JSON, nullable=True)  # Tiptap JSON 형식 콘텐츠
    content_html = Column(Text, nullable=True)  # 렌더링된 HTML (검색/미리보기용)
    order_index = Column(Integer, nullable=False, default=0)  # 정렬 순서
    reading_time = Column(Integer, nullable=True)  # 예상 읽기 시간 (분)
    is_published = Column(Boolean, default=True)  # 공개 여부
    is_free = Column(Boolean, default=False)  # 무료 미리보기 여부

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    chapter = relationship("EbookChapter", back_populates="sections")
    progress = relationship("UserEbookProgress", back_populates="section", cascade="all, delete-orphan")


class UserEbookProgress(Base):
    """사용자 전자책 학습 진행률"""
    __tablename__ = "user_ebook_progress"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    customer_id = Column(String, ForeignKey("customers.id", ondelete="CASCADE"), nullable=False)
    section_id = Column(String, ForeignKey("ebook_sections.id", ondelete="CASCADE"), nullable=False)
    is_completed = Column(Boolean, default=False)  # 완료 여부
    last_read_at = Column(DateTime(timezone=True), server_default=func.now())  # 마지막 읽은 시간
    reading_progress = Column(Integer, default=0)  # 스크롤 진행률 (0-100)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    section = relationship("EbookSection", back_populates="progress")


class UserEbookBookmark(Base):
    """사용자 전자책 북마크"""
    __tablename__ = "user_ebook_bookmarks"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    customer_id = Column(String, ForeignKey("customers.id", ondelete="CASCADE"), nullable=False)
    section_id = Column(String, ForeignKey("ebook_sections.id", ondelete="CASCADE"), nullable=False)
    note = Column(Text, nullable=True)  # 북마크 메모
    position = Column(Integer, nullable=True)  # 북마크 위치 (스크롤 위치 등)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
