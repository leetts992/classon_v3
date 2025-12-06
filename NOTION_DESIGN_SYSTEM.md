# 🎨 Class-On Design System (Notion-Inspired)

> Notion의 2024 리브랜딩에서 영감을 받은 밝고 활기찬 디자인 시스템

---

## 🌈 핵심 철학

**"컬러풀하지만 전문적으로, 플레이풀하지만 신뢰감 있게"**

- ✅ 원색(노랑, 파랑, 빨강) 사용으로 활기찬 느낌
- ✅ 부드러운 그라데이션으로 세련미 유지
- ✅ 메인 랜딩은 컬러풀, 대시보드는 차분하게
- ✅ 교육 플랫폼의 따뜻함과 즐거움 표현

---

## 🎨 컬러 시스템

### Primary Colors (원색 기반)

```css
/* Yellow - 활기, 시작, 창의성 */
--yellow-50: #fffbeb
--yellow-100: #fef3c7
--yellow-400: #fbbf24
--yellow-500: #f59e0b  /* Primary Yellow */
--yellow-600: #d97706

/* Blue - 신뢰, 전문성, 안정감 */
--blue-50: #eff6ff
--blue-100: #dbeafe
--blue-400: #60a5fa
--blue-500: #3b82f6    /* Primary Blue */
--blue-600: #2563eb

/* Red/Pink - 열정, 에너지, 강조 */
--red-50: #fef2f2
--red-100: #fee2e2
--red-400: #f87171
--red-500: #ef4444     /* Primary Red */
--pink-500: #ec4899    /* Accent Pink */

/* Purple - 브랜드 시그니처 */
--purple-50: #faf5ff
--purple-100: #f3e8ff
--purple-400: #c084fc
--purple-500: #a855f7  /* Brand Purple */
--purple-600: #9333ea
```

### Gradients (부드러운 전환)

```css
/* Main Brand Gradient */
--gradient-brand: linear-gradient(135deg, #fbbf24 0%, #3b82f6 50%, #ec4899 100%);

/* Feature Gradients */
--gradient-yellow-blue: linear-gradient(135deg, #fbbf24 0%, #3b82f6 100%);
--gradient-blue-pink: linear-gradient(135deg, #3b82f6 0%, #ec4899 100%);
--gradient-pink-purple: linear-gradient(135deg, #ec4899 0%, #a855f7 100%);
--gradient-yellow-red: linear-gradient(135deg, #fbbf24 0%, #ef4444 100%);

/* Subtle Background Gradients */
--bg-gradient-warm: linear-gradient(135deg, #fffbeb 0%, #fee2e2 100%);
--bg-gradient-cool: linear-gradient(135deg, #eff6ff 0%, #faf5ff 100%);
--bg-gradient-vibrant: linear-gradient(135deg, #fef3c7 10%, #dbeafe 50%, #fce7f3 90%);
```

### Neutral Colors

```css
--gray-50: #f9fafb
--gray-100: #f3f4f6
--gray-200: #e5e7eb
--gray-300: #d1d5db
--gray-500: #6b7280
--gray-700: #374151
--gray-900: #111827

--white: #ffffff
--black: #000000
```

---

## 🖋 타이포그래피

### Font Family

```css
/* Notion은 Karla + Inter 조합 사용 */
/* 우리는 한글 환경에 최적화 */

--font-primary: 'Pretendard Variable', -apple-system, BlinkMacSystemFont, sans-serif;
--font-english: 'Inter', 'Pretendard Variable', sans-serif;
--font-mono: 'JetBrains Mono', monospace;
```

### Font Sizes

```css
/* Notion처럼 크고 굵게 */
--text-xs: 0.75rem      /* 12px */
--text-sm: 0.875rem     /* 14px */
--text-base: 1rem       /* 16px */
--text-lg: 1.125rem     /* 18px */
--text-xl: 1.25rem      /* 20px */
--text-2xl: 1.5rem      /* 24px */
--text-3xl: 1.875rem    /* 30px */
--text-4xl: 2.25rem     /* 36px */
--text-5xl: 3rem        /* 48px */
--text-6xl: 3.75rem     /* 60px */
--text-7xl: 4.5rem      /* 72px */
```

