# Contexta (컨텍스타)

> B2B 영업대표를 위한 **실시간 AI 미팅 코파일럿** 웹 서비스

---

## 서비스 소개

Contexta는 B2B 영업/컨설팅 미팅 중 **실시간으로 AI 코칭 힌트와 문맥 요약**을 제공하는 웹 서비스입니다.

기존의 회의록/STT 앱이 미팅 종료 후 '사후 기록'에만 치중하는 것과 달리, Contexta는 **미팅이 진행되는 바로 그 순간** 영업대표에게 필요한 정보를 제공합니다.

### 핵심 차별점

- **실시간 AI 힌트**: 5분 주기로 대화를 요약하고, 화제 전환 및 대응 힌트를 파스텔 블루 박스로 즉시 노출
- **클라이언트 모드 (위장 기능)**: 단축키(`Ctrl+Space`) 입력 시 애니메이션 없이 회색 메모장으로 **즉시 전환** — 고객 대면 시 완벽한 신뢰 유지
- **2단 스플릿 뷰**: 좌측(AI 요약+힌트) / 우측(메모장+용어사전) 7:3 비율 화면 구성
- **모듈형 회의록**: 미팅 종료 후 AI가 사용자 맞춤형 양식으로 회의록 자동 생성

### 타겟 고객

영업자, 컨설턴트, 기획자 등 **미팅의 퀄리티가 KPI와 직결**되는 B2B 전문가 집단

---

## 기술 스택

| 영역 | 기술 |
|------|------|
| **프론트엔드** | Next.js 16 (App Router) + React 19 + TypeScript |
| **스타일링** | Tailwind CSS 4 |
| **백엔드** | Next.js API Routes |
| **데이터베이스** | Supabase (PostgreSQL + Vector Search) |
| **실시간 STT** | Deepgram Nova-2 |
| **사후 STT** | 네이버 CLOVA Speech API |
| **실시간 AI** | Claude 3.5 Haiku |
| **회의록 AI** | Claude 3.7 Sonnet (Thinking Mode) |
| **VAD** | Silero VAD (오픈소스) |

---

## 프로젝트 구조

```
contexta/
├── database/                     # DB 스키마
│   └── schema.sql                # Supabase 테이블 + RLS 정책
├── docs/                         # 기획 문서
│   └── planning.md               # 서비스 기획안
├── public/                       # 정적 에셋
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── (auth)/login/         # 구글 소셜 로그인 페이지
│   │   ├── dashboard/            # 대시보드 (로그인 후 메인)
│   │   ├── meeting/              # 미팅 진행 페이지
│   │   ├── review/[id]/          # 미팅 리뷰 페이지
│   │   ├── settings/             # 설정 페이지
│   │   ├── api/                  # API Routes
│   │   │   ├── stt/              # Deepgram STT 프록시 API
│   │   │   ├── hint/             # Claude Haiku 힌트 생성 API
│   │   │   └── summary/          # Claude Sonnet 최종 회의록 API
│   │   ├── layout.tsx            # 루트 레이아웃 (AuthProvider 래핑)
│   │   ├── page.tsx              # 랜딩 페이지
│   │   └── globals.css           # 전역 스타일
│   ├── components/               # 재사용 컴포넌트
│   │   ├── providers/            # Context/Provider 컴포넌트
│   │   │   └── AuthProvider.tsx  # Supabase 인증 상태 리스너
│   │   └── meeting/              # 미팅 전용 컴포넌트
│   │       ├── TopBar.tsx        # 상단 바 (제목, 타이머, 버튼, DB 저장)
│   │       ├── SummaryBlock.tsx  # 5분 단위 요약 블록
│   │       ├── AiHint.tsx        # AI 코칭 힌트 (파스텔 블루)
│   │       ├── LiveNotepad.tsx   # 라이브 메모장
│   │       ├── GlossaryCard.tsx  # IT 용어 사전 카드
│   │       ├── ClientModeOverlay.tsx  # 위장 메모장 오버레이
│   │       └── PostMeetingResult.tsx # 미팅 종료 회의록 모달
│   ├── hooks/                    # 커스텀 훅
│   │   ├── useAudioRecorder.ts  # 마이크 녹음 + VAD + STT 전송
│   │   ├── useAiHint.ts         # AI 힌트 수동/자동 호출
│   │   └── useMeetingTimer.ts   # 미팅 경과 시간 카운터
│   ├── store/                    # Zustand 글로벌 상태 관리
│   │   ├── useMeetingStore.ts   # 미팅 상태 (녹음, VAD, STT, 회의록)
│   │   └── useAuthStore.ts      # 인증 상태 (user, isLoading)
│   ├── utils/                    # 유틸리티 함수
│   │   ├── supabaseClient.ts    # Supabase 클라이언트 싱글턴
│   │   └── exportUtils.ts       # TXT 다운로드 + 클립보드 복사
│   ├── middleware.ts             # 라우트 보호 Edge Middleware
│   ├── lib/                      # 라이브러리 설정
│   ├── types/                    # TypeScript 타입 정의
│   └── constants/                # 상수 (설정값, 테마 색상)
├── .env.local.example            # 환경변수 템플릿
├── rules.md                      # 개발 규칙 및 컨벤션
├── package.json
├── tsconfig.json
├── next.config.ts
└── tailwind.config.ts
```

