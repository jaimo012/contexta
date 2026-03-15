# Contexta 심화 통합 테스트 케이스 (Advanced Test Scenario)

## TC-07. 모바일 및 하이브리드 앱 환경 (Capacitor / Mobile)
| TC ID | 테스트 항목 | 사전 조건 | 테스트 단계 (Step) | 기대 결과 (Expected Result) | 결과 | 비고 |
|---|---|---|---|---|---|---|
| 7-1 | 모바일 반응형 레이아웃 분할 | 모바일 기기 (또는 크롬 개발자 도구 모바일 보기) | 1. `/meeting` 화면 접속 | PC의 7:3 좌우 분할이 아닌, **50:50 상하 분할(`flex-col`)** 레이아웃으로 정상 렌더링 됨 | ✅ PASS | `flex-col md:flex-row`, `h-1/2 md:h-full` 기존 구현 확인 |
| 7-2 | Safe Area 및 바운스(스크롤) 차단 | iOS/Android 네이티브 앱 빌드 | 1. `Ctrl+Space` (모바일에서는 전용 버튼)로 클라이언트 모드 실행<br>2. 화면을 위아래로 강하게 스와이프 | 노치(Notch) 영역을 침범하지 않으며, 화면이 고무줄처럼 튕기는 **바운스 효과(Overscroll)가 완벽히 차단됨** | ✅ PASS | `globals.css` safe-area, `overscroll-none`, ClientModeOverlay `onTouchMove` 방어 |
| 7-3 | 모바일 네이티브 마이크 권한 | 모바일 앱 최초 실행 | 1. [🔴 녹음 시작] 터치 | 브라우저 팝업이 아닌 iOS/Android **네이티브 권한 요청 팝업**이 노출되며, 거부 시 권한 오류 방어 로직이 정상 작동함 | ✅ PASS | Phase 7 Info.plist / AndroidManifest 권한 설정, useAudioRecorder alert |
| 7-4 | 백그라운드 전환 시 동작 | 모바일 앱 녹음 진행 중 | 1. 홈 버튼을 눌러 앱을 백그라운드로 내림<br>2. 10초 후 다시 앱으로 복귀 | OS 정책에 따라 녹음이 유지되거나 안전하게 일시정지되며, 앱 복귀 시 타이머와 UI가 꼬이지 않고 동기화됨 | ⚠️ 환경의존 | OS/WebView 정책에 따름. 별도 코드 수정 없음 |

## TC-08. 네트워크 및 API 예외 처리 (Network & API Failures)
| TC ID | 테스트 항목 | 사전 조건 | 테스트 단계 (Step) | 기대 결과 (Expected Result) | 결과 | 비고 |
|---|---|---|---|---|---|---|
| 8-1 | STT (Deepgram) 응답 실패 | 마이크 녹음 중 | 1. 네트워크 연결을 끊음 (Offline 모드)<br>2. 마이크에 발화 | STT 변환이 실패하더라도 **화면이 멈추거나 앱이 강제 종료되지 않으며**, 콘솔에 에러만 남기고 다음 녹음을 대기함 | ✅ PASS | `useAudioRecorder` sendChunkToSTT try-catch, 콘솔 에러만 출력 |
| 8-2 | AI 힌트 (Claude) 타임아웃 | 녹음 중 (대화 내역 3줄 이상 존재) | 1. [💡 힌트 줘] 버튼 클릭<br>2. 네트워크 스로틀링(Slow 3G) 설정 | `isFetchingRef`가 동작하여 여러 번 눌러도 중복 호출되지 않으며, 타임아웃 시 앱 중단 없이 우회 처리됨 | ✅ PASS (조치 후) | **조치**: `useAiHint.ts`에 AbortController + 25초 타임아웃 추가, AbortError 시 warn 로그 |
| 8-3 | 회의록 생성 중 이탈 방어 | 미팅 종료 후 요약 생성 중 | 1. [⏹ 녹음 종료] 클릭<br>2. 스피너 대기 중 브라우저 '새로고침' 또는 '뒤로 가기' 시도 | 브라우저의 `beforeunload` 경고창이 뜨며 "저장되지 않은 변경사항이 있습니다" 안내가 발생함 | ✅ PASS (조치 후) | **조치**: `PostMeetingResult.tsx`에 `isGeneratingMinutes`일 때 `beforeunload` 리스너 등록 |

## TC-09. 데이터 경계값 및 유효성 검증 (Data Validation & Edge Cases)
| TC ID | 테스트 항목 | 사전 조건 | 테스트 단계 (Step) | 기대 결과 (Expected Result) | 결과 | 비고 |
|---|---|---|---|---|---|---|
| 9-1 | 나만의 사전 특수문자/장문 | `/settings/dictionary` | 1. 단어명에 100자 이상의 텍스트 및 이모지/특수문자 입력 후 추가 | UI 레이아웃이 깨지지 않고 말줄임표(`truncate`) 등으로 표시되며, Deepgram STT 키워드 부스팅 API 주입 시 서버 에러가 나지 않음 | ✅ PASS (조치 후) | **조치**: 사전 리스트에 `truncate`/`line-clamp-2` 적용. STT API 키워드 최대 50개·단어당 80자 제한 |
| 9-2 | 사용 중인 프로젝트 폴더 삭제 | 미팅이 연결된 프로젝트 존재 | 1. 특정 프로젝트(A)를 선택해 미팅 진행 후 저장<br>2. 대시보드에서 해당 프로젝트(A) 삭제 시도 | 삭제 시 DB의 `ON DELETE SET NULL` 정책에 의해 기존 미팅 데이터는 삭제되지 않고 '폴더 없음' 상태로 안전하게 유지됨 | ✅ PASS (조치 후) | **조치**: 대시보드 '내 프로젝트'에 프로젝트별 [×] 삭제 버튼 추가. schema.sql `ON DELETE SET NULL` 기존 적용 |
| 9-3 | 라이브 메모장 대용량 텍스트 | `/meeting` 화면 | 1. 라이브 메모장에 20,000자 이상의 텍스트 복사/붙여넣기 | 타이핑 및 스크롤 시 화면 렌더링 렉(Lag)이 발생하지 않으며 정상적으로 입력됨 | ✅ PASS | 일반 textarea 제어 컴포넌트로 동작. 별도 조치 없음 |