### Font Weights

```css
--font-normal: 400
--font-medium: 500
--font-semibold: 600
--font-bold: 700
--font-extrabold: 800
```

---

## 🧩 컴포넌트 스타일

### Buttons

#### 1. Gradient Button (Primary CTA)
```tsx
<button className="
  bg-gradient-to-r from-yellow-400 via-blue-500 to-pink-500
  text-white font-bold
  px-8 py-4 rounded-2xl
  shadow-lg shadow-blue-500/30
  hover:shadow-2xl hover:shadow-blue-500/50
  hover:scale-105
  transition-all duration-300
">
  무료로 시작하기
</button>
```

#### 2. Solid Colorful Button
```tsx
<button className="
  bg-blue-500 hover:bg-blue-600
  text-white font-semibold
  px-6 py-3 rounded-xl
  shadow-md
  transition-colors
">
  더 알아보기
</button>
```

#### 3. Outline Button
```tsx
<button className="
  border-2 border-blue-500
  text-blue-500 font-semibold
  px-6 py-3 rounded-xl
  hover:bg-blue-50
  transition-colors
">
  데모 보기
</button>
```

### Cards

#### 1. Colorful Feature Card
```tsx
<div className="
  group relative
  bg-gradient-to-br from-yellow-50 to-blue-50
  border-2 border-transparent
  hover:border-blue-500
  rounded-3xl
  p-8
  shadow-lg hover:shadow-2xl
  transition-all duration-300
  hover:-translate-y-2
">
  {/* Icon with solid color bg */}
  <div className="
    w-16 h-16 rounded-2xl
    bg-blue-500
    flex items-center justify-center
    mb-6
    group-hover:scale-110
    transition-transform
  ">
    <Icon className="text-white text-3xl" />
  </div>

  <h3 className="text-2xl font-bold text-gray-900 mb-3">
    커스터마이징
  </h3>
  <p className="text-gray-600 text-lg">
    나만의 브랜드 색상으로 스토어를 꾸미세요
  </p>
</div>
```

#### 2. Product Card (Colorful Hover)
```tsx
<div className="
  group relative overflow-hidden
  bg-white
  rounded-2xl
  border-2 border-gray-200
  hover:border-blue-500
  shadow-md hover:shadow-2xl
  transition-all duration-300
">
  {/* Gradient overlay on hover */}
  <div className="
    absolute inset-0
    bg-gradient-to-br from-blue-500/10 via-pink-500/10 to-purple-500/10
    opacity-0 group-hover:opacity-100
    transition-opacity duration-300
  " />

  {/* Thumbnail */}
  <img className="aspect-video object-cover" />

  {/* Colorful Badge */}
  <div className="absolute top-4 right-4">
    <span className="
      inline-flex items-center
      px-3 py-1 rounded-full
      bg-gradient-to-r from-yellow-400 to-orange-500
      text-white text-sm font-bold
    ">
      17% OFF
    </span>
  </div>

  {/* Content */}
  <div className="relative p-6">
    <h3 className="text-xl font-bold text-gray-900 mb-2">
      Python 완전정복
    </h3>
    <p className="text-gray-600 mb-4">
      Python의 기초부터 실전까지
    </p>

    {/* Colorful Price */}
    <div className="flex items-baseline space-x-2">
      <span className="text-3xl font-bold text-blue-600">
        ₩49,000
      </span>
      <span className="text-lg text-gray-400 line-through">
        ₩59,000
      </span>
    </div>
  </div>
</div>
```

### Badges

```tsx
{/* Gradient Badge */}
<span className="
  inline-flex items-center
  px-4 py-2 rounded-full
  bg-gradient-to-r from-yellow-400 to-pink-500
  text-white text-sm font-bold
">
  신규
</span>

{/* Solid Color Badge */}
<span className="
  inline-flex items-center
  px-3 py-1 rounded-full
  bg-blue-100 text-blue-700
  text-sm font-semibold
">
  전자책
</span>

{/* Outlined Badge */}
<span className="
  inline-flex items-center
  px-3 py-1 rounded-full
  border-2 border-purple-500
  text-purple-500
  text-sm font-semibold
">
  베스트
</span>
```