---

## 로컬 개발 환경 설정

```bash
# 1. 저장소 클론
git clone https://github.com/jaimo012/contexta.git
cd contexta

# 2. 의존성 설치
npm install

# 3. 환경변수 설정
cp .env.local.example .env.local
# .env.local 파일을 열어 각 API 키를 입력하세요

# 4. 개발 서버 실행
npm run dev
```

브라우저에서 `http://localhost:3000` 접속

---

## 수익 모델

| 요금제 | 가격 (월) | 제공 시간 |
|--------|----------|----------|
| **Free** (미끼 상품) | 0원 | 기본 1시간 (미션으로 최대 3시간) |
| **Basic** (라이트 유저) | 19,900원 | 5시간 |
| **Pro** (하드 유저) | 49,900원 | 무제한 |

---

## 개발 진행 상황

### Phase 0: 프로젝트 초기 설정 ✅

- [x] Next.js 16 (App Router) + Tailwind CSS 4 + TypeScript 프로젝트 초기화
- [x] 기획안 기반 폴더 구조 설계 및 생성
- [x] 핵심 컴포넌트 플레이스홀더 작성 (SplitView, HintPanel, MemoPanel, ClientModeOverlay 등)
- [x] TypeScript 타입 정의 (Meeting, User, AI 관련 인터페이스)
- [x] 커스텀 훅 작성 (useClientMode, useRecording, useMeeting)
- [x] API Routes 플레이스홀더 구성 (auth, meeting, stt, ai)
- [x] 디자인 시스템 상수 정의 (테마 색상, 앱 설정)
- [x] 환경변수 템플릿 (.env.local.example) 작성
- [x] README.md 및 rules.md 작성
- [x] GitHub 첫 커밋 및 푸시

### Phase 1: 정적 UI/UX 퍼블리싱 완료 ✅

미팅 진행 화면(`/meeting`)의 전체 정적 레이아웃과 핵심 인터랙션을 구현했습니다.

- [x] **`/meeting` 풀스크린 라우트** — `h-screen w-screen overflow-hidden` 스크롤 없는 대시보드 컨테이너
- [x] **Zustand 글로벌 상태 관리** — `isRecording`, `isClientMode`, `meetingTime` 3가지 상태 및 액션 정의 (`store/useMeetingStore.ts`)
- [x] **TopBar 컴포넌트** — 좌측 미팅 제목, 중앙 `00:00:00` 타이머 (Zustand 연동), 우측 [힌트 줘] / [녹음 시작] 버튼
- [x] **7:3 스플릿 뷰 레이아웃** — 좌측 70% (실시간 요약 영역) / 우측 30% (메모·사전 영역), `flex-row` + 퍼센트 기반 분할
- [x] **SummaryBlock 컴포넌트** — 5분 단위 대화 요약 블록, 노션 스타일 깔끔한 텍스트 UI, 더미 데이터 3건 렌더링
- [x] **AiHint 인라인 컴포넌트** — 파스텔 블루(`bg-blue-50`) 배경 + 💡 아이콘, 요약 블록 하단에 코칭 힌트 표시
- [x] **LiveNotepad 컴포넌트** — 우측 상단, `textarea` 기반 자유 입력 메모장 (`useState` 연동)
- [x] **GlossaryCard 컴포넌트** — 우측 하단, IT 용어 사전 카드 리스트 (용어명 + 1줄 설명), 더미 데이터 2건
- [x] **ClientModeOverlay (위장 화면)** — `Ctrl+Space` 단축키로 즉시 토글, `fixed inset-0 z-50` 전체 화면 덮기, CSS transition/animation **완전 제거**, 윈도우 메모장 위장 UI
- [x] TopBar 반응형 패딩/폰트 보강 (`md:` 브레이크포인트)