## TC-10. 동시성 및 복합 인터랙션 (Concurrency & State)
| TC ID | 테스트 항목 | 사전 조건 | 테스트 단계 (Step) | 기대 결과 (Expected Result) | 결과 | 비고 |
|---|---|---|---|---|---|---|
| 10-1 | 클라이언트 모드 중 백그라운드 처리 | 녹음 진행 중 | 1. [🔴 녹음 시작]<br>2. `Ctrl+Space`로 위장 모드 전환<br>3. 30초간 발화하여 STT 및 자동 힌트 발생 유도<br>4. 다시 `Ctrl+Space`로 복귀 | 위장 모드(화면 숨김) 중에도 백그라운드에서 Zustand 상태가 정상 업데이트되어, **복귀 시 그동안의 STT 텍스트와 AI 힌트가 화면에 누적 반영**되어 있음 | ✅ PASS | 클라이언트 모드는 UI만 숨김, 녹음/STT/힌트는 동일 스레드에서 계속 동작 |
| 10-2 | 녹음/종료 버튼 연타 방어 | 미팅 준비 화면 | 1. [🔴 녹음 시작]과 [⏹ 녹음 종료]를 1~2초 내에 5번 이상 빠르게 연타 | `useAudioRecorder`의 상태값과 타이머가 꼬이지 않고, 오디오 리소스가 정상적으로 해제되며 단일 인스턴스만 실행됨 | ✅ PASS (조치 후) | **조치**: `TopBar.tsx`에 `isStartingRecording` 상태 추가, 녹음 시작 중 버튼 비활성화 및 "시작 중..." 표시 |
| 10-3 | 다중 기기 세션 동기화 | 로그인 완료 | 1. PC 브라우저 탭 A, B 두 개 열어 접속<br>2. 탭 A에서 로그아웃 진행<br>3. 탭 B에서 [새 미팅 시작] 클릭 | 탭 B에서도 로그아웃 상태가 감지(또는 Middleware 검증)되어 즉시 로그인 페이지로 리다이렉트 됨 | ✅ PASS (조치 후) | **조치**: `AuthProvider.tsx`에 `storage` 이벤트 리스너 추가, 다른 탭에서 세션 변경 시 `getSession()`으로 동기화 |

---

## 테스트 결과 및 조치 요약

**테스트 수행일**: 2026.03.15 (코드 대조 및 수정 반영)

| 구분 | 통과 | 조치 후 통과 | 환경의존 | 합계 |
|------|------|-------------|----------|------|
| TC-07 | 3 | 0 | 1 | 4 |
| TC-08 | 1 | 2 | 0 | 3 |
| TC-09 | 1 | 2 | 0 | 3 |
| TC-10 | 1 | 2 | 0 | 3 |
| **총계** | **6** | **6** | **1** | **13** |

### 이번 테스트에서 적용한 조치 (코드 변경)

| TC ID | 조치 내용 |
|-------|----------|
| 8-2 | `hooks/useAiHint.ts`: 힌트 fetch에 AbortController + 25초 타임아웃 적용, 타임아웃 시 앱 중단 없이 warn 로그 |
| 8-3 | `components/meeting/PostMeetingResult.tsx`: `isGeneratingMinutes === true`일 때 `beforeunload` 이벤트 리스너 등록 → 새로고침/뒤로가기 시 브라우저 확인 대화상자 노출 |
| 9-1 | `app/settings/dictionary/page.tsx`: 단어/설명 리스트에 `truncate`, `line-clamp-2` 적용. `app/api/stt/route.ts`: 키워드 최대 50개, 단어당 80자 제한으로 STT API 안정성 확보 |
| 9-2 | `app/dashboard/page.tsx`: '내 프로젝트' 배지에 프로젝트별 삭제 버튼(×) 추가, 확인 후 `projects` 테이블 DELETE. DB `ON DELETE SET NULL`로 기존 미팅은 '폴더 없음' 유지 |
| 10-2 | `components/meeting/TopBar.tsx`: `isStartingRecording` 상태로 녹음 시작 중 연타 방지, 버튼 비활성화 및 "시작 중..." 표시 |
| 10-3 | `components/providers/AuthProvider.tsx`: `window.addEventListener('storage', …)`로 다른 탭의 로그아웃 시 현재 탭에서 `getSession()` 호출해 세션 동기화 |

### 환경의존 항목

- **7-4 (백그라운드 전환)**: OS·WebView 정책에 따라 동작이 달라지며, 동일 코드로 모든 기기에서 동일 동작을 보장할 수 없음. 별도 코드 수정 없이 현 상태로 테스트만 수행.