---

## 🎭 Section Styles

### Hero Section (메인 랜딩)

```tsx
<section className="
  relative overflow-hidden
  bg-gradient-to-br from-yellow-50 via-blue-50 to-pink-50
  py-20 md:py-32
">
  {/* Animated gradient orbs - Notion 스타일 */}
  <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-yellow-400/30 to-transparent rounded-full blur-3xl animate-pulse" />
  <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-br from-blue-400/30 to-transparent rounded-full blur-3xl animate-pulse" />
  <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] bg-gradient-to-br from-pink-400/20 to-transparent rounded-full blur-3xl animate-pulse" />

  <div className="container relative z-10">
    {/* Colorful badge */}
    <div className="flex justify-center mb-8">
      <span className="
        inline-flex items-center
        px-6 py-2 rounded-full
        bg-gradient-to-r from-yellow-400 to-orange-500
        text-white font-semibold
        shadow-lg
      ">
        ✨ 강사를 위한 올인원 플랫폼
      </span>
    </div>

    {/* Main headline */}
    <h1 className="
      text-5xl md:text-7xl font-extrabold
      text-center
      text-gray-900
      mb-6
    ">
      5분 만에 나만의
      <br />
      <span className="
        bg-gradient-to-r from-yellow-500 via-blue-500 to-pink-500
        bg-clip-text text-transparent
      ">
        강의 판매 사이트
      </span>{" "}
      오픈
    </h1>

    {/* Subtitle */}
    <p className="
      text-xl md:text-2xl
      text-center text-gray-600
      max-w-3xl mx-auto
      mb-12
    ">
      전자책과 동영상 강의를 쉽게 판매하세요.
      <br />
      복잡한 기술 없이, 누구나 5분이면 충분합니다.
    </p>

    {/* CTA Buttons */}
    <div className="flex flex-col sm:flex-row gap-4 justify-center">
      <button className="
        bg-gradient-to-r from-yellow-400 via-blue-500 to-pink-500
        text-white font-bold text-lg
        px-10 py-5 rounded-2xl
        shadow-lg shadow-blue-500/30
        hover:shadow-2xl hover:shadow-blue-500/50
        hover:scale-105
        transition-all duration-300
      ">
        무료로 시작하기 →
      </button>

      <button className="
        bg-white
        text-gray-900 font-semibold text-lg
        px-10 py-5 rounded-2xl
        border-2 border-gray-300
        hover:border-blue-500
        shadow-md
        transition-all
      ">
        데모 보기
      </button>
    </div>
  </div>
</section>
```

### Feature Section (기능 소개)

```tsx
<section className="py-20 md:py-32 bg-white">
  <div className="container">
    {/* Section Header */}
    <div className="text-center mb-16">
      <span className="
        inline-flex items-center
        px-4 py-2 rounded-full
        bg-blue-100 text-blue-700
        font-semibold
        mb-4
      ">
        주요 기능
      </span>

      <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
        강의 판매에 필요한
        <br />
        모든 기능이 여기에
      </h2>
    </div>

    {/* Feature Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {/* Feature Card 1 - Yellow */}
      <div className="
        bg-gradient-to-br from-yellow-50 to-orange-50
        border-2 border-yellow-200
        rounded-3xl p-8
        hover:shadow-2xl hover:-translate-y-2
        transition-all duration-300
      ">
        <div className="w-16 h-16 rounded-2xl bg-yellow-500 flex items-center justify-center mb-6">
          <Palette className="text-white text-3xl" />
        </div>
        <h3 className="text-2xl font-bold mb-3">커스터마이징</h3>
        <p className="text-gray-600 text-lg">나만의 브랜드 색상으로 스토어를 꾸미세요</p>
      </div>

      {/* Feature Card 2 - Blue */}
      <div className="
        bg-gradient-to-br from-blue-50 to-cyan-50
        border-2 border-blue-200
        rounded-3xl p-8
        hover:shadow-2xl hover:-translate-y-2
        transition-all duration-300
      ">
        <div className="w-16 h-16 rounded-2xl bg-blue-500 flex items-center justify-center mb-6">
          <CreditCard className="text-white text-3xl" />
        </div>
        <h3 className="text-2xl font-bold mb-3">결제 연동</h3>
        <p className="text-gray-600 text-lg">아임포트/토스로 쉽고 안전한 결제</p>
      </div>

      {/* Feature Card 3 - Pink */}
      <div className="
        bg-gradient-to-br from-pink-50 to-purple-50
        border-2 border-pink-200
        rounded-3xl p-8
        hover:shadow-2xl hover:-translate-y-2
        transition-all duration-300
      ">
        <div className="w-16 h-16 rounded-2xl bg-pink-500 flex items-center justify-center mb-6">
          <BarChart3 className="text-white text-3xl" />
        </div>
        <h3 className="text-2xl font-bold mb-3">실시간 분석</h3>
        <p className="text-gray-600 text-lg">매출과 방문자를 한눈에 확인</p>
      </div>
    </div>
  </div>
</section>
```

