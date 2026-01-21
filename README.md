# Molog 프로젝트

## Molog 디자인 시스템

이 프로젝트는 모든 페이지에서 일관된 UI를 유지하기 위해 엄격한 디자인 시스템을 따릅니다.
**향후 모든 개발은 아래 가이드라인을 준수해야 합니다.**

### 1. 색상 팔레트 (Color Palette)

#### 주요 브랜드 컬러
- **Primary (메인):** Blue-600 (`#2563eb`)
- **Primary Hover:** Blue-700 (`#1d4ed8`)

#### 배경 색상 (Background)
- **라이트 모드 (Light Mode):**
  - 페이지 배경: Gray-50 (`#f9fafb`)
  - 카드/표면: White (`#ffffff`)
- **다크 모드 (Dark Mode):**
  - 페이지 배경: `#1c1c1e` (Apple Dark Gray)
  - 카드/표면: `#1c1c1e` (배경과 동일하여 경계 없는 디자인) 또는 짙은 회색 계열.

#### 텍스트 색상 (Text)
- **라이트 모드:**
  - 제목 (Headings): Gray-900 (`#111827`)
  - 본문 (Body): Black (`#000000`)
  - 서브 텍스트/힌트: Gray-500 (`#6b7280`)
  - 링크: Gray-600 (`#4b5563`) -> 호버 시: Gray-900
- **다크 모드:**
  - 제목 (Headings): White (`#ffffff`)
  - 본문 (Body): White (`#ffffff`)
  - 서브 텍스트/힌트: Gray-400 (`#9ca3af`)
  - 링크: Gray-300 (`#d1d5db`) -> 호버 시: White

#### 소셜 브랜드 컬러
- **카카오톡:** 배경 `#FEE500`, 텍스트 `#3c1e1e`
- **네이버:** 배경 `#03C75A`, 텍스트 `White`
- **구글:** 배경 `White`, 텍스트 `Black`, 테두리 `Gray-200`

### 2. 타이포그래피 (Typography)
- **폰트 패밀리:** 시스템 기본 폰트 (San Francisco, Inter, Segoe UI 등).
- **제목:**
  - 메인 타이틀: `text-5xl font-bold`
- **본문:** `text-base`
- **작은 텍스트:** `text-sm`

### 3. 레이아웃 및 간격 (Layout & Spacing)
- **컨테이너 너비:** `max-w-sm` (모바일 우선 카드 레이아웃).
- **글로벌 패딩:** `px-6`.
- **모서리 둥글기 (Radius):** 모든 입력창, 버튼, 카드에 `rounded-xl` (12px) 적용.
- **입력창 높이:** `py-3`
- **버튼 높이:** `py-3.5`

### 4. 컴포넌트 및 인터랙션 (Components)

#### 입력창 (Inputs)
- **스타일:** 왼쪽에 아이콘이 있는 깔끔한 플랫 디자인.
- **라이트 모드:** 흰색 배경, Gray-200 테두리 (단독 사용 시) 또는 그룹 컨테이너 사용.
- **다크 모드:** 흰색 배경 (고대비), 레이아웃 크기 유지를 위한 투명 테두리(`border-transparent`) 사용.
- **아이콘:** `lucide-react` 아이콘 사용, 주로 `text-blue-500`.

#### 버튼 (Buttons)
- **Primary:** 가로 꽉 찬 형태 (`w-full`), `rounded-xl`, `font-bold`.
- **그림자:** 주요 액션 버튼에 컬러 그림자 적용 (예: `shadow-blue-600/30`).

#### 테마 토글 (Dark Mode)
- **방식:** 클래스 기반 (`html` 태그에 `.dark` 클래스 추가/제거).
- **구현:**
  - Tailwind의 `dark:` variant 사용.
  - **중요:** 라이트/다크 모드 간 레이아웃 흔들림 방지를 위해 테두리(Border) 두께를 일치시켜야 함 (다크 모드에서는 `border-transparent` 사용).

### 5. 아이콘 (Icons)
- **시스템 아이콘:** `lucide-react` (선명한 느낌을 위해 Stroke width 2~3 권장).
- **브랜드 아이콘:** `react-icons` (예: `FcGoogle`, `RiKakaoTalkFill`, `SiNaver`).

---

# React + TypeScript + Vite (원본 템플릿 정보)

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh
