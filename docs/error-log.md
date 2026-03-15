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

### 코드 측 방어 처리 (전수 조사 완료)

| 파일 | 방어 방식 | 상태 |
|------|----------|------|
| `useMeetingTimer.ts` | 서킷 브레이커 — RPC → 직접 UPDATE → 3회 연속 실패 시 DB 동기화 비활성화 | ✅ |
| `AuthProvider.tsx` | `ensurePublicUserRow()` — 로그인 시 public.users 행 자동 upsert | ✅ |
| `dashboard/page.tsx` | 각 fetch에 error 체크 + `dbReady` 상태 → 미설정 시 안내 배너 | ✅ |
| `settings/dictionary/page.tsx` | fetchWords error 체크 + `dbReady` 상태 → 미설정 시 안내 배너, CRUD alert 개선 | ✅ |
| `TopBar.tsx` | fetchProjects error 체크 + warn 로그, saveMeetingToDb alert에 schema.sql 안내 포함 | ✅ |
| `api/stt/route.ts` | getUserKeywords 전체 try-catch 래핑, custom_words 조회 실패 시 빈 키워드 폴백 | ✅ |

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

---

## [예방] 전수 조사 — DB 미설정 시 에러 일괄 방어

> **상태**: ✅ 수정 완료
> **근거**: Hotfix #3과 동일한 패턴이 다른 파일에도 존재함을 확인

### 조사 범위

Supabase `.from()`, `.rpc()`, `.auth` 를 호출하는 **모든 파일**을 대상으로 DB 테이블/함수 미존재 시 에러가 전파되는지 검사.

### 조사 결과 (전체 파일 목록)

| 파일 | Supabase 호출 | 방어 상태 |
|------|-------------|----------|
| `useMeetingTimer.ts` | `.rpc()`, `.from("users")` | ✅ 기존 방어 완료 (서킷 브레이커) |
| `AuthProvider.tsx` | `.from("users")`, `.auth` | ✅ 기존 방어 완료 (ensurePublicUserRow catch) |
| `dashboard/page.tsx` | `.from("projects/meetings/users/custom_words")` | ✅ 기존 방어 완료 (dbReady 배너) |
| `settings/dictionary/page.tsx` | `.from("custom_words")` CRUD | ⚠️ → ✅ **이번에 수정** |
| `TopBar.tsx` | `.from("projects")`, `.from("meetings")` | ⚠️ → ✅ **이번에 수정** |
| `api/stt/route.ts` | `.from("custom_words")`, `.auth.getUser()` | ⚠️ → ✅ **이번에 수정** |
| `useAiHint.ts` | fetch API 호출만 (Supabase 직접 사용 없음) | ✅ try-catch 존재 |
| `useAudioRecorder.ts` | fetch API 호출만 (Supabase 직접 사용 없음) | ✅ try-catch 존재 |
| `login/page.tsx` | `.auth.signInWithOAuth` | ✅ error 체크 + alert 존재 |

### 수정 내역

| 파일 | 취약 지점 | 수정 내용 |
|------|----------|----------|
| `settings/dictionary/page.tsx` | `fetchWords` — error 미체크 | error 시 `dbReady(false)` + 안내 배너 표시 |
| `settings/dictionary/page.tsx` | `handleAdd` — alert 불명확 | schema.sql 실행 안내 문구 포함 |
| `settings/dictionary/page.tsx` | `handleDelete/Update` — alert 불명확 | DB 연결 확인 안내로 개선 |
| `TopBar.tsx` | `fetchProjects` — error 미체크 | error 시 warn 로그 + 조기 리턴 (프로젝트 드롭다운 비움) |
| `TopBar.tsx` | `saveMeetingToDb` — alert 불명확 | schema.sql 안내 + TXT/클립보드 대안 안내 |
| `api/stt/route.ts` | `getUserKeywords` — 예외 전파 위험 | 전체 try-catch + warn 로그 + 빈 배열 폴백 |
| `api/stt/route.ts` | `custom_words` select — error 미체크 | error 시 warn + 빈 배열 리턴 (STT 자체는 정상 동작) |

### 방어 원칙 정리

1. **Supabase `.from()` 쿼리는 반드시 `{ data, error }` 구조분해**하고 error를 체크할 것
2. **DB 조회 실패가 핵심 기능을 중단시키지 않도록** 폴백 처리 (빈 배열, 기본값)
3. **사용자가 원인을 알 수 있도록** alert에 `schema.sql 실행` 안내를 포함할 것
4. **서버 API Route에서는 try-catch로 감싸** 500 에러 대신 graceful degradation
5. **UI 페이지에는 `dbReady` 상태를 두어** 안내 배너를 표시할 것

---

## [TC 6-1] 마이크 권한 거부 시 타이머가 시작되는 버그

> **상태**: ✅ 수정 완료
> **발견 방법**: E2E 테스트 케이스 `260315_testing case.md` TC 6-1 코드 대조

### 증상

마이크 권한을 거부해도 타이머가 돌아감. 녹음은 안 되는데 시간만 차감되는 상태.

### 원인

`TopBar.tsx`의 `handleStart`에서 `startRecording()`이 async인데 **await 없이** 바로 `startTimer()`를 호출. 권한 거부와 무관하게 타이머 시작.

### 수정 내역

| 파일 | 변경 |
|------|------|
| `TopBar.tsx` | `handleStart`를 async로 변경, `await startRecording()` 후 `isRecording` 상태를 확인하여 성공 시에만 `startTimer()` 호출 |

---

## [TC 6-4] 사용 시간 초과 시 오디오 리소스 미해제

> **상태**: ✅ 수정 완료
> **발견 방법**: E2E 테스트 케이스 `260315_testing case.md` TC 6-4 코드 대조

### 증상

`used_seconds >= limit_seconds` 도달 시 타이머는 멈추지만, MediaRecorder/AudioContext/마이크 스트림이 해제되지 않아 브라우저 탭에 마이크 사용 표시가 계속 남음.

### 원인

`useMeetingTimer.ts`의 강제 종료 로직이 `setIsRecording(false)` (Zustand 상태값)만 변경하고, 실제 오디오 리소스를 정리하는 `stopRecording()`을 호출하지 않음.

### 수정 내역

| 파일 | 변경 |
|------|------|
| `useMeetingTimer.ts` | `onForceStop` 콜백 매개변수 추가. 시간 초과 시 `onForceStop()` 호출하여 외부에서 오디오 정리 가능 |
| `TopBar.tsx` | `useMeetingTimer(stopRecording)` — stopRecording을 콜백으로 전달하여 강제 종료 시 오디오 리소스 완전 해제 |
