# Class-On Backend API

FastAPI 기반 백엔드 서버

## 기술 스택

- FastAPI 0.104+
- Python 3.11+
- PostgreSQL 15 (SQLAlchemy 비동기)
- JWT 인증

## 시작하기

### 1. 가상환경 생성 및 활성화

```bash
python3 -m venv venv
source venv/bin/activate  # macOS/Linux
# 또는
venv\Scripts\activate  # Windows
```

### 2. 패키지 설치

```bash
pip install -r requirements.txt
```

### 3. PostgreSQL 데이터베이스 생성

```bash
# PostgreSQL 접속
psql -U postgres

# 데이터베이스 생성
CREATE DATABASE classon;

# 종료
\q
```

### 4. 환경변수 설정

`.env` 파일이 이미 생성되어 있습니다. 필요시 수정하세요.

```
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/classon
SECRET_KEY=dev-secret-key-please-change-in-production-09876543210
```

### 5. 서버 실행

```bash
# 개발 서버 (Hot reload)
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# 또는 간단하게
python -m uvicorn app.main:app --reload
```

서버가 시작되면 다음 주소에서 확인할 수 있습니다:

- API Docs: http://localhost:8000/api/v1/docs
- Root: http://localhost:8000

## API 엔드포인트

### 인증 (Authentication)

#### 사용자 회원가입
```
POST /api/v1/auth/signup/user
```
Request Body:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "full_name": "홍길동"
}
```

#### 강사 회원가입
```
POST /api/v1/auth/signup/instructor
```
Request Body:
```json
{
  "email": "instructor@example.com",
  "password": "password123",
  "full_name": "김강사",
  "subdomain": "kimteacher",
  "store_name": "김강사의 개발 강의"
}
```

#### 사용자 로그인
```
POST /api/v1/auth/login/user
```
Request Body:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

#### 강사 로그인
```
POST /api/v1/auth/login/instructor
```

## 데이터베이스 스키마

### Users
- id (UUID)
- email (Unique)
- hashed_password
- full_name
- is_active
- created_at

### Instructors
- id (UUID)
- email (Unique)
- hashed_password
- full_name
- subdomain (Unique)
- store_name
- bio
- profile_image
- is_active
- is_verified
- created_at

### Products
- id (UUID)
- instructor_id (FK)
- title
- description
- price
- discount_price
- thumbnail
- type (ebook/video)
- category
- file_url
- is_published
- created_at

## 다음 단계

- [ ] 상품 CRUD API
- [ ] 주문 및 결제 API
- [ ] 파일 업로드 (S3)
- [ ] 스토어 커스터마이징 API
- [ ] 매출 통계 API
