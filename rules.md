# Contexta 개발 규칙 (Rules)

> 이 문서는 Contexta 프로젝트의 개발 원칙, 코드 컨벤션, 작업 워크플로우를 정의합니다.
> 모든 개발 작업은 이 규칙을 따릅니다.

## 0. 절대 엄수 작업규칙
- 작업 시작 전에 **README.md**, **planning.md**, **rules.md** 파일을 읽고 전체적인 구조에 현재 명령이 어떤 맥락의 명령인지 파악한다.
- 이후 작업 계획을 수립여 작업을 수행한 후
- 작업내용을 **README.md**에 업데이트하고
- 깃에 올린다.

---

## 1. 프로젝트 컨텍스트

- **서비스명**: Contexta (컨텍스타)
- **서비스 유형**: B2B 영업대표용 실시간 AI 미팅 코파일럿
- **개발 환경**: 로컬 개발 우선 (서버 분리 없음)
- **기술 스택**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, Supabase

---

## 2. 디자인 철학

### 듀얼 페르소나 UI

| 모드 | 설명 | 디자인 톤 |
|------|------|----------|
| **일반 모드** | AI 힌트 + 메모장 스플릿 뷰 | 가볍고 여백 많은 무채색 기반, 힌트만 파스텔 블루(#B3D9FF) 강조 |
| **클라이언트 모드** | 회색 전체화면 메모장 위장 | 회색(#E5E5E5) 배경, 애니메이션 없이 **즉시** 전환, F4 토글 |

### 색상 체계

- **주 배경**: #FAFAFA (밝은 회색)
- **힌트 강조**: #B3D9FF (파스텔 블루)
- **클라이언트 모드 배경**: #E5E5E5
- **텍스트 기본**: #1A1A1A
- **텍스트 보조**: #6B7280
- **녹음 상태**: #EF4444 (빨강)

---

## 3. 코드 컨벤션

### 파일 및 폴더 네이밍

- **컴포넌트**: PascalCase (`HintPanel.tsx`, `Button.tsx`)
- **훅**: camelCase with `use` 접두사 (`useClientMode.ts`)
- **유틸리티**: camelCase (`format.ts`, `audio.ts`)
- **타입**: camelCase (`meeting.ts`, `user.ts`)
- **상수**: camelCase (`config.ts`, `theme.ts`)
- **라우트**: kebab-case 또는 Next.js 컨벤션 (`[id]`, `(auth)`)

### TypeScript 규칙

- `any` 타입 사용 금지 — 반드시 명시적 타입 지정
- `interface` 우선 사용 (단, union type이 필요하면 `type` 사용)
- API 응답 타입은 반드시 `src/types/`에 정의

### 컴포넌트 규칙

- 하나의 컴포넌트 파일은 **하나의 책임**만 담당
- Props 인터페이스는 컴포넌트 파일 내에 정의
- `"use client"` 지시문은 클라이언트 컴포넌트에만 필요 시 추가
- 3단계 이상 중첩 금지 — Guard Clause로 조기 리턴

### 스타일링 규칙

- Tailwind CSS 유틸리티 클래스 우선 사용
- 디자인 토큰(색상, 간격)은 `src/constants/theme.ts`에서 관리
- 인라인 스타일은 동적 값이 필요한 경우에만 허용
- 클라이언트 모드 전환 시 **transition/animation 사용 금지** (즉시 전환 원칙)

---

## 4. 작업 워크플로우

### Phase별 작업 단위

1. 각 Phase의 작업이 끝나면 **README.md에 진행 상황 업데이트**
2. README 업데이트 후 **git add → commit → push** 실행
3. 커밋 메시지 형식: `feat: Phase N - [작업 요약]`

### 커밋 메시지 컨벤션

```
feat: 새로운 기능 추가
fix: 버그 수정
refactor: 코드 리팩터링 (기능 변경 없음)
style: 스타일/포맷팅 변경
docs: 문서 수정
chore: 빌드/설정 변경
```

### 브랜치 전략

- MVP 단계에서는 `main` 브랜치에서 직접 작업
- 기능 단위가 커지면 `feat/기능명` 브랜치 분리 검토

---

## 5. API 설계 원칙

- 모든 API는 `src/app/api/` 하위에 Next.js Route Handlers로 구현
- 로컬 환경 기준으로 작성 (외부 서버 분리 없음)
- 응답 형식: JSON
- 에러 응답은 `{ error: string, code: string }` 형태로 통일
- Supabase 연동은 서버 사이드에서만 Service Role Key 사용

---

## 6. 보안 원칙

- API 키는 절대 클라이언트 코드에 노출 금지
- 환경변수는 `.env.local`에서 관리 (Git 추적 제외)
- Supabase RLS(Row Level Security) 활성화 필수
- AI API 호출 시 Zero Data Retention 설정 유지

---

## 7. 핵심 기능 우선순위

| 우선순위 | 기능 |
|---------|------|
| **P0 (핵심)** | 클라이언트 모드 즉시 전환, 실시간 요약, AI 코칭 힌트, 모듈형 회의록 |
| **P1 (필수)** | 소셜 로그인, 대시보드, 라이브 메모장, IT 용어 사전, 온디맨드 힌트, 화자 분리, 파일 내보내기 |
| **P2 (보류)** | 지식 베이스 업로드, RAG 연동, 캘린더 연동 |
