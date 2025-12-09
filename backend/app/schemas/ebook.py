from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import datetime


# Chapter Schemas
class EbookChapterBase(BaseModel):
    title: str
    description: Optional[str] = None
    order_index: int = 0
    is_published: bool = True


class EbookChapterCreate(EbookChapterBase):
    product_id: str


class EbookChapterUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    order_index: Optional[int] = None
    is_published: Optional[bool] = None


class EbookChapterResponse(EbookChapterBase):
    id: str
    product_id: str
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


# Section Schemas
class EbookSectionBase(BaseModel):
    title: str
    content: Optional[Any] = None  # Tiptap JSON
    content_html: Optional[str] = None
    order_index: int = 0
    reading_time: Optional[int] = None
    is_published: bool = True
    is_free: bool = False


class EbookSectionCreate(EbookSectionBase):
    chapter_id: str


class EbookSectionUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[Any] = None
    content_html: Optional[str] = None
    order_index: Optional[int] = None
    reading_time: Optional[int] = None
    is_published: Optional[bool] = None
    is_free: Optional[bool] = None


class EbookSectionResponse(EbookSectionBase):
    id: str
    chapter_id: str
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


# Chapter with Sections
class EbookChapterWithSections(EbookChapterResponse):
    sections: List[EbookSectionResponse] = []


# Progress Schemas
class UserEbookProgressBase(BaseModel):
    is_completed: bool = False
    reading_progress: int = 0


class UserEbookProgressCreate(UserEbookProgressBase):
    section_id: str


class UserEbookProgressUpdate(BaseModel):
    is_completed: Optional[bool] = None
    reading_progress: Optional[int] = None


class UserEbookProgressResponse(UserEbookProgressBase):
    id: str
    customer_id: str
    section_id: str
    last_read_at: datetime
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


# Bookmark Schemas
class UserEbookBookmarkBase(BaseModel):
    note: Optional[str] = None
    position: Optional[int] = None


class UserEbookBookmarkCreate(UserEbookBookmarkBase):
    section_id: str


class UserEbookBookmarkUpdate(BaseModel):
    note: Optional[str] = None
    position: Optional[int] = None


class UserEbookBookmarkResponse(UserEbookBookmarkBase):
    id: str
    customer_id: str
    section_id: str
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


# Ebook Structure (for viewer)
class EbookStructureResponse(BaseModel):
    product_id: str
    product_title: str
    chapters: List[EbookChapterWithSections]