#### 생성된 컴포넌트 목록

| 컴포넌트 | 경로 | 역할 |
|---------|------|------|
| TopBar | `components/meeting/TopBar.tsx` | 미팅 제목 + 타이머 + 액션 버튼 |
| SummaryBlock | `components/meeting/SummaryBlock.tsx` | 5분 단위 대화 요약 블록 |
| AiHint | `components/meeting/AiHint.tsx` | 파스텔 블루 AI 코칭 힌트 |
| LiveNotepad | `components/meeting/LiveNotepad.tsx` | 실시간 자유 입력 메모장 |
| GlossaryCard | `components/meeting/GlossaryCard.tsx` | IT 용어 사전 카드 |
| ClientModeOverlay | `components/meeting/ClientModeOverlay.tsx` | 위장 메모장 (보안 핵심) |

### Phase 2: 브라우저 마이크 제어 및 VAD 연동 완료 ✅

브라우저 Web Audio API를 활용하여 마이크 녹음, 실시간 음성 활성 감지(VAD), 무음 구간 자동 폐기 파이프라인을 구축했습니다.

- [x] **Zustand 오디오 상태 확장** — `isMicGranted`, `isSpeaking`, `audioChunks` 3개 상태 + `setMicGranted`, `setIsSpeaking`, `addAudioChunk`, `clearAudioChunks` 4개 액션 추가
- [x] **useAudioRecorder 훅** — 마이크 권한 획득(`getUserMedia`), MediaRecorder 1초 단위 청크 수집, 권한 거부 시 사용자 알림 처리
- [x] **AnalyserNode 실시간 음성 분석** — `AudioContext` → `createMediaStreamSource` → `createAnalyser(fftSize: 512)` 파이프라인, 스피커 출력 연결 없음 (하울링 방지)
- [x] **VAD 볼륨 쓰레시홀드 로직** — `requestAnimationFrame` 루프로 매 프레임 주파수 데이터 분석, 평균 볼륨 18 이상 → `isSpeaking: true`, 1.5초 이상 무음 지속 → `isSpeaking: false` (디바운스)
- [x] **무음 구간 데이터 폐기** — `ondataavailable` 콜백에서 `isSpeaking` 상태를 `getState()`로 실시간 조회, 음성 구간만 `audioChunks`에 저장 (침묵 시 Blob 버림)
- [x] **useMeetingTimer 훅** — `setInterval` 기반 1초 카운터, `startTimer`/`stopTimer`/`resetTimer` 3개 컨트롤, 언마운트 시 `clearInterval` 메모리 릭 방지
- [x] **TopBar 버튼 기능 연결** — [녹음 시작] 클릭 시 `startRecording()` + `startTimer()` 동시 실행, [녹음 종료] 시 양쪽 모두 정지, 타이머 `00:00:00` 실시간 카운트
- [x] **VAD 인디케이터** — 타이머 옆 초록색 점(pulse), 음성 감지 시 깜빡임 / 무음 시 회색 정지
- [x] **리소스 클린업** — `stopRecording` 시 MediaRecorder 종료 → 마이크 트랙 전체 해제 → AudioContext 닫기 → rAF 루프 취소 → 모든 ref 초기화

#### 오디오 파이프라인 구조

```
마이크 → getUserMedia(stream)
         ├→ MediaRecorder.start(1000) → ondataavailable → [isSpeaking?] → audioChunks[]
         └→ AudioContext
              └→ MediaStreamSource → AnalyserNode(fftSize:512)
                                      └→ rAF loop → getByteFrequencyData → 평균 볼륨 계산
                                                     ├→ >= 18 → isSpeaking: true
                                                     └→ < 18 (1.5s 지속) → isSpeaking: false
```

#### 생성된 훅 목록

