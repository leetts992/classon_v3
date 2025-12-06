# Class-On Frontend 🎓

전자책과 동영상 강의 판매 플랫폼의 프론트엔드

## 기술 스택

- **Next.js 14** - React 프레임워크 (App Router)
- **TypeScript** - 타입 안정성
- **TailwindCSS** - 유틸리티 CSS 프레임워크
- **Shadcn/ui** - 재사용 가능한 UI 컴포넌트
- **Framer Motion** - 애니메이션 라이브러리
- **Lucide React** - 아이콘 라이브러리

## 시작하기

### 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 결과를 확인하세요.

### 주요 페이지

- **메인 랜딩 페이지**: [http://localhost:3000](http://localhost:3000)
  - 플랫폼 소개 및 기능 설명
  - Hero 섹션, 기능 소개, 후기

- **스토어 데모**: [http://localhost:3000/demo](http://localhost:3000/demo)
  - 강사 스토어 예시 페이지
  - 상품 목록 (전자책, 동영상)
  - 실제 작동하는 UI 컴포넌트

## 프로젝트 구조

```
frontend/
├── app/                    # Next.js App Router
│   ├── (store)/           # 스토어 라우트 그룹
│   │   └── demo/          # 데모 스토어 페이지
│   ├── globals.css        # 전역 스타일 + 디자인 시스템
│   ├── layout.tsx         # 루트 레이아웃
│   └── page.tsx           # 메인 랜딩 페이지
├── components/
│   ├── ui/                # Shadcn/ui 기본 컴포넌트
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   └── ... (15개 컴포넌트)
│   ├── layout/            # 레이아웃 컴포넌트
│   │   ├── Header.tsx     # 헤더 (로고, 메뉴, 장바구니)
│   │   └── Footer.tsx     # 푸터
│   └── store/             # 스토어 관련 컴포넌트
│       ├── Banner.tsx     # 히어로 배너
│       ├── ProductCard.tsx # 상품 카드
│       └── ProductGrid.tsx # 상품 그리드
├── lib/
│   └── utils.ts           # 유틸리티 함수
├── types/
│   └── index.ts           # TypeScript 타입 정의
└── hooks/                 # Custom Hooks (예정)
```

## 디자인 시스템

### 색상 팔레트

```css
Primary (Blue):   #2563eb  /* CTA 버튼, 링크 */
Secondary (Purple): #8b5cf6  /* 강조, 배지 */
Muted (Gray):     #6b7280  /* 보조 텍스트 */
Background:       #ffffff  /* 배경 */
Foreground:       #111827  /* 텍스트 */
```

### 타이포그래피

- **Font Family**: Geist Sans (시스템 폰트 fallback)
- **Base Size**: 16px
- **Heading Scale**: text-5xl, text-4xl, text-2xl
- **Line Height**: 1.5 (본문), 1.2 (제목)

### 컴포넌트

Shadcn/ui 기반으로 다음 컴포넌트를 사용합니다:

- **Button** - 다양한 variant (default, outline, ghost, destructive)
- **Card** - 상품, 기능 카드
- **Badge** - 카테고리, 할인율 표시
- **Input, Textarea** - 폼 입력
- **Dialog** - 모달
- **Dropdown Menu** - 사용자 메뉴
- **Tabs** - 탭 네비게이션

## 구현 완료 기능

### ✅ Phase 1 (완료)
- [x] Next.js 14 프로젝트 초기화
- [x] TailwindCSS + Shadcn/ui 설정
- [x] 디자인 시스템 구축 (색상, 타이포그래피)
- [x] 레이아웃 컴포넌트
  - Header (로고, 메뉴, 장바구니, 사용자 메뉴)
  - Footer (링크, SNS 아이콘)
- [x] 스토어 컴포넌트
  - ProductCard (썸네일, 가격, 별점, 장바구니 버튼)
  - ProductGrid (반응형 그리드)
  - Banner (히어로 섹션)
- [x] 메인 랜딩 페이지
  - Hero 섹션
  - 주요 기능 소개 (6개 카드)
  - 실제 사례
  - 후기 (3개)
  - CTA 섹션
- [x] 스토어 데모 페이지
  - 실제 작동하는 스토어 UI
  - 전자책 & 동영상 섹션
  - Mock 데이터 (6개 상품)

## 다음 단계

### Phase 2 (예정)
- [ ] 인증 페이지
  - 로그인 페이지
  - 회원가입 (강사/사용자)
- [ ] 강사 대시보드
  - 대시보드 홈 (통계)
  - 상품 목록 & CRUD
  - 주문 관리
  - 스토어 설정
- [ ] 장바구니 & 결제
  - 장바구니 페이지
  - 결제 페이지
  - 주문 완료
- [ ] 내 강의실
  - 구매한 상품 목록
  - 전자책 다운로드
  - 동영상 재생

### Phase 3 (예정)
- [ ] API 연동
  - React Query 설정
  - API 클라이언트
  - 에러 핸들링
- [ ] 전역 상태 관리
  - Zustand 스토어
  - 장바구니 상태
  - 사용자 인증 상태
- [ ] 서브도메인 라우팅
  - Middleware 구현
  - 동적 스토어 페이지

## 사용 가능한 스크립트

```bash
# 개발 서버 시작 (포트 3000)
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start

# 코드 린트
npm run lint
```

## 환경 변수

프로젝트 루트에 `.env.local` 파일을 생성하세요:

```env
# API 엔드포인트 (백엔드)
NEXT_PUBLIC_API_URL=http://localhost:8000

# 기타 설정 (예정)
NEXT_PUBLIC_STRIPE_KEY=pk_test_...
```

## Shadcn/ui 컴포넌트 추가

새로운 컴포넌트가 필요하면:

```bash
npx shadcn@latest add [component-name]

# 예시
npx shadcn@latest add form
npx shadcn@latest add slider
```

## 배포

### Vercel (추천)

```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel
```

프로젝트가 자동으로 Vercel에 배포되며, 도메인이 제공됩니다.

### 기타 플랫폼

- **Netlify**: `npm run build` 후 `out` 디렉토리 배포
- **AWS Amplify**: GitHub 연동 후 자동 배포

## 개발 팁

### 새 페이지 추가

```tsx
// app/new-page/page.tsx
export default function NewPage() {
  return <div>New Page</div>;
}
```

### 새 컴포넌트 추가

```tsx
// components/MyComponent.tsx
export default function MyComponent() {
  return <div>My Component</div>;
}
```

### Framer Motion 애니메이션

```tsx
import { motion } from "framer-motion";

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
  Content
</motion.div>
```

## 문제 해결

### 포트가 이미 사용 중인 경우

```bash
# 다른 포트로 실행
PORT=3001 npm run dev
```

### 빌드 에러

```bash
# 의존성 재설치
rm -rf node_modules package-lock.json
npm install
```

### 타입 에러

```bash
# TypeScript 체크
npx tsc --noEmit
```

## 참고 자료

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Shadcn/ui](https://ui.shadcn.com/)
- [Framer Motion](https://www.framer.com/motion/)

---

Made with ❤️ by Class-On Team
