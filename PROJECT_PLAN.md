# 🎓 Class-On 프로젝트 구현 계획서

> 전자책/동영상 강의 판매 플랫폼 - 서브도메인 기반 멀티테넌트 SaaS

**메인 도메인**: class-on.kr
**서브도메인**: {instructor}.class-on.kr

---

## 📚 목차
1. [기술 스택](#기술-스택)
2. [프로젝트 구조](#프로젝트-구조)
3. [데이터베이스 설계](#데이터베이스-설계)
4. [구현 단계별 계획](#구현-단계별-계획)
5. [주요 기능 명세](#주요-기능-명세)
6. [API 엔드포인트 설계](#api-엔드포인트-설계)
7. [인프라 구성](#인프라-구성)
8. [보안 및 인증](#보안-및-인증)
9. [개발 일정](#개발-일정)

---

## 🛠 기술 스택

### Backend
- **FastAPI 0.104+** - 비동기 웹 프레임워크
- **Python 3.11+** - 최신 성능 개선 활용
- **SQLAlchemy 2.0** - 비동기 ORM
- **Alembic** - 데이터베이스 마이그레이션
- **Pydantic V2** - 데이터 검증
- **asyncpg** - PostgreSQL 비동기 드라이버

### Frontend
- **Next.js 14** - App Router (React 18)
- **TypeScript 5** - 타입 안정성
- **TailwindCSS** - 유틸리티 CSS
- **Shadcn/ui** - 재사용 UI 컴포넌트
- **React Query (TanStack Query)** - 서버 상태 관리
- **Zustand** - 클라이언트 상태 관리

### Database & Cache
- **PostgreSQL 15** - 메인 데이터베이스
- **Redis 7** - 캐싱, 세션, Celery 브로커

### Storage & CDN
- **AWS S3** - 파일 스토리지 (전자책, 동영상)
- **AWS CloudFront** - CDN (동영상 스트리밍)

### Infrastructure
- **Docker & Docker Compose** - 컨테이너화
- **Nginx** - 리버스 프록시, 서브도메인 라우팅
- **GitHub Actions** - CI/CD
- **AWS EC2 / Render** - 백엔드 배포
- **Vercel** - 프론트엔드 배포

### 추가 도구
- **Celery** - 비동기 작업 (동영상 인코딩, 이메일)
- **FFmpeg** - 동영상 처리
- **Boto3** - AWS SDK
- **pytest** - 테스트
- **Sentry** - 에러 추적

---

## 📁 프로젝트 구조

```
classon/
├── backend/                          # FastAPI 백엔드
│   ├── app/
│   │   ├── main.py                  # FastAPI 앱 진입점
│   │   ├── api/
│   │   │   └── v1/
│   │   │       ├── __init__.py
│   │   │       ├── auth.py          # 인증 (회원가입, 로그인)
│   │   │       ├── instructors.py   # 강사 관리
│   │   │       ├── products.py      # 상품 CRUD
│   │   │       ├── orders.py        # 주문 및 결제
│   │   │       ├── store.py         # 스토어 설정
│   │   │       ├── users.py         # 사용자 관리
│   │   │       └── upload.py        # 파일 업로드
│   │   ├── core/
│   │   │   ├── config.py           # 환경 설정
│   │   │   ├── security.py         # JWT, 비밀번호 해싱
│   │   │   ├── deps.py             # 의존성 주입
│   │   │   └── database.py         # DB 연결
│   │   ├── models/                 # SQLAlchemy 모델
│   │   │   ├── __init__.py
│   │   │   ├── instructor.py
│   │   │   ├── product.py
│   │   │   ├── user.py
│   │   │   ├── order.py
│   │   │   ├── store_config.py
│   │   │   └── cart.py
│   │   ├── schemas/                # Pydantic 스키마
│   │   │   ├── __init__.py
│   │   │   ├── instructor.py
│   │   │   ├── product.py
│   │   │   ├── user.py
│   │   │   ├── order.py
│   │   │   └── store.py
│   │   ├── crud/                   # DB CRUD 작업
│   │   │   ├── __init__.py
│   │   │   ├── base.py
│   │   │   ├── instructor.py
│   │   │   ├── product.py
│   │   │   ├── user.py
│   │   │   └── order.py
│   │   ├── services/               # 비즈니스 로직
│   │   │   ├── __init__.py
│   │   │   ├── storage.py         # S3 파일 업로드
│   │   │   ├── payment.py         # 결제 연동 (아임포트/토스)
│   │   │   ├── email.py           # 이메일 발송
│   │   │   └── video.py           # 동영상 처리
│   │   ├── utils/
│   │   │   ├── __init__.py
│   │   │   └── helpers.py
│   │   └── tasks/                 # Celery 작업
│   │       ├── __init__.py
│   │       ├── video_encode.py
│   │       └── email_tasks.py
│   ├── alembic/                    # 마이그레이션
│   │   ├── versions/
│   │   └── env.py
│   ├── tests/
│   │   ├── conftest.py
│   │   ├── test_auth.py
│   │   ├── test_products.py
│   │   └── test_orders.py
│   ├── .env.example
│   ├── requirements.txt
│   ├── Dockerfile
│   └── pyproject.toml
│
├── frontend/                        # Next.js 프론트엔드
│   ├── app/
│   │   ├── (platform)/             # 메인 플랫폼 (class-on.kr)
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx            # 랜딩 페이지
│   │   │   ├── login/
│   │   │   ├── signup/
│   │   │   └── dashboard/          # 강사 대시보드
│   │   │       ├── page.tsx        # 대시보드 홈
│   │   │       ├── products/       # 상품 관리
│   │   │       ├── orders/         # 주문 관리
│   │   │       ├── settings/       # 스토어 설정
│   │   │       └── analytics/      # 매출 분석
│   │   ├── (store)/                # 강사 스토어 ({instructor}.class-on.kr)
│   │   │   ├── layout.tsx
│   │   │   └── [subdomain]/
│   │   │       ├── page.tsx        # 스토어 홈
│   │   │       ├── product/[id]/   # 상품 상세
│   │   │       ├── cart/           # 장바구니
│   │   │       ├── checkout/       # 결제
│   │   │       └── my-courses/     # 내 강의실
│   │   ├── api/                    # API 라우트 (프록시)
│   │   └── middleware.ts           # 서브도메인 라우팅
│   ├── components/
│   │   ├── ui/                     # shadcn/ui 컴포넌트
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── Sidebar.tsx
│   │   ├── store/
│   │   │   ├── Banner.tsx
│   │   │   ├── ProductCard.tsx
│   │   │   └── ProductGrid.tsx
│   │   └── dashboard/
│   │       ├── StatsCard.tsx
│   │       └── ProductForm.tsx
│   ├── lib/
│   │   ├── api.ts                  # API 클라이언트
│   │   ├── auth.ts                 # 인증 헬퍼
│   │   └── utils.ts
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   └── useProducts.ts
│   ├── types/
│   │   └── index.ts
│   ├── public/
│   ├── .env.local.example
│   ├── package.json
│   ├── next.config.js
│   ├── tailwind.config.ts
│   └── tsconfig.json
│
├── nginx/
│   ├── nginx.conf                   # Nginx 설정
│   └── Dockerfile
│
├── docker-compose.yml               # 로컬 개발 환경
├── docker-compose.prod.yml          # 프로덕션 환경
├── .github/
│   └── workflows/
│       ├── backend-ci.yml
│       └── frontend-ci.yml
├── .gitignore
├── README.md
└── PROJECT_PLAN.md                  # 이 문서
```

---

## 🗄 데이터베이스 설계

### ERD 개요
```
Instructor (강사)
  ├─ 1:1 → StoreConfig (스토어 설정)
  └─ 1:N → Product (상품)

User (사용자)
  ├─ 1:N → Order (주문)
  └─ M:N → Product (CartItem을 통해)

Product (상품)
  └─ 1:N → OrderItem (주문 항목)

Order (주문)
  └─ 1:N → OrderItem
```

### 테이블 스키마 (SQLAlchemy)

#### 1. instructors (강사)
```python
id: UUID (PK)
email: VARCHAR(255) UNIQUE NOT NULL
name: VARCHAR(100) NOT NULL
hashed_password: VARCHAR(255) NOT NULL
subdomain: VARCHAR(50) UNIQUE NOT NULL  # 예: "john" → john.class-on.kr
store_name: VARCHAR(100) NOT NULL       # 예: "John의 개발 강의"
logo_url: TEXT
bio: TEXT
is_active: BOOLEAN DEFAULT TRUE
created_at: TIMESTAMP DEFAULT NOW()
updated_at: TIMESTAMP DEFAULT NOW()
```

#### 2. store_configs (스토어 설정)
```python
id: UUID (PK)
instructor_id: UUID (FK → instructors.id) UNIQUE
primary_color: VARCHAR(7) DEFAULT '#000000'
secondary_color: VARCHAR(7) DEFAULT '#666666'
banner_url: TEXT
menu_items: JSONB DEFAULT '[]'          # [{"name": "홈", "path": "/"}]
theme: VARCHAR(20) DEFAULT 'default'    # default, minimal, modern
custom_css: TEXT
footer_text: TEXT
social_links: JSONB                     # {"instagram": "...", "youtube": "..."}
created_at: TIMESTAMP DEFAULT NOW()
updated_at: TIMESTAMP DEFAULT NOW()
```

#### 3. products (상품)
```python
id: UUID (PK)
instructor_id: UUID (FK → instructors.id)
title: VARCHAR(200) NOT NULL
description: TEXT
price: INTEGER NOT NULL                 # 원 단위 (10000 = 10,000원)
discount_price: INTEGER                 # 할인가
type: ENUM('ebook', 'video') NOT NULL
thumbnail_url: TEXT
file_url: TEXT NOT NULL                 # S3 경로
file_size: BIGINT                       # 바이트
duration: INTEGER                       # 동영상 길이 (초)
is_published: BOOLEAN DEFAULT FALSE
sales_count: INTEGER DEFAULT 0
view_count: INTEGER DEFAULT 0
category: VARCHAR(50)                   # 프로그래밍, 디자인, 마케팅 등
tags: JSONB                            # ["python", "fastapi"]
created_at: TIMESTAMP DEFAULT NOW()
updated_at: TIMESTAMP DEFAULT NOW()
```

#### 4. users (사용자)
```python
id: UUID (PK)
email: VARCHAR(255) UNIQUE NOT NULL
name: VARCHAR(100) NOT NULL
hashed_password: VARCHAR(255) NOT NULL
phone: VARCHAR(20)
is_active: BOOLEAN DEFAULT TRUE
created_at: TIMESTAMP DEFAULT NOW()
updated_at: TIMESTAMP DEFAULT NOW()
```

#### 5. orders (주문)
```python
id: UUID (PK)
user_id: UUID (FK → users.id)
instructor_id: UUID (FK → instructors.id)  # 매출 집계용
order_number: VARCHAR(20) UNIQUE NOT NULL  # ORD20250101001
total_amount: INTEGER NOT NULL
discount_amount: INTEGER DEFAULT 0
final_amount: INTEGER NOT NULL
status: ENUM('pending', 'paid', 'cancelled', 'refunded') DEFAULT 'pending'
payment_method: VARCHAR(20)                # card, transfer, etc.
imp_uid: VARCHAR(100)                      # 아임포트 결제 고유번호
merchant_uid: VARCHAR(100)                 # 가맹점 주문번호
paid_at: TIMESTAMP
cancelled_at: TIMESTAMP
created_at: TIMESTAMP DEFAULT NOW()
```

#### 6. order_items (주문 항목)
```python
id: UUID (PK)
order_id: UUID (FK → orders.id)
product_id: UUID (FK → products.id)
product_title: VARCHAR(200)            # 주문 당시 상품명 (변경 대비)
price: INTEGER NOT NULL                # 주문 당시 가격
quantity: INTEGER DEFAULT 1
```

#### 7. cart_items (장바구니)
```python
id: UUID (PK)
user_id: UUID (FK → users.id)
product_id: UUID (FK → products.id)
created_at: TIMESTAMP DEFAULT NOW()

UNIQUE(user_id, product_id)
```

#### 8. purchased_products (구매 이력 - 콘텐츠 접근 제어용)
```python
id: UUID (PK)
user_id: UUID (FK → users.id)
product_id: UUID (FK → products.id)
order_id: UUID (FK → orders.id)
purchased_at: TIMESTAMP DEFAULT NOW()
expires_at: TIMESTAMP                  # 평생 소장이면 NULL

UNIQUE(user_id, product_id)
```

---

## 📋 구현 단계별 계획

### Phase 1: 기반 구축 (1-2주)

#### Week 1: 프로젝트 초기 설정
- [ ] **Day 1-2: 프로젝트 스캐폴딩**
  - FastAPI 프로젝트 구조 생성
  - Next.js 14 프로젝트 생성 (App Router)
  - Docker Compose 설정
  - Git 저장소 초기화

- [ ] **Day 3-4: 데이터베이스 설정**
  - PostgreSQL, Redis 컨테이너 설정
  - SQLAlchemy 모델 정의
  - Alembic 마이그레이션 초기화
  - 초기 테이블 생성

- [ ] **Day 5-7: 인증 시스템**
  - JWT 기반 인증 구현
  - 강사 회원가입/로그인 API
  - 사용자 회원가입/로그인 API
  - 비밀번호 해싱 (bcrypt)
  - 이메일 인증 (선택)

#### Week 2: 핵심 API 개발
- [ ] **Day 1-3: 강사 관리 API**
  - 강사 프로필 CRUD
  - 서브도메인 중복 체크
  - 서브도메인 생성 로직

- [ ] **Day 4-5: 상품 관리 API**
  - 상품 CRUD (Create, Read, Update, Delete)
  - 상품 발행/비발행 토글
  - 상품 목록 조회 (페이지네이션)

- [ ] **Day 6-7: 파일 업로드**
  - AWS S3 연동
  - 이미지 업로드 (썸네일, 로고, 배너)
  - 전자책 PDF 업로드
  - 동영상 업로드 (기본)

---

### Phase 2: 프론트엔드 기본 구현 (2주)

#### Week 3: 메인 플랫폼 UI
- [ ] **Day 1-2: 랜딩 페이지**
  - 플랫폼 소개 페이지 (class-on.kr)
  - 강사 가입 페이지
  - 로그인 페이지

- [ ] **Day 3-5: 강사 대시보드**
  - 대시보드 레이아웃
  - 상품 목록 페이지
  - 상품 추가/수정 폼
  - 파일 업로드 UI (드래그앤드롭)

- [ ] **Day 6-7: 스토어 설정 페이지**
  - 스토어 기본 정보 수정
  - 로고/배너 업로드
  - 색상 테마 선택기

#### Week 4: 스토어 프론트 UI
- [ ] **Day 1-3: 스토어 홈 페이지**
  - 서브도메인 라우팅 미들웨어
  - 헤더 (로고, 메뉴, 장바구니, 로그인)
  - 배너 컴포넌트
  - 상품 그리드 컴포넌트

- [ ] **Day 4-5: 상품 상세 페이지**
  - 상품 정보 표시
  - 장바구니 담기 버튼
  - 바로 구매 버튼

- [ ] **Day 6-7: 장바구니 페이지**
  - 장바구니 목록
  - 수량 조절
  - 총 금액 계산
  - 결제하기 버튼

---

### Phase 3: 결제 시스템 (1-2주)

#### Week 5: 결제 연동
- [ ] **Day 1-3: 아임포트/토스페이먼츠 연동**
  - 결제 모듈 선택 (아임포트 추천)
  - 결제 요청 API
  - 결제 검증 API
  - 웹훅 처리 (결제 완료 콜백)

- [ ] **Day 4-5: 주문 시스템**
  - 주문 생성 API
  - 주문 내역 조회
  - 주문 상태 관리 (pending → paid)

- [ ] **Day 6-7: 프론트엔드 결제 UI**
  - 결제 페이지
  - 결제 성공/실패 페이지
  - 주문 완료 이메일 발송

#### Week 6: 구매 후 처리
- [ ] **Day 1-3: 내 강의실**
  - 구매한 상품 목록
  - 전자책 다운로드 (Presigned URL)
  - 동영상 스트리밍 (기본)

- [ ] **Day 4-5: 접근 제어**
  - 구매 여부 확인 미들웨어
  - 파일 접근 권한 체크
  - Presigned URL 생성 (만료 시간 설정)

- [ ] **Day 6-7: 강사 주문 관리**
  - 주문 목록 조회 (강사용)
  - 매출 대시보드 (기본 통계)

---

### Phase 4: 고급 기능 (2-3주)

#### Week 7: 동영상 스트리밍
- [ ] **Day 1-3: HLS 스트리밍**
  - FFmpeg를 이용한 동영상 인코딩
  - Celery 비동기 작업 설정
  - m3u8 플레이리스트 생성

- [ ] **Day 4-5: 동영상 플레이어**
  - Video.js 또는 Plyr 통합
  - HLS 재생
  - 재생 진도 저장 (선택)

- [ ] **Day 6-7: CloudFront CDN**
  - CloudFront 배포 설정
  - Signed URL/Cookie 발급
  - 스트리밍 최적화

#### Week 8: 커스터마이징 강화
- [ ] **Day 1-3: 테마 시스템**
  - 다양한 테마 템플릿 (3-5개)
  - 실시간 미리보기
  - 커스텀 CSS 적용

- [ ] **Day 4-5: 메뉴 커스터마이징**
  - 메뉴 항목 추가/삭제/순서 변경
  - 외부 링크 지원

- [ ] **Day 6-7: 페이지 빌더 (기본)**
  - 드래그앤드롭 컴포넌트 배치
  - 텍스트 블록 추가
  - 이미지 블록 추가

#### Week 9: 부가 기능
- [ ] **Day 1-2: 리뷰 시스템**
  - 상품 리뷰 작성 (구매자만)
  - 별점 평가
  - 리뷰 목록 표시

- [ ] **Day 3-4: 검색 기능**
  - 상품 검색 (제목, 설명)
  - 카테고리별 필터링
  - 가격 범위 필터

- [ ] **Day 5-7: 쿠폰 시스템**
  - 쿠폰 생성 (강사용)
  - 쿠폰 적용 (사용자용)
  - 할인 계산

---

### Phase 5: 최적화 및 배포 (1-2주)

#### Week 10: 성능 최적화
- [ ] **Day 1-2: 캐싱**
  - Redis 캐싱 (상품 목록, 스토어 설정)
  - API 응답 캐싱
  - 이미지 최적화 (Next.js Image)

- [ ] **Day 3-4: DB 최적화**
  - 인덱스 추가 (subdomain, email 등)
  - N+1 쿼리 해결
  - 쿼리 성능 분석

- [ ] **Day 5-7: SEO**
  - 메타 태그 설정
  - Open Graph 이미지
  - Sitemap 생성

#### Week 11: 배포 및 모니터링
- [ ] **Day 1-3: CI/CD**
  - GitHub Actions 워크플로우
  - 자동 테스트
  - 자동 배포

- [ ] **Day 4-5: 프로덕션 배포**
  - AWS EC2 / Render (백엔드)
  - Vercel (프론트엔드)
  - Nginx 설정
  - SSL 인증서 (Let's Encrypt)

- [ ] **Day 6-7: 모니터링**
  - Sentry 에러 추적
  - 로그 수집
  - 성능 모니터링

---

## 🎯 주요 기능 명세

### 1. 강사용 기능

#### 1.1 회원가입 및 스토어 생성
- 이메일 기반 회원가입
- 서브도메인 설정 (중복 체크)
- 스토어 기본 정보 입력

#### 1.2 대시보드
- 최근 주문 현황
- 총 매출 통계
- 상품별 판매량
- 방문자 통계 (선택)

#### 1.3 상품 관리
- 상품 추가/수정/삭제
- 파일 업로드 (전자책 PDF, 동영상)
- 썸네일 이미지 설정
- 가격 설정 (할인가 포함)
- 발행/비발행 상태 관리
- 카테고리 및 태그 설정

#### 1.4 주문 관리
- 주문 목록 조회
- 주문 상세 정보
- 매출 통계 (일별, 월별)
- CSV 다운로드

#### 1.5 스토어 커스터마이징
- 로고 업로드
- 배너 이미지 설정
- 색상 테마 선택
- 메뉴 구성
- 푸터 텍스트 편집
- SNS 링크 설정

#### 1.6 쿠폰 관리 (선택)
- 쿠폰 생성 (할인율/금액)
- 유효기간 설정
- 사용 횟수 제한

---

### 2. 사용자용 기능

#### 2.1 회원가입/로그인
- 이메일 기반 회원가입
- 소셜 로그인 (선택: 구글, 카카오)
- 비밀번호 찾기

#### 2.2 스토어 탐색
- 강사 스토어 방문 ({instructor}.class-on.kr)
- 상품 목록 조회
- 상품 검색 및 필터링
- 상품 상세 정보 확인

#### 2.3 장바구니
- 상품 담기
- 수량 조절 (전자책은 1개 고정)
- 선택 삭제
- 총 금액 확인

#### 2.4 결제
- 주문 정보 확인
- 결제 수단 선택 (카드, 계좌이체 등)
- 쿠폰 적용
- 결제 진행 (아임포트/토스)

#### 2.5 내 강의실
- 구매한 전자책 다운로드
- 구매한 동영상 스트리밍
- 재생 진도 저장 (선택)
- 리뷰 작성

#### 2.6 마이페이지
- 프로필 수정
- 주문 내역 조회
- 비밀번호 변경

---

### 3. 시스템 기능

#### 3.1 인증 및 권한
- JWT 기반 인증
- 강사/사용자 역할 구분
- API 엔드포인트별 권한 체크

#### 3.2 파일 관리
- S3 업로드 (이미지, PDF, 동영상)
- Presigned URL 생성 (보안 다운로드)
- 파일 크기 제한 (예: 동영상 5GB)

#### 3.3 동영상 처리
- FFmpeg 인코딩 (여러 화질)
- HLS 스트리밍 생성
- CloudFront CDN 배포
- Celery 비동기 작업

#### 3.4 결제 처리
- 아임포트/토스 결제 연동
- 결제 검증
- 웹훅 처리 (실시간 주문 상태 업데이트)
- 환불 처리 (선택)

#### 3.5 이메일 발송
- 회원가입 인증 메일
- 주문 완료 메일
- 비밀번호 재설정 메일
- Celery 비동기 발송

---

## 🔌 API 엔드포인트 설계

### 인증 (Auth)
```
POST   /api/v1/auth/register/instructor    # 강사 회원가입
POST   /api/v1/auth/register/user          # 사용자 회원가입
POST   /api/v1/auth/login                  # 로그인
POST   /api/v1/auth/refresh                # 토큰 갱신
POST   /api/v1/auth/logout                 # 로그아웃
POST   /api/v1/auth/password-reset         # 비밀번호 재설정 요청
POST   /api/v1/auth/password-reset/confirm # 비밀번호 재설정 확인
```

### 강사 (Instructors)
```
GET    /api/v1/instructors/me              # 내 정보 조회
PUT    /api/v1/instructors/me              # 내 정보 수정
GET    /api/v1/instructors/{subdomain}     # 서브도메인으로 강사 조회
POST   /api/v1/instructors/check-subdomain # 서브도메인 중복 체크
```

### 상품 (Products)
```
GET    /api/v1/products                    # 상품 목록 (내 상품 - 강사용)
POST   /api/v1/products                    # 상품 생성
GET    /api/v1/products/{id}               # 상품 상세
PUT    /api/v1/products/{id}               # 상품 수정
DELETE /api/v1/products/{id}               # 상품 삭제
PATCH  /api/v1/products/{id}/publish       # 상품 발행 토글

# 스토어별 상품 조회 (공개)
GET    /api/v1/store/{subdomain}/products  # 특정 스토어의 상품 목록
GET    /api/v1/store/{subdomain}/products/{id}  # 상품 상세
```

### 파일 업로드 (Upload)
```
POST   /api/v1/upload/image                # 이미지 업로드 (썸네일, 로고, 배너)
POST   /api/v1/upload/ebook                # 전자책 PDF 업로드
POST   /api/v1/upload/video                # 동영상 업로드
GET    /api/v1/upload/video/{id}/status    # 동영상 인코딩 상태 확인
```

### 스토어 설정 (Store Config)
```
GET    /api/v1/store-config                # 내 스토어 설정 조회
PUT    /api/v1/store-config                # 스토어 설정 수정
GET    /api/v1/store/{subdomain}/config    # 특정 스토어 설정 조회 (공개)
```

### 장바구니 (Cart)
```
GET    /api/v1/cart                        # 내 장바구니 조회
POST   /api/v1/cart                        # 상품 추가
DELETE /api/v1/cart/{product_id}           # 상품 삭제
DELETE /api/v1/cart                        # 장바구니 비우기
```

### 주문 (Orders)
```
POST   /api/v1/orders                      # 주문 생성
GET    /api/v1/orders                      # 내 주문 목록 (사용자/강사)
GET    /api/v1/orders/{id}                 # 주문 상세
POST   /api/v1/orders/{id}/payment         # 결제 요청
POST   /api/v1/orders/webhook              # 결제 웹훅 (아임포트)
POST   /api/v1/orders/{id}/cancel          # 주문 취소
```

### 구매 상품 (Purchased)
```
GET    /api/v1/purchased                   # 구매한 상품 목록
GET    /api/v1/purchased/{product_id}/download  # 전자책 다운로드 URL
GET    /api/v1/purchased/{product_id}/stream    # 동영상 스트리밍 URL
```

### 리뷰 (Reviews) - 선택
```
POST   /api/v1/products/{id}/reviews       # 리뷰 작성
GET    /api/v1/products/{id}/reviews       # 리뷰 목록
PUT    /api/v1/reviews/{id}                # 리뷰 수정
DELETE /api/v1/reviews/{id}                # 리뷰 삭제
```

### 분석 (Analytics) - 선택
```
GET    /api/v1/analytics/sales             # 매출 통계
GET    /api/v1/analytics/products          # 상품별 판매 통계
GET    /api/v1/analytics/visitors          # 방문자 통계
```

---

## 🏗 인프라 구성

### 개발 환경
```
Docker Compose로 로컬 실행:
- backend (FastAPI)    : http://localhost:8000
- frontend (Next.js)   : http://localhost:3000
- postgres             : localhost:5432
- redis                : localhost:6379
- nginx                : http://localhost:80
```

### 프로덕션 환경
```
┌─────────────────────────────────────────────┐
│         Route53 DNS (class-on.kr)           │
│  - *.class-on.kr → CloudFront/Nginx         │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│         Nginx (리버스 프록시)                │
│  - 서브도메인 라우팅                          │
│  - SSL 터미네이션 (Let's Encrypt)            │
└─────────────────────────────────────────────┘
         ↓                           ↓
┌──────────────────┐       ┌──────────────────┐
│  Next.js (Vercel)│       │ FastAPI (EC2/    │
│  - SSR/CSR       │       │  Render)         │
│  - Static        │       │  - Gunicorn +    │
└──────────────────┘       │    Uvicorn       │
                           └──────────────────┘
                                    ↓
                           ┌──────────────────┐
                           │  PostgreSQL      │
                           │  (RDS/Supabase)  │
                           └──────────────────┘
                                    ↓
                           ┌──────────────────┐
                           │  Redis           │
                           │  (ElastiCache)   │
                           └──────────────────┘
                                    ↓
                           ┌──────────────────┐
                           │  S3 + CloudFront │
                           │  (파일 스토리지)   │
                           └──────────────────┘
```

### 서브도메인 라우팅 흐름
```
1. 사용자 요청: https://john.class-on.kr
2. Route53: Nginx 서버로 라우팅
3. Nginx:
   - john.class-on.kr → Next.js (프론트)
   - john.class-on.kr/api → FastAPI (백엔드)
4. Next.js Middleware:
   - 서브도메인 추출: "john"
   - /store/john 경로로 내부 라우팅
5. FastAPI:
   - 헤더에서 서브도메인 추출
   - DB에서 강사 정보 조회
   - 해당 강사의 상품 반환
```

---

## 🔐 보안 및 인증

### 인증 방식
- **JWT (JSON Web Token)**
  - Access Token: 15분 만료
  - Refresh Token: 7일 만료
  - HttpOnly Cookie에 저장 (XSS 방지)

### 비밀번호 보안
- **bcrypt** 해싱 (cost factor: 12)
- 최소 8자, 영문+숫자 조합 강제

### 파일 접근 제어
- **S3 Presigned URL** (만료 시간 1시간)
- 구매 여부 검증 후 URL 발급
- CloudFront Signed URL (동영상)

### API 보안
- **CORS** 설정 (*.class-on.kr만 허용)
- **Rate Limiting** (IP별 요청 제한)
- **SQL Injection** 방지 (SQLAlchemy ORM)
- **XSS** 방지 (입력값 검증, 이스케이프)

### 결제 보안
- 결제 금액 서버 검증 (클라이언트 값 신뢰 금지)
- 웹훅 서명 검증
- HTTPS 필수

---

## 📅 개발 일정

### 총 예상 기간: 10-12주

| Phase | 기간 | 주요 작업 | 완료 기준 |
|-------|------|-----------|-----------|
| **Phase 1** | 2주 | 프로젝트 초기화, DB 설계, 인증 구현 | 로그인/회원가입 동작 |
| **Phase 2** | 2주 | 강사 대시보드, 스토어 프론트 UI | 상품 CRUD 가능 |
| **Phase 3** | 2주 | 결제 시스템, 주문 처리 | 전자책 구매 및 다운로드 가능 |
| **Phase 4** | 3주 | 동영상 스트리밍, 커스터마이징 | HLS 스트리밍 재생 |
| **Phase 5** | 2주 | 최적화, 배포, 모니터링 | 프로덕션 환경 배포 |

### 마일스톤

#### M1 (2주차)
- ✅ 강사 회원가입 및 로그인 완료
- ✅ 서브도메인 기반 라우팅 동작
- ✅ 데이터베이스 스키마 완성

#### M2 (4주차)
- ✅ 상품 CRUD 완료
- ✅ 파일 업로드 (이미지, PDF) 완료
- ✅ 스토어 프론트 기본 UI 완성

#### M3 (6주차)
- ✅ 결제 시스템 연동 완료
- ✅ 전자책 구매 및 다운로드 가능
- ✅ 주문 관리 기능 완료

#### M4 (9주차)
- ✅ 동영상 HLS 스트리밍 완료
- ✅ 스토어 커스터마이징 완료
- ✅ 리뷰 시스템 완료

#### M5 (11주차)
- ✅ 프로덕션 배포 완료
- ✅ CI/CD 파이프라인 구축
- ✅ 모니터링 설정 완료

---

## 🧪 테스트 전략

### 백엔드 테스트
```python
# pytest 사용
tests/
├── test_auth.py           # 인증 테스트
├── test_products.py       # 상품 CRUD 테스트
├── test_orders.py         # 주문 및 결제 테스트
├── test_storage.py        # S3 업로드 테스트
└── conftest.py            # 픽스처 설정

# 목표: 80% 이상 커버리지
```

### 프론트엔드 테스트
- **Jest + React Testing Library** (컴포넌트 테스트)
- **Playwright** (E2E 테스트)
- 주요 시나리오: 회원가입 → 로그인 → 상품 구매

---

## 📊 성능 목표

- **API 응답 시간**: 평균 < 200ms
- **페이지 로드 시간**: < 2초 (First Contentful Paint)
- **동영상 스트리밍**: 버퍼링 < 3초
- **동시 접속**: 1,000명 이상 처리

---

## 📝 추가 고려사항

### 나중에 추가할 기능
- [ ] 라이브 강의 (WebRTC)
- [ ] 구독 모델 (월정액)
- [ ] 어드민 패널 (플랫폼 관리자용)
- [ ] 다국어 지원
- [ ] 모바일 앱 (React Native)
- [ ] AI 추천 시스템
- [ ] 커뮤니티 기능 (Q&A, 공지사항)

### 규제 및 법률
- [ ] 전자상거래법 준수
- [ ] 개인정보처리방침 작성
- [ ] 이용약관 작성
- [ ] 사업자 등록 (PG사 연동 시 필요)

---

## 🎯 다음 단계

**지금 바로 시작하시겠습니까?**

1. **프로젝트 초기 설정** (FastAPI + Next.js + Docker)
2. **데이터베이스 스키마 생성**
3. **인증 시스템 구현**

위 순서대로 진행하겠습니다!
