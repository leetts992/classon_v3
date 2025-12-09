-- 전자책 챕터 테이블
CREATE TABLE IF NOT EXISTS ebook_chapters (
    id VARCHAR PRIMARY KEY,
    product_id VARCHAR NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    title VARCHAR NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL DEFAULT 0,
    is_published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE
);

-- 전자책 섹션 테이블
CREATE TABLE IF NOT EXISTS ebook_sections (
    id VARCHAR PRIMARY KEY,
    chapter_id VARCHAR NOT NULL REFERENCES ebook_chapters(id) ON DELETE CASCADE,
    title VARCHAR NOT NULL,
    content JSON,  -- Tiptap JSON 형식
    content_html TEXT,  -- 렌더링된 HTML
    order_index INTEGER NOT NULL DEFAULT 0,
    reading_time INTEGER,  -- 예상 읽기 시간 (분)
    is_published BOOLEAN DEFAULT TRUE,
    is_free BOOLEAN DEFAULT FALSE,  -- 무료 미리보기
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE
);

-- 사용자 전자책 진행률 테이블
CREATE TABLE IF NOT EXISTS user_ebook_progress (
    id VARCHAR PRIMARY KEY,
    customer_id VARCHAR NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    section_id VARCHAR NOT NULL REFERENCES ebook_sections(id) ON DELETE CASCADE,
    is_completed BOOLEAN DEFAULT FALSE,
    last_read_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    reading_progress INTEGER DEFAULT 0,  -- 0-100
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(customer_id, section_id)  -- 한 사용자당 한 섹션당 하나의 진행률
);

-- 사용자 전자책 북마크 테이블
CREATE TABLE IF NOT EXISTS user_ebook_bookmarks (
    id VARCHAR PRIMARY KEY,
    customer_id VARCHAR NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    section_id VARCHAR NOT NULL REFERENCES ebook_sections(id) ON DELETE CASCADE,
    note TEXT,
    position INTEGER,  -- 북마크 위치
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_ebook_chapters_product_id ON ebook_chapters(product_id);
CREATE INDEX IF NOT EXISTS idx_ebook_chapters_order ON ebook_chapters(order_index);
CREATE INDEX IF NOT EXISTS idx_ebook_sections_chapter_id ON ebook_sections(chapter_id);
CREATE INDEX IF NOT EXISTS idx_ebook_sections_order ON ebook_sections(order_index);
CREATE INDEX IF NOT EXISTS idx_user_progress_customer_id ON user_ebook_progress(customer_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_section_id ON user_ebook_progress(section_id);
CREATE INDEX IF NOT EXISTS idx_user_bookmarks_customer_id ON user_ebook_bookmarks(customer_id);
CREATE INDEX IF NOT EXISTS idx_user_bookmarks_section_id ON user_ebook_bookmarks(section_id);