| 훅 | 경로 | 역할 |
|----|------|------|
| useAudioRecorder | `hooks/useAudioRecorder.ts` | 마이크 녹음 + AnalyserNode + VAD 무음 커트 |
| useMeetingTimer | `hooks/useMeetingTimer.ts` | 미팅 경과 시간 1초 카운터 |

### Phase 3: 실시간 AI 파이프라인 연동 완료 ✅

Deepgram STT와 Claude Haiku LLM을 Next.js API Routes로 연동하고, 프론트엔드에서 실시간 데이터를 화면에 렌더링하는 전체 파이프라인을 구축했습니다.

- [x] **환경변수 세팅** — `.env.local`에 `DEEPGRAM_API_KEY`, `ANTHROPIC_API_KEY` 설정, `.env.local.example` 템플릿 동기화
- [x] **Zustand 스토어 확장** — `transcripts`(변환 텍스트 배열), `hints`(AI 힌트 배열) 상태 + `addTranscript`, `addHint` 액션 추가
- [x] **STT API Route (`/api/stt`)** — `@deepgram/sdk` 활용, FormData로 오디오 Blob 수신 → Deepgram Nova-2 (한국어) → 텍스트 JSON 응답, 4가지 에러 케이스 처리
- [x] **LLM Hint API Route (`/api/hint`)** — `@anthropic-ai/sdk` 활용, 누적 대화 텍스트 수신 → Claude 3.5 Haiku → 1문장 코칭 힌트 JSON 응답
- [x] **프론트엔드 STT 전송** — `useAudioRecorder` 내 `sendChunkToSTT` 함수, VAD 통과 청크를 즉시 `/api/stt`로 POST, 중복 전송 방지(`isSendingRef`), 응답 텍스트 → `addTranscript`
- [x] **useAiHint 훅 (수동+자동)** — [힌트 줘] 버튼 클릭 시 수동 호출, 새 transcript 후 3초 무음 디바운스 자동 호출, 5분 주기 자동 호출, 중복 방지(`isFetchingRef`)
- [x] **실시간 UI 렌더링** — 더미 데이터 전부 제거, `transcripts` → `SummaryBlock`, `hints` → `AiHint`로 실시간 `map` 렌더링, 데이터 없을 때 상태별 안내 문구
- [x] **오토 스크롤** — `useRef` + `scrollIntoView({ behavior: "smooth" })`로 새 데이터 추가 시 좌측 패널 자동 하단 스크롤

#### 전체 데이터 흐름

```
[녹음 시작] → 마이크 → MediaRecorder (1초 단위)
              ↓
         VAD 필터 (isSpeaking?)
              ↓ (음성만 통과)
         /api/stt (Deepgram Nova-2 한국어)
              ↓
         addTranscript → 좌측 SummaryBlock 렌더링
              ↓
         3초 무음 감지 or [힌트 줘] 클릭 or 5분 경과
              ↓
         /api/hint (Claude 3.5 Haiku)
              ↓
         addHint → 좌측 AiHint(파스텔 블루) 렌더링
              ↓
         오토 스크롤 ↓↓↓
```

#### Phase 3에서 생성/수정된 파일

| 파일 | 경로 | 역할 |
|------|------|------|
| STT API | `app/api/stt/route.ts` | Deepgram 프록시 (음성→텍스트) |
| Hint API | `app/api/hint/route.ts` | Claude Haiku 프록시 (텍스트→힌트) |
| useAiHint | `hooks/useAiHint.ts` | 힌트 수동/자동 호출 훅 |
| useAudioRecorder | `hooks/useAudioRecorder.ts` | STT 전송 로직 추가 |
| useMeetingStore | `store/useMeetingStore.ts` | transcripts/hints 상태 확장 |
| MeetingPage | `app/meeting/page.tsx` | 실데이터 렌더링 + 오토스크롤 |

### Phase 4: 사후 요약 및 내보내기 완료 ✅

미팅 종료 후 전체 대화를 Claude 3.7 Sonnet으로 분석하여 4-모듈 마크다운 회의록을 자동 생성하고, 결과를 확인·내보내기할 수 있는 Post-meeting UI를 구축했습니다.

