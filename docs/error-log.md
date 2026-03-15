# Contexta 오류 대응 로그

> 테스트 중 발견된 버그와 수정 내역을 기록합니다.
> 근본 원인이 동일한 오류는 하나의 섹션으로 묶어 관리합니다.

---

## [근본] Supabase DB 스키마 미적용 (schema.sql 미실행)

> **영향 범위**: 거의 모든 DB 관련 기능 — 프로젝트 생성, 미팅 저장, 사용 시간 동기화, 나만의 사전 등
> **상태**: ⚠️ 사용자 조치 필요

### 증상 목록

| 에러 메시지 | 발생 위치 | 원인 테이블/함수 |
|------------|----------|----------------|
| `Could not find the function public.increment_used_seconds(delta, uid)` | `useMeetingTimer.ts` | `increment_used_seconds` RPC 함수 |
| `폴백 UPDATE도 실패, 다음 동기화에 재시도` | `useMeetingTimer.ts` | `public.users` 테이블 |
| `Could not find the table 'public.projects'` | `dashboard/page.tsx` | `public.projects` 테이블 |
| 사용 시간 조회 실패 | `useMeetingTimer.ts` | `public.users.used_seconds` 컬럼 |
| 미팅 내역 조회 실패 | `dashboard/page.tsx` | `public.meetings` 테이블 |

### 해결 방법

**Supabase Dashboard > SQL Editor**에서 `database/schema.sql` 파일 전체를 복사하여 실행합니다.

생성되는 항목:
- `public.users` 테이블 + `used_seconds`, `limit_seconds` 컬럼
- `public.meetings` 테이블 + `project_id` FK
- `public.projects` 테이블
- `public.custom_words` 테이블
- `handle_new_user()` 트리거 (구글 로그인 → public.users 자동 행 생성)
- `increment_used_seconds()` RPC 함수
- 전 테이블 RLS 정책

### 코드 측 방어 처리

| 파일 | 방어 방식 |
|------|----------|
| `useMeetingTimer.ts` | 서킷 브레이커 — RPC → 직접 UPDATE → 3회 연속 실패 시 DB 동기화 비활성화 |
| `AuthProvider.tsx` | `ensurePublicUserRow()` — 로그인 시 public.users 행 자동 upsert |
| `dashboard/page.tsx` | 각 fetch 함수에 try-catch + DB 미설정 시 안내 배너 표시 |

---

## [Hotfix #1] 로그인 무한 리다이렉트

> **상태**: ✅ 수정 완료

### 증상

- `/login?redirectTo=%2Fdashboard`가 수백 번 반복 호출
- 브라우저 화면 "이동 중..."에서 멈춤
- 서버 로그에 `GET /login?redirectTo=%2Fdashboard 200` 무한 반복

### 원인

`middleware.ts`(서버)는 쿠키에서 세션을 읽는데, Supabase JS 클라이언트는 세션을 **localStorage**에 저장 → 서버는 항상 "미인증" 판단 → 로그인 페이지는 유저 감지 → `/dashboard`로 보냄 → 무한 루프

### 수정 내역

| 파일 | 변경 |
|------|------|
| `src/middleware.ts` | 삭제 (`.bak` 백업 유지) |
| `components/providers/AuthGuard.tsx` | 신규 — 클라이언트 측 라우트 보호 |
| `app/layout.tsx` | `AuthProvider` → `AuthGuard` 래핑 구조 |
| `app/(auth)/login/page.tsx` | OAuth redirectTo를 `/login` 경유로 변경 + `Suspense` 래핑 |

---

## [Hotfix #2] 회의록 빈 상태 UX

> **상태**: ✅ 수정 완료

### 증상

짧은 녹음(2초) 후 종료 시 "생성된 회의록이 없습니다" 한 줄만 표시, 원인 파악 불가

### 원인

`handleStop`에서 `transcripts.length === 0`이면 `return`하여 회의록 생성 API 미호출. 모달은 떴지만 `finalMinutes`가 빈 문자열.

### 수정 내역

| 파일 | 변경 |
|------|------|
| `PostMeetingResult.tsx` | 빈 상태 → 마이크 아이콘 + 원인 설명 + [닫고 다시 녹음하기] / [대시보드로 이동] 버튼 |

---

## [Hotfix #3] 대시보드 DB 미설정 방어

> **상태**: ✅ 수정 완료

### 증상

대시보드에서 프로젝트 생성, 미팅 목록 조회 등 모든 DB 쿼리 실패

### 수정 내역

| 파일 | 변경 |
|------|------|
| `dashboard/page.tsx` | 각 fetch에 try-catch + `dbReady` 상태 → 미설정 시 안내 배너 표시 |