---

## 🎪 로고 디자인

```tsx
{/* Simple Gradient Circle - Notion 스타일 */}
<div className="flex items-center space-x-3">
  {/* Logo */}
  <div className="relative w-12 h-12">
    {/* Gradient circle */}
    <div className="
      w-12 h-12 rounded-2xl
      bg-gradient-to-br from-yellow-400 via-blue-500 to-pink-500
      flex items-center justify-center
      shadow-lg
    ">
      <span className="text-white font-bold text-2xl">C</span>
    </div>
  </div>

  {/* Text */}
  <span className="text-2xl font-bold text-gray-900">
    Class-On
  </span>
</div>
```

---

## 🌓 다크모드 (선택적)

Notion처럼 다크모드도 컬러풀하게:

```css
.dark {
  --bg: #191919
  --text: #ffffff

  /* 다크모드에서도 색상 유지 (채도만 약간 낮춤) */
  --yellow-500: #eab308
  --blue-500: #3b82f6
  --pink-500: #ec4899
}
```

---

## 📱 반응형

```tsx
{/* 모바일: 더 큰 터치 영역 */}
<button className="
  px-6 py-3          /* 모바일 */
  md:px-8 md:py-4   /* 데스크탑 */
  text-base          /* 모바일 */
  md:text-lg        /* 데스크탑 */
">

{/* 그리드 반응형 */}
<div className="
  grid
  grid-cols-1        /* 모바일: 1열 */
  md:grid-cols-2     /* 태블릿: 2열 */
  lg:grid-cols-3     /* 데스크탑: 3열 */
  gap-6
">
```

---

## ✅ 체크리스트

### 색상
- [x] 노랑/파랑/핑크 원색 사용
- [x] 부드러운 그라데이션
- [x] 배경은 연한 틴트 (50, 100)
- [x] 텍스트는 진한 그레이 (900)

### 타이포그래피
- [x] 크고 굵은 헤딩
- [x] 넉넉한 줄간격
- [x] Pretendard Variable

### 컴포넌트
- [x] 둥근 모서리 (rounded-2xl, 3xl)
- [x] 그림자 (shadow-lg, 2xl)
- [x] 호버 효과 (-translate-y-2)
- [x] 컬러풀한 아이콘 배경

### 애니메이션
- [x] 부드러운 전환 (duration-300)
- [x] 호버 시 확대 (scale-105)
- [x] 펄스 효과 (animate-pulse)

---

## 🚀 구현 순서

1. **globals.css 업데이트** (색상 변수)
2. **Button 컴포넌트** (그라데이션 추가)
3. **Card 컴포넌트** (컬러풀 배경)
4. **로고 변경** (그라데이션 서클)
5. **랜딩 페이지** (Hero 섹션)
6. **Feature 카드** (컬러풀 배경)
7. **상품 카드** (호버 오버레이)

---

**Notion의 밝고 활기찬 느낌을 Class-On에 그대로!** 🎨