- [x] **Zustand 미팅 종료 상태 확장** — `isMeetingEnded`, `isGeneratingMinutes`, `finalMinutes` 3개 상태 + `setMeetingEnded`, `setIsGeneratingMinutes`, `setFinalMinutes` 3개 액션 추가
- [x] **Summary API Route (`/api/summary`)** — `@anthropic-ai/sdk` 활용, 전체 대화 스크립트(`fullTranscript`) 수신 → Claude 3.7 Sonnet(`claude-3-7-sonnet-20250219`) → 4-모듈 마크다운 회의록 생성 (회의 개요 / 핵심 요약 / 주요 논의 사항 / Next Action Item)
- [x] **미팅 종료 트리거** — TopBar [⏹ 녹음 종료] 클릭 시 `stopRecording` + `stopTimer` + `setMeetingEnded(true)` → 전체 `transcripts` 합산 → `/api/summary` POST → `setFinalMinutes(결과)` → `setIsGeneratingMinutes(false)` 파이프라인
- [x] **PostMeetingResult 모달** — `isMeetingEnded: true` 시 z-40 오버레이 렌더링, 로딩 중 CSS 스피너 + 안내 문구, 완료 시 `react-markdown`으로 마크다운 → HTML 렌더링 (Tailwind `prose` 타이포그래피 적용)
- [x] **Export 유틸리티** — `utils/exportUtils.ts`에 `downloadAsTxt(filename, content)` TXT 다운로드 함수 + `copyToClipboard(content)` 클립보드 복사 함수 분리, 예외 처리 포함
- [x] **하단 액션 버튼** — [📋 클립보드 복사] + [📄 TXT 다운로드] 버튼을 PostMeetingResult 하단에 배치, `exportUtils` 유틸과 연결
- [x] **z-index 계층 관리** — ClientModeOverlay(z-50) > PostMeetingResult(z-40) > 일반 UI, 클라이언트 모드 시 회의록 모달도 완전히 은폐

#### 미팅 종료 파이프라인 구조

```
[⏹ 녹음 종료] 클릭
     ↓
stopRecording() + stopTimer()
     ↓
setMeetingEnded(true) → PostMeetingResult 모달 표시
     ↓
transcripts.map(t => t.text).join("\n") → fullTranscript 생성
     ↓
setIsGeneratingMinutes(true) → 로딩 스피너 표시
     ↓
POST /api/summary { fullTranscript }
     ↓
Claude 3.7 Sonnet → 4-모듈 마크다운 회의록 생성
     ↓
setFinalMinutes(minutes) → react-markdown 렌더링
setIsGeneratingMinutes(false) → 로딩 종료
     ↓
[📋 복사] / [📄 다운로드] 액션 가능
```

#### Phase 4에서 생성/수정된 파일

| 파일 | 경로 | 역할 |
|------|------|------|
| Summary API | `app/api/summary/route.ts` | Claude 3.7 Sonnet 회의록 생성 프록시 |
| PostMeetingResult | `components/meeting/PostMeetingResult.tsx` | 미팅 종료 모달 (로딩/회의록/액션) |
| exportUtils | `utils/exportUtils.ts` | TXT 다운로드 + 클립보드 복사 유틸 |
| TopBar | `components/meeting/TopBar.tsx` | 녹음 종료 → 회의록 생성 파이프라인 연결 |
| useMeetingStore | `store/useMeetingStore.ts` | 미팅 종료 3개 상태/액션 확장 |
| MeetingPage | `app/meeting/page.tsx` | PostMeetingResult 컴포넌트 배치 |

### Phase 5: Supabase 연동, 소셜 로그인 및 데이터 영구 저장 완료 ✅

Supabase를 활용한 구글 소셜 로그인, 라우트 보호 미들웨어, 대시보드 UI, 그리고 미팅 종료 시 회의록을 DB에 영구 저장하는 전체 인증·데이터 파이프라인을 구축했습니다.

- [x] **Supabase SDK 세팅** — `@supabase/supabase-js` 설치, `utils/supabaseClient.ts`에서 `createClient` 싱글턴 인스턴스 생성, 환경변수 미설정 시 즉시 에러 throw 안전장치
- [x] **DB 스키마 SQL** — `database/schema.sql`에 `users` 테이블(id, email, display_name, created_at)과 `meetings` 테이블(id, user_id, title, transcript, summary, created_at) 정의, `user_id` 인덱스 생성
- [x] **Row Level Security (RLS)** — 양 테이블에 RLS 활성화, `auth.uid() = id/user_id` 조건의 SELECT/INSERT/UPDATE/DELETE 정책으로 사용자별 데이터 격리
- [x] **구글 소셜 로그인** — `app/(auth)/login/page.tsx`에서 `supabase.auth.signInWithOAuth({ provider: "google" })` 호출, 인라인 SVG 구글 G 로고, 로그인 성공 시 `/meeting`으로 리다이렉트
- [x] **글로벌 인증 상태 관리** — `store/useAuthStore.ts`(Zustand)에 `user: User | null` + `isLoading` 상태, `components/providers/AuthProvider.tsx`에서 `onAuthStateChange` 리스너로 실시간 동기화, `app/layout.tsx`에 Provider 래핑
- [x] **라우트 보호 미들웨어** — `src/middleware.ts`에서 `@supabase/ssr`의 `createServerClient`로 Edge Runtime 쿠키 기반 세션 검증, `/meeting`·`/dashboard` 미인증 접근 시 `/login?redirectTo=...`으로 리다이렉트
- [x] **대시보드 페이지** — `app/dashboard/page.tsx`에 유저명 표시, 로그아웃 버튼, [🚀 새 미팅 시작하기] CTA, 최근 미팅 내역 카드 리스트(더미 3건), 로딩 스피너 처리
- [x] **회의록 DB 영구 저장** — TopBar `handleStop` → Claude 회의록 생성 완료 직후 `supabase.from("meetings").insert(...)` 호출, `user_id`·`title`·`transcript`·`summary` 저장, 성공 시 alert + `isSavedToDb: true`
- [x] **대시보드 복귀 버튼** — PostMeetingResult 하단에 `isSavedToDb === true` 시 [← 대시보드로 돌아가기] `Link` 활성화

#### 사용자 여정 전체 흐름

```
/login → [구글 계정으로 시작하기]
     ↓
Supabase OAuth → 구글 동의 → 세션 발급 → /meeting 리다이렉트
     ↓
/meeting → [🔴 녹음 시작] → VAD + STT + 힌트
     ↓
[⏹ 녹음 종료] → Claude 3.7 회의록 생성
     ↓
supabase.from("meetings").insert(...) → DB 영구 저장
     ↓
PostMeetingResult 모달 → [복사] / [다운로드] / [← 대시보드]
     ↓
/dashboard → 미팅 내역 확인 → [🚀 새 미팅] 또는 [로그아웃]
```

#### 보안 계층 구조

| 계층 | 도구 | 역할 |
|------|------|------|
| Edge Middleware | `middleware.ts` + `@supabase/ssr` | 서버 사이드 세션 토큰 검증, 미인증 리다이렉트 |
| 클라이언트 상태 | `AuthProvider` + `useAuthStore` | 브라우저 인증 상태 실시간 동기화 |
| DB 수준 | Supabase RLS | `auth.uid() = user_id` 정책으로 데이터 격리 |

#### Phase 5에서 생성/수정된 파일

| 파일 | 경로 | 역할 |
|------|------|------|
| supabaseClient | `utils/supabaseClient.ts` | Supabase 클라이언트 싱글턴 |
| schema.sql | `database/schema.sql` | DB 테이블 + RLS 정의 |
| LoginPage | `app/(auth)/login/page.tsx` | 구글 소셜 로그인 UI |
| useAuthStore | `store/useAuthStore.ts` | 글로벌 인증 상태 (Zustand) |
| AuthProvider | `components/providers/AuthProvider.tsx` | 인증 리스너 Provider |
| middleware | `src/middleware.ts` | 라우트 보호 Edge Middleware |
| DashboardPage | `app/dashboard/page.tsx` | 로그인 후 메인 대시보드 |
| TopBar | `components/meeting/TopBar.tsx` | DB 저장 로직 추가 |
| PostMeetingResult | `components/meeting/PostMeetingResult.tsx` | 대시보드 복귀 버튼 추가 |
| useMeetingStore | `store/useMeetingStore.ts` | `isSavedToDb` 상태 추가 |
| layout.tsx | `app/layout.tsx` | AuthProvider 래핑 |

---

## 라이선스

Private - All Rights Reserved
