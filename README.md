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
├── android/                      # Capacitor Android 네이티브 프로젝트
├── ios/                          # Capacitor iOS 네이티브 프로젝트
├── out/                          # Next.js Static Export 빌드 결과물
├── server/                       # API Routes (별도 서버 배포용)
│   └── api/
│       ├── stt/route.ts          # Deepgram STT 프록시 API
│       ├── hint/route.ts         # Claude Haiku 힌트 생성 API
│       ├── summary/route.ts      # Claude Sonnet 최종 회의록 API
│       ├── ai/route.ts           # AI 범용 API
│       ├── meeting/route.ts      # 미팅 CRUD API
│       └── auth/route.ts         # 인증 API
├── database/                     # DB 스키마
│   └── schema.sql                # Supabase 테이블 + RLS 정책
├── docs/                         # 기획 문서
│   ├── planning.md               # 서비스 기획안
│   └── error-log.md              # 오류 대응 로그
├── public/                       # 정적 에셋
├── src/
│   ├── app/                      # Next.js App Router (정적 페이지)
│   │   ├── (auth)/login/         # 구글 소셜 로그인 페이지
│   │   ├── dashboard/            # 대시보드 (AppShell + 최근 미팅)
│   │   ├── profile/              # 내 정보 페이지 (AppShell)
│   │   ├── settings/             # 설정 페이지 (AppShell)
│   │   │   └── dictionary/       # 나만의 용어 사전 CRUD (AppShell)
│   │   ├── meeting/              # 미팅 진행 페이지 (풀스크린, Shell 없음)
│   │   ├── onboarding/           # 온보딩 플로우 (풀스크린, Shell 없음)
│   │   ├── layout.tsx            # 루트 레이아웃 (Viewport + AuthProvider)
│   │   ├── page.tsx              # 랜딩 페이지
│   │   └── globals.css           # 전역 스타일 + Safe Area
│   ├── components/               # 재사용 컴포넌트
│   │   ├── providers/
│   │   │   ├── AuthProvider.tsx  # Supabase 인증 상태 리스너
│   │   │   └── AuthGuard.tsx     # 라우트 보호 (비로그인 시 /login 리다이렉트)
│   │   ├── layout/               # 공통 레이아웃 (UI 일관성)
│   │   │   ├── AppShell.tsx      # 좌측 사이드바 + 상단바 + 우측 캘린더 레이아웃
│   │   │   ├── MiniCalendar.tsx  # 미니 캘린더 (실데이터 + 예정 일정 표시)
│   │   │   └── UpcomingMeetingCard.tsx  # 다가오는 미팅 카드
│   │   └── meeting/
│   │       ├── TopBar.tsx        # 상단 바 (제목, 타이머, 버튼, DB 저장)
│   │       ├── SummaryBlock.tsx  # 5분 단위 요약 블록
│   │       ├── AiHint.tsx        # AI 코칭 힌트 (파스텔 블루)
│   │       ├── LiveNotepad.tsx   # 라이브 메모장
│   │       ├── GlossaryCard.tsx  # IT 용어 사전 카드
│   │       ├── ClientModeOverlay.tsx  # 위장 메모장 (Safe Area + 바운스 방지)
│   │       └── PostMeetingResult.tsx # 미팅 종료 회의록 모달
│   ├── hooks/                    # 커스텀 훅
│   │   ├── useAudioRecorder.ts  # 마이크 녹음 + VAD + STT (모바일 호환)
│   │   ├── useAiHint.ts         # AI 힌트 수동/자동 호출
│   │   └── useMeetingTimer.ts   # 미팅 경과 시간 카운터 + DB 동기화
│   ├── store/                    # Zustand 글로벌 상태 관리
│   │   ├── useMeetingStore.ts   # 미팅 상태 (녹음, VAD, STT, 회의록)
│   │   └── useAuthStore.ts      # 인증 상태 (user, isLoading)
│   ├── utils/                    # 유틸리티 함수
│   │   ├── supabaseClient.ts    # Supabase 클라이언트 (Lazy Init + Proxy)
│   │   ├── exportUtils.ts       # TXT 다운로드 + 클립보드 복사
│   │   └── apiUrl.ts            # API 서버 URL 동적 생성
│   ├── middleware.ts.bak         # 라우트 보호 (SSR 전용, 정적 빌드 시 비활성)
│   ├── lib/                      # 라이브러리 설정
│   ├── types/                    # TypeScript 타입 정의
│   └── constants/                # 상수 (설정값, 테마 색상)
├── capacitor.config.ts           # Capacitor 설정 (webDir: out)
├── .env.local.example            # 환경변수 템플릿
├── rules.md                      # 개발 규칙 및 컨벤션
├── package.json
├── tsconfig.json
└── next.config.ts                # Static Export + unoptimized images
```

---

## 공통 레이아웃 (AppShell)

Contexta의 모든 주요 페이지(대시보드, 내 정보, 설정, 내 사전)는 **AppShell** 공통 레이아웃으로 감싸져 있어 일관된 UX를 제공합니다.

### AppShell 구조

```
┌──────────┬───────────────────────────────┬──────────────┐
│  Left    │    Top Bar (제목 + 뒤로가기)   │  Right       │
│  Sidebar ├───────────────────────────────┤  Calendar    │
│  (240px) │                               │  Panel       │
│          │                               │  (288px)     │
│  - 로고   │      Main Content             │              │
│  - 검색   │      (페이지별 children)        │  - 미니      │
│  - 프로젝트│                               │   캘린더      │
│  - 미팅   │                               │  - 다가오는   │
│  - 내사전│                                 │   미팅       │
│  - 내정보│                                 │              │
│  - 설정  │                                 │              │
│  - 로그아웃│                               │              │
└──────────┴───────────────────────────────┴──────────────┘
```

### 핵심 특징

- **좌측 사이드바 상시 고정**: 대시보드/설정/사전/프로필 페이지 어디서든 동일한 네비게이션 — 현재 페이지에 해당하는 메뉴가 하이라이트됨
- **우측 캘린더 패널 상시 고정**: 모든 페이지에서 미니 캘린더 + 다가오는 미팅이 항상 보임 (lg 이상)
- **일관된 상단 바**: 페이지 제목은 좌측, 뒤로가기 버튼은 필요한 페이지에서 항상 같은 위치(제목 앞)에 노출
- **사이드바 접기 상태 유지**: localStorage에 저장되어 페이지 이동 후에도 유지
- **검색/필터 크로스-페이지**: 설정·사전·프로필 페이지에서 사이드바 검색 입력 시 자동으로 대시보드로 이동하며 필터가 적용됨
- **공유 데이터 소스**: 프로젝트/미팅/쿼터/예정된 미팅 등은 AppShell이 중앙에서 Supabase 조회 후 `useAppShell()` 훅을 통해 자식 페이지에 제공
- **풀스크린 예외**: `/meeting`(녹음 화면)과 `/onboarding`(최초 설정 플로우)은 AppShell을 사용하지 않음 — 몰입감 / 방해 최소화

### 사용 방법

```tsx
import AppShell, { useAppShell } from "@/components/layout/AppShell";

export default function MyPage() {
  return (
    <AppShell title="페이지 제목" showBackButton backHref="/dashboard">
      <MyContent />
    </AppShell>
  );
}

function MyContent() {
  // AppShell 자식은 useAppShell()로 공유 데이터 접근 가능
  const { meetings, projects, quota, searchQuery } = useAppShell();
  return <div>...</div>;
}
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

### Phase 6: 개인화 설정 및 무료 유저 락인 시스템 완료 ✅

프로젝트(폴더) 관리, 나만의 용어 사전 CRUD 및 STT 부스팅 연동, 사용 시간 제한과 게이미피케이션 미션 보상 시스템을 구축했습니다.

- [x] **DB 스키마 확장** — `projects` 테이블(폴더), `custom_words` 테이블(나만의 사전), `meetings.project_id` FK(nullable, ON DELETE SET NULL), `users.used_seconds`·`limit_seconds` 컬럼, `increment_used_seconds` RPC 함수, 전 테이블 RLS 정책 완비
- [x] **프로젝트(폴더) 관리** — 대시보드 [📁 새 프로젝트 생성] 모달 + Supabase INSERT, 프로젝트 뱃지 목록, 미팅 카드에 프로젝트 뱃지 표시
- [x] **미팅 TopBar 동적화** — 하드코딩 제목 → `input` 직접 입력, 프로젝트 `select` 드롭다운으로 폴더 할당, `saveMeetingToDb`에 `title`·`project_id` 반영
- [x] **나만의 사전 CRUD** — `/settings/dictionary` 페이지 신규 생성, 단어·설명 추가(INSERT), 인라인 수정(UPDATE), 확인 후 삭제(DELETE), 등록 개수 표시
- [x] **Deepgram STT 커스텀 키워드 부스팅** — `api/stt/route.ts`에서 서버 사이드 Supabase 쿠키 인증으로 유저 식별, `custom_words` 조회 → `keywords: ["단어:2"]` 형태로 Deepgram에 주입, 60초 TTL 인메모리 캐시, `Promise.all` 오디오 파싱/DB 조회 병렬 처리
- [x] **사용 시간 제한** — `useMeetingTimer`에서 매 초 클라이언트 사이드 카운트 + 30초 배치 DB 동기화(`supabase.rpc`), `used_seconds >= limit_seconds` 도달 시 강제 녹음 종료 + alert, 동기화 실패 시 재시도 복구
- [x] **게이미피케이션 미션** — 대시보드 상단 사용 시간 프로그레스 바(파랑→노랑→빨강 3단계), 무료 유저 전용 "단어 10개 등록 시 +1시간" 락인 미션 배너, 미션 진행 바, 달성 시 [🎁 보상 받기] 버튼 → `limit_seconds` 7200으로 확장

#### 사용 시간 관리 구조

```
[녹음 시작] → fetchUserQuota() → used: 1800, limit: 3600
     ↓
매 1초 → meetingTime + 1 → userUsedRef + 1 → pendingSeconds + 1
     ↓ 30초 누적
supabase.rpc("increment_used_seconds", { delta: 30 })
     ↓ used >= limit
강제 종료 → alert("사용 시간 만료") → 녹음 중지
     ↓
대시보드 프로그레스 바 반영 → 미션 배너로 유도
     ↓ 단어 10개 달성
[🎁 보상 받기] → limit_seconds = 7200 (+1시간 확장)
```

#### Phase 6에서 생성/수정된 파일

| 파일 | 경로 | 역할 |
|------|------|------|
| schema.sql | `database/schema.sql` | projects, custom_words 테이블 + users 시간 컬럼 + RPC |
| DashboardPage | `app/dashboard/page.tsx` | 프로젝트 모달 + 프로그레스 바 + 미션 배너 |
| TopBar | `components/meeting/TopBar.tsx` | 동적 제목 + 프로젝트 드롭다운 |
| DictionaryPage | `app/settings/dictionary/page.tsx` | 나만의 사전 CRUD 페이지 |
| STT API | `app/api/stt/route.ts` | 커스텀 키워드 부스팅 + 캐싱 |
| useMeetingTimer | `hooks/useMeetingTimer.ts` | 시간 배치 동기화 + 제한 강제 종료 |
| useMeetingStore | `store/useMeetingStore.ts` | meetingTitle, selectedProjectId 상태 추가 |

### Phase 7: Capacitor 하이브리드 앱 패키징 완료 ✅

Next.js 정적 빌드(Static Export)와 Capacitor를 결합하여 iOS/Android 네이티브 앱으로 패키징할 수 있는 하이브리드 앱 구조를 완성했습니다. 모바일 환경에 맞춘 권한 설정, Safe Area 최적화, 반응형 UI 대응까지 포함합니다.

- [x] **Next.js Static Export 설정** — `next.config.ts`에 `output: "export"` + `images: { unoptimized: true }` 추가, `npm run build` 시 `out/` 폴더에 순수 HTML/CSS/JS 정적 파일 생성 (8개 HTML, 15개 JS 청크, ~833KB)
- [x] **API Routes 분리** — `output: "export"` 모드에서 API Routes 미지원으로, `src/app/api/*` → `server/api/*`로 이동. Capacitor 앱에서는 `NEXT_PUBLIC_API_BASE_URL` 환경변수를 통해 원격 API 서버 주소 지정
- [x] **Deepgram SDK v5 호환성 수정** — `createClient` → `DeepgramClient` 클래스, `listen.prerecorded.transcribeFile` → `listen.v1.media.transcribeFile` API 경로, 응답 타입 유니온(`ListenV1Response | ListenV1AcceptedResponse`) 처리
- [x] **Supabase 클라이언트 Lazy Init** — 빌드 타임 환경변수 부재 에러 방지를 위해 `Proxy` 패턴 기반 지연 초기화, 런타임 최초 호출 시 클라이언트 생성
- [x] **Middleware 비활성화** — `middleware.ts` → `middleware.ts.bak` 백업, 정적 빌드에서는 클라이언트 측 `AuthProvider`가 인증 상태 관리
- [x] **Capacitor 프로젝트 초기화** — `@capacitor/core` + `@capacitor/cli` + `@capacitor/ios` + `@capacitor/android` 설치, `npx cap init Contexta com.contexta.app --web-dir out`, `npx cap add android/ios` 실행
- [x] **iOS 마이크 권한** — `ios/App/App/Info.plist`에 `NSMicrophoneUsageDescription` 키 추가 (한국어 설명)
- [x] **Android 마이크 권한** — `android/app/src/main/AndroidManifest.xml`에 `RECORD_AUDIO` + `MODIFY_AUDIO_SETTINGS` 퍼미션 추가
- [x] **모바일 WebView 호환성 강화** — `useAudioRecorder.ts` 5가지 개선: `webkitAudioContext` 폴백, `AudioContext.resume()` 자동 호출, `getSupportedMimeType()` 동적 MIME 감지 (webm/mp4/aac/ogg), `generateId()` crypto.randomUUID 폴백, `apiUrl()` 동적 URL
- [x] **API URL 동적화** — `utils/apiUrl.ts` 유틸 생성, `useAudioRecorder`·`useAiHint`·`TopBar` 3곳의 `/api/*` 호출을 `NEXT_PUBLIC_API_BASE_URL` 기반 동적 URL로 통일
- [x] **Viewport + Safe Area 최적화** — `layout.tsx`에 `viewport: { viewportFit: "cover", maximumScale: 1, userScalable: false }` 설정, `globals.css`에 `env(safe-area-inset-*)` CSS 변수 + `body { position: fixed; overflow: hidden; overscroll-behavior: none }` 전역 바운스 완전 차단
- [x] **ClientModeOverlay 모바일 강화** — `safe-top safe-bottom` 클래스로 노치/홈바 보호, `onTouchMove` 이벤트 전파 차단, `overscroll-none` 바운스 방지
- [x] **미팅 페이지 반응형** — PC: 7:3 좌우 분할 → 모바일: 50:50 상하 분할 (`flex-col md:flex-row`), 패딩·스크롤 분리
- [x] **빌드+동기화 스크립트** — `package.json`에 `"sync": "next build && npx cap sync"` 원커맨드 스크립트 추가

#### Capacitor 앱 아키텍처

```
┌──────────────────────────────────┐
│           모바일 기기              │
│  ┌────────────────────────────┐  │
│  │     네이티브 앱 (Shell)     │  │
│  │  ┌──────────────────────┐  │  │
│  │  │     WebView          │  │  │
│  │  │  ┌────────────────┐  │  │  │
│  │  │  │  out/ 정적 파일  │  │  │  │
│  │  │  │  (HTML/CSS/JS)  │  │  │  │
│  │  │  └───────┬────────┘  │  │  │
│  │  │          │ fetch()   │  │  │
│  │  └──────────┼──────────┘  │  │
│  └─────────────┼─────────────┘  │
│                │                 │
└────────────────┼─────────────────┘
                 │ HTTPS
                 ▼
     ┌───────────────────┐
     │  원격 API 서버     │
     │  (server/api/*)    │
     │  - /api/stt        │
     │  - /api/hint       │
     │  - /api/summary    │
     └───────────────────┘
```

#### 빌드 및 동기화 명령어

```bash
# 정적 빌드 + 네이티브 동기화 (원커맨드)
npm run sync

# Android 앱 열기 (Android Studio 필요)
npx cap open android

# iOS 앱 열기 (Xcode 필요, macOS만 가능)
npx cap open ios
```

#### Phase 7에서 생성/수정된 파일

| 파일 | 경로 | 역할 |
|------|------|------|
| next.config.ts | `next.config.ts` | Static Export + 이미지 비최적화 설정 |
| capacitor.config.ts | `capacitor.config.ts` | Capacitor 앱 설정 (webDir: out) |
| apiUrl | `src/utils/apiUrl.ts` | API 서버 URL 동적 생성 유틸 |
| supabaseClient | `src/utils/supabaseClient.ts` | Proxy 기반 Lazy Init으로 리팩토링 |
| useAudioRecorder | `src/hooks/useAudioRecorder.ts` | 모바일 WebView 5가지 호환성 개선 |
| useAiHint | `src/hooks/useAiHint.ts` | apiUrl + generateId 호환성 적용 |
| TopBar | `src/components/meeting/TopBar.tsx` | apiUrl 동적 URL 적용 |
| ClientModeOverlay | `src/components/meeting/ClientModeOverlay.tsx` | Safe Area + 바운스 방지 강화 |
| layout.tsx | `src/app/layout.tsx` | Viewport 메타 + overscroll-none |
| globals.css | `src/app/globals.css` | Safe Area CSS 변수 + 전역 바운스 차단 |
| meeting/page.tsx | `src/app/meeting/page.tsx` | 모바일 반응형 상하 분할 레이아웃 |
| Info.plist | `ios/App/App/Info.plist` | NSMicrophoneUsageDescription 추가 |
| AndroidManifest.xml | `android/app/src/main/AndroidManifest.xml` | RECORD_AUDIO 퍼미션 추가 |
| package.json | `package.json` | "sync" 스크립트 추가 |
| server/api/* | `server/api/` | API Routes 이동 (6개 route) |

### Hotfix 및 오류 대응

Phase 7 이후 로컬 테스트 중 발견된 버그들을 수정했습니다.
상세 내역은 **[`docs/error-log.md`](docs/error-log.md)**를 참조하세요.

| 핵심 수정 | 상태 |
|-----------|------|
| 로그인 무한 리다이렉트 (Middleware ↔ Client 충돌) | ✅ |
| DB 스키마 미적용 방어 처리 (서킷 브레이커 + 폴백) | ✅ |
| 회의록 빈 상태 UX 안내 화면 | ✅ |
| 대시보드 DB 미설정 안내 배너 | ✅ |
| 전수 조사 — 사전/TopBar/STT API 에러 방어 일괄 적용 | ✅ |
| [TC 6-1] 마이크 권한 거부 시 타이머 시작 방지 | ✅ |
| [TC 6-4] 시간 초과 강제 종료 시 오디오 리소스 해제 | ✅ |

> **⚠️ 필수**: Supabase Dashboard > SQL Editor에서 `database/schema.sql`을 실행해야 DB 관련 기능이 정상 작동합니다.

### E2E 테스트 결과 (2026.03.15)

`docs/260315_testing case.md` 기준 전체 19개 TC 수행 → **19/19 PASS**

| 카테고리 | TC 수 | 결과 |
|---------|-------|------|
| TC-01 온보딩 및 인증 | 3 | ✅ 전체 통과 |
| TC-02 대시보드 및 개인화 | 4 | ✅ 전체 통과 |
| TC-03 미팅 및 실시간 AI | 4 | ✅ 전체 통과 |
| TC-04 클라이언트 모드 | 2 | ✅ 전체 통과 |
| TC-05 미팅 종료 및 회의록 | 3 | ✅ 전체 통과 |
| TC-06 예외 상황 방어 | 3+1 | ✅ 전체 통과 (TC 6-1, 6-4 코드 수정 후) |

**심화 테스트** (`docs/260315_testing case_2.md`): TC-07~10 총 13개 — 6개 기존 통과, 6개 조치 후 통과, 1개 환경의존. 상세 결과는 해당 문서 참조.

---

## 전체 개발 완료 Phase 요약

| Phase | 핵심 내용 | 상태 |
|-------|----------|------|
| **Phase 0** | 프로젝트 초기화 (Next.js + Tailwind + 폴더구조) | ✅ |
| **Phase 1** | 정적 UI/UX 퍼블리싱 (7:3 뷰 + 클라이언트 모드) | ✅ |
| **Phase 2** | 마이크 제어 + VAD 무음 커트 + 타이머 | ✅ |
| **Phase 3** | Deepgram STT + Claude Haiku 실시간 AI 힌트 | ✅ |
| **Phase 4** | Claude 3.7 Sonnet 회의록 + TXT 내보내기 | ✅ |
| **Phase 5** | Supabase 인증 + 구글 OAuth + DB 영구 저장 | ✅ |
| **Phase 6** | 프로젝트 폴더 + 나만의 사전 + 사용 시간 제한 + 게이미피케이션 | ✅ |
| **Phase 7** | Capacitor 하이브리드 앱 + 모바일 권한 + Safe Area | ✅ |
| **Phase 8** | AppShell 공통 레이아웃 도입 — 좌측 사이드바 + 우측 캘린더 패널 + 일관된 상단바/뒤로가기 | ✅ |

---

## 작업 로그

### 2026-04-05: AppShell 공통 레이아웃 도입으로 UI 일관성 확보

#### 완료한 작업

**1. `AppShell` 공통 레이아웃 컴포넌트 신설** (`src/components/layout/AppShell.tsx`)
- 좌측 사이드바(로고 + 새 미팅 + 검색 + 프로젝트 + 미팅 기록 + 플랜/쿼터 + 내 사전/내 정보/설정/로그아웃) 전 페이지 공통 렌더링
- 우측 캘린더 패널(미니 캘린더 + 다가오는 미팅) 전 페이지 공통 렌더링 (lg 이상)
- 상단 바 일관화: 페이지 제목 + 선택적 뒤로가기 버튼(항상 좌측, 동일한 스타일)
- `useAppShell()` 커스텀 훅으로 자식 페이지에 프로젝트/미팅/쿼터 등 공유 데이터 제공
- 사이드바 접기 상태를 `localStorage`에 저장해 페이지 이동 후에도 유지
- 프로젝트 생성 / 미팅 일정 추가 / 시간 늘리기 미션 모달을 AppShell 내부로 통합
- 사이드바 검색 입력 시 비-대시보드 페이지에서 자동으로 `/dashboard`로 이동

**2. `MiniCalendar` / `UpcomingMeetingCard` 컴포넌트 분리** (`src/components/layout/`)
- 기존 `dashboard/page.tsx` 내부 함수형 컴포넌트를 독립 파일로 추출
- MiniCalendar는 과거 미팅(`meetings`) + 예정 미팅(`scheduled`) 두 가지 점 표시 지원

**3. 각 페이지 AppShell 적용 리팩토링**
- `app/dashboard/page.tsx`: 1,339줄 → 약 280줄로 축소. 사이드바/캘린더/모달 로직을 AppShell에 위임, 페이지는 welcome + 최근 미팅 목록 + 미팅 상세 모달만 담당
- `app/settings/page.tsx`: 자체 Header 제거, AppShell로 감싸고 `showBackButton backHref="/dashboard"` 사용
- `app/settings/dictionary/page.tsx`: 동일하게 AppShell 적용 (`backHref="/settings"`)
- `app/profile/page.tsx`: **신규 페이지** — 기존 dashboard 내부의 `ProfileView` 상태 토글을 독립 라우트로 분리, AppShell 적용

**4. 뒤로가기 버튼 UX 일관성**
- 모든 보조 페이지(설정, 내 사전, 내 정보)에서 상단 바의 동일한 위치(제목 왼쪽)에 `ArrowLeft` 아이콘 + "뒤로" 텍스트 표시
- `backHref` prop으로 명시적 경로 지정, 없으면 `router.back()` fallback

**5. 예외 페이지**
- `/meeting` (녹음 진행): 풀스크린 유지 — 몰입 방해 최소화
- `/onboarding` (최초 프로필 설정): 풀스크린 유지 — 단계별 플로우 방해 방지
- `/login`, `/` (랜딩): 기존 그대로

#### 변경 효과
- **코드 중복 제거**: 사이드바 + 캘린더 + 모달 코드가 3개 페이지에 중복되어 있던 것을 단일 소스로 통합
- **일관된 네비게이션**: 어떤 페이지에서도 동일한 사이드바/캘린더 위치 → 사용자 멘탈 모델 단순화
- **유지보수성**: 사이드바/캘린더 UI 변경 시 한 곳만 수정

---

### 2026-04-05 (추가): 사전 입력 간소화 + 미팅 자동 팝업 제거

#### 완료한 작업

**1. 내 사전 — 단어만 입력** (`src/app/settings/dictionary/page.tsx`)
- 새 단어 추가 시 "설명" 입력 필드 제거 → 단어 한 줄 입력만으로 등록 가능
- 인라인 수정 UI에서도 설명 필드 제거, 목록 표시에서도 설명 텍스트 숨김
- DB 스키마는 유지하되 `description`은 빈 문자열로 INSERT (하위 호환)

**2. 대시보드 — 미팅 자동 팝업 제거** (`src/app/dashboard/page.tsx`)
- `?meeting=<id>` URL 파라미터 기반 자동 모달 오픈 로직 제거
- 녹음이 완료된 회의로 진입할 때 회의록 팝업이 자동으로 떠오르지 않음
- 사용자가 목록에서 직접 클릭한 경우에만 상세 모달 표시 (기존 동작 유지)
- 사이드바에서 미팅 클릭 시 대시보드로 이동하되 팝업은 뜨지 않음
- 불필요해진 `useSearchParams` / `useEffect` / `Suspense` import 제거

---

## 작업 로그

### 2026-03-19: UI 디자인 리뉴얼 + 데모 미팅 시스템

#### 완료한 작업

**1. Notion-like 디자인 시스템 전면 적용**
- 브랜드 컬러 3색 도입: Mint(`#00D68F`), Pink(`#FF2D78`), Dark(`#1E1E2E`)
- Notion 스타일 토큰: 텍스트(`#37352F`), 배경(`#FFFFFF`/`#FBFBFA`), 테두리(`#E8E8E8`) 등
- `globals.css`에 `@theme inline` 블록으로 Tailwind 커스텀 컬러 정의
- Lucide React 아이콘으로 전환 (이모지 완전 제거)
- 커스텀 애니메이션: `fade-in`, `rec-pulse`

**2. 대시보드 3컬럼 레이아웃 재구성**
- 왼쪽: 접이식 사이드바 (로고, 새 미팅 CTA, 프로젝트, 미팅 기록, 하단 메뉴)
- 가운데: 메인 컨텐츠 (인사 + 최근 미팅 목록) — 중앙 정렬
- 오른쪽: 미니 캘린더 + 다가오는 미팅 카드 4건
- 구독 플랜 + 남은 시간 + 시간 늘리기 미션 버튼 (Free 플랜 전용)

**3. 데모 미팅 시스템 구축 (실제 meeting 화면 체험)**
- `src/constants/demoMeetings.ts`: 3개 유즈케이스별 풍부한 데모 데이터
  - Contexta 온보딩 미팅 (14개 발화 + 3개 힌트 + 3개 용어 + 메모)
  - 클라우드 마이그레이션 기술 협상 (18개 발화 + 4개 힌트 + 6개 용어 + 메모)
  - B2B SaaS 고객 인터뷰 (18개 발화 + 4개 힌트 + 4개 용어 + 메모)
- 대시보드에서 데모 미팅 클릭 → `/meeting?demo={demoId}`로 이동
- meeting 페이지에서 데모 데이터 자동 로드 (transcript + hint 시간순 인터리빙)
- 오른쪽 사이드바: 유즈케이스별 맞춤 용어 사전 + 메모 자동 채움
- TopBar: 데모 모드에서 녹음 버튼 → "대시보드로 돌아가기" 전환

**4. 전체 페이지 Notion 스타일 적용**
- 랜딩(`/`), 로그인(`/login`), 미팅(`/meeting`), 사전(`/settings/dictionary`) 전체 리디자인
- AiHint: mint 좌측 보더 + Sparkles 아이콘 스타일
- TopBar: 44px 노션 스타일 바, mint 힌트 버튼, pink 녹음 버튼

**5. CONTEXT.md 생성**
- AI 어시스턴트용 프로젝트 컨텍스트 문서 작성

#### 변경된 파일 목록

| 파일 | 변경 유형 |
|------|-----------|
| `src/constants/theme.ts` | 수정 — Notion 컬러 토큰 + 브랜드 컬러 |
| `src/constants/demoMeetings.ts` | **신규** — 3개 데모 미팅 데이터 |
| `src/app/globals.css` | 수정 — @theme inline, 커스텀 애니메이션, 스크롤바 |
| `src/app/page.tsx` | 수정 — 랜딩 Notion 스타일 |
| `src/app/(auth)/login/page.tsx` | 수정 — 로그인 Notion 스타일 |
| `src/app/dashboard/page.tsx` | **대폭 수정** — 3컬럼 레이아웃, 사이드바, 캘린더, 데모 미팅 |
| `src/app/meeting/page.tsx` | 수정 — 데모 모드 감지, 동적 용어사전, Suspense 래핑 |
| `src/app/settings/dictionary/page.tsx` | 수정 — Notion 스타일 |
| `src/store/useMeetingStore.ts` | 수정 — glossary, note, isDemoMode, loadDemoData 추가 |
| `src/components/meeting/TopBar.tsx` | 수정 — 데모 모드 대응, Notion 스타일 |
| `src/components/meeting/AiHint.tsx` | 수정 — mint 보더 + Sparkles |
| `src/components/meeting/SummaryBlock.tsx` | 수정 — Notion 텍스트 스타일 |
| `src/components/meeting/LiveNotepad.tsx` | 수정 — store 연동 (note 읽기/쓰기) |
| `src/components/meeting/GlossaryCard.tsx` | 수정 — Notion 카드 스타일 |
| `src/components/meeting/PostMeetingResult.tsx` | 수정 — Notion 모달 스타일 |
| `src/components/meeting/ClientModeOverlay.tsx` | 수정 — CSS 변수 업데이트 |
| `CONTEXT.md` | **신규** — 프로젝트 컨텍스트 문서 |
| `README.md` | 수정 — 작업 로그 섹션 추가 |

#### 다음 작업 예정
- 전체 변경사항 Git 커밋 및 PR 생성
- Google Calendar 연동 (현재 플레이스홀더)
- 실제 미팅 데이터 기반 대시보드 고도화
- 팀 대시보드 / CRM 연동 기능 기획

### 2026-03-21: 프로필 설정 온보딩 페이지 추가

#### 완료한 작업

**1. 프로필 설정 온보딩 페이지 (`/onboarding`)**
- 3단계 폼: 회사 정보 → 내 정보 → 사용 목적
- 회사: 기업명, 업종(11개 선택), 매출 규모(5구간)
- 개인: 이름, 부서, 직급, 직무(8개 선택), 세부직무(키인)
- 사용: 용도(8개 복수선택), 미팅 빈도, 미팅 상대방(복수선택), AI 코칭 스타일(4종), 주요 제품
- 진행률 프로그레스 바 + 보너스 인센티브: 프로필 완성 시 +60분 사용 시간 부여
- 건너뛰기 버튼 항상 노출 (스킵 가능)
- Supabase `users` 테이블에 `profile_data`(jsonb) + `profile_completed`(boolean) 저장
- 네비게이션 버튼 하단 고정 (컨텐츠 스크롤 시에도 항상 표시)

**2. AuthGuard 업데이트**
- `/onboarding` 경로를 PUBLIC_PATHS에 추가 (비로그인 상태에서도 접근 가능)

**3. 글로벌 CSS 추가**
- `.input-field` 클래스: Notion 스타일 입력 필드 (mint 포커스 링)

**4. 뷰포트 오버플로우 버그 수정**
- 온보딩 3단계(사용 목적)에서 100% 줌 시 하단 버튼이 뷰포트 밖으로 밀리는 레이아웃 버그 수정
- 원인: `min-h-screen`은 컨테이너 확장을 허용하여 `flex-1 + overflow-y-auto`가 미작동
- 수정: `h-dvh overflow-hidden`으로 변경, 컨텐츠 영역만 스크롤, 네비게이션 항상 고정
- `rules.md`에 뷰포트 레이아웃 규칙 추가 (재발 방지)

#### 변경된 파일 목록

| 파일 | 변경 유형 |
|------|-----------|
| `src/app/onboarding/page.tsx` | **신규** — 3단계 프로필 온보딩 페이지 |
| `src/app/globals.css` | 수정 — `.input-field` 클래스 추가 |
| `src/components/providers/AuthGuard.tsx` | 수정 — `/onboarding` public path 추가 |
| `rules.md` | 수정 — 뷰포트 레이아웃 규칙 추가 |

**5. 대시보드 '내 정보' 프로필 연동**
- 사이드바 "내 정보" 클릭 시 동작 분기:
  - 온보딩 미완료 → `/onboarding` 페이지로 이동 (기존 입력값 유지)
  - 온보딩 완료 → 대시보드 내 프로필 뷰 표시 (회사/개인/사용목적 3섹션)
- `ProfileView` 컴포넌트: 프로필 데이터를 카드 형태로 보여주고, "수정하기" 버튼으로 온보딩 페이지 재진입
- 프로필 상수/타입을 `src/constants/profileOptions.ts`로 분리 (온보딩+대시보드 공유)
- `docs/followup_plan.md` 관련 항목 완료 처리

| 파일 | 변경 유형 |
|------|-----------|
| `src/constants/profileOptions.ts` | **신규** — 프로필 타입/상수 공유 모듈 |
| `src/app/dashboard/page.tsx` | 수정 — 프로필 fetch, ProfileView, 내 정보 클릭 핸들러 |
| `src/app/onboarding/page.tsx` | 수정 — 로컬 타입/상수 → 공유 모듈 import |
| `docs/followup_plan.md` | 수정 — 내 정보/프로필 항목 완료 처리 |

**6. Supabase 프로필 저장 디버깅 (DB 스키마 + upsert 문제)**
- **문제 1**: `profile_data`, `profile_completed` 컬럼이 `users` 테이블에 없어 저장 실패
  - 해결: `database/schema.sql`에 `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` 추가 후 Supabase SQL Editor에서 실행
- **문제 2**: `upsert` 사용 시 `email`(NOT NULL), `display_name`(NOT NULL) 누락으로 실패
  - 원인: 트리거(`handle_new_user`)가 자동 생성한 레코드를 `upsert`하면 NOT NULL 제약 위반
  - 해결: `upsert` → `update().eq("id", user.id)` 변경
- **교훈**: 트리거로 생성된 레코드는 `insert`/`upsert` 대신 반드시 `update` 사용

**7. 프로필 수정 시 기존 데이터 프리필**
- **문제**: 프로필 수정 버튼 클릭 시 온보딩 페이지가 빈 폼으로 시작
- **해결**: `useEffect`로 DB에서 기존 `profile_data` 조회하여 폼 상태에 반영
- 로딩 스피너 추가 (데이터 로드 중 깜빡임 방지)
- `rules.md`에 "편집 페이지 진입 시 기존 데이터 로드" 규칙 추가

| 파일 | 변경 유형 |
|------|-----------|
| `database/schema.sql` | 수정 — `profile_data`, `profile_completed` 컬럼 추가 |
| `src/app/onboarding/page.tsx` | 수정 — upsert→update 변경, 기존 데이터 프리필 로직 추가 |
| `rules.md` | 수정 — Supabase/DB 규칙 섹션 추가 (스키마 변경, upsert vs update, 편집 데이터 로드) |

### 2026-04-04: 에러 핸들링 고도화 (기술 부채 해소)

#### 완료한 작업

**1. Zustand 에러 상태 확장**
- `sttErrorCount`, `sttPaused`, `lastError`, `summaryError` 4개 상태 추가
- `setSttErrorCount`, `setSttPaused`, `setLastError`, `clearLastError`, `setSummaryError` 5개 액션 추가
- `AppError` 인터페이스 정의 (type, message, timestamp, retryable)

**2. Toast 알림 컴포넌트 (`components/ui/Toast.tsx`)**
- 하단 중앙 고정 위치, 에러 타입별 색상 (network=빨강, stt=노랑, hint=파랑, summary=빨강)
- Lucide 아이콘 연동, 자동 닫힘 (6초), 네트워크 에러는 복구 전까지 유지
- 재시도 가능한 에러에 RefreshCw 버튼 표시
- `alert()` 의존 제거를 위한 기반 마련

**3. 네트워크 상태 감지 훅 (`hooks/useNetworkStatus.ts`)**
- `online`/`offline` 이벤트 리스너로 실시간 네트워크 상태 감지
- 녹음 중 네트워크 단절 시 자동으로 Toast 경고 + STT 일시 정지
- 네트워크 복구 시 자동으로 STT 재개 + 에러 카운트 초기화

**4. STT 에러 핸들링 강화 (`hooks/useAudioRecorder.ts`)**
- `AbortController` + 10초 타임아웃 추가 (기존: 타임아웃 없음)
- 연속 실패 카운터: 5회 연속 실패 시 STT 자동 일시 정지 + Toast 알림
- 성공 시 에러 카운트 자동 리셋
- `sttPaused` 상태 체크로 불필요한 요청 차단

**5. 회의록 생성 에러 핸들링 (`components/meeting/TopBar.tsx`)**
- `generateSummary` 함수 분리 (재시도 가능하도록)
- 60초 타임아웃 추가
- 실패 시 `summaryError` 상태 + Toast 알림 (기존: 무응답 return)
- 타임아웃 vs 일반 에러 구분 메시지

**6. 회의록 재시도 UI (`components/meeting/PostMeetingResult.tsx`)**
- `summaryError` 상태일 때 AlertTriangle 아이콘 + "재시도" 버튼 표시
- `onRetrySummary` 콜백으로 meeting 페이지에서 재시도 로직 연결

**7. AI 힌트 에러 피드백 (`hooks/useAiHint.ts`)**
- 타임아웃/일반 에러 시 Toast 알림 추가 (기존: console.log만)
- 비차단(non-blocking) 알림 — 자동 재시도는 기존 주기 로직에 의존

**8. Auth 타임아웃 (`components/providers/AuthProvider.tsx`)**
- Supabase `getSession()` 5초 타임아웃 추가
- Supabase 서버 비응답 시에도 로딩 스피너 해제 → 공개 페이지 정상 렌더링

#### 에러 핸들링 구조

```
[네트워크 단절] → useNetworkStatus → setLastError(network) + setSttPaused(true)
     ↓ 복구
clearLastError + setSttPaused(false) + setSttErrorCount(0)

[STT 실패] → sendChunkToSTT catch → sttErrorCount += 1
     ↓ 5회 연속
setSttPaused(true) + setLastError(stt, retryable)
     ↓ Toast "재시도" 클릭
setSttPaused(false) + setSttErrorCount(0)

[회의록 실패] → handleStop catch → setSummaryError(true) + setLastError(summary)
     ↓ PostMeetingResult "재시도" 클릭
retrySummary() → /api/summary 재호출

[힌트 실패] → fetchHint catch → setLastError(hint) → 6초 후 자동 닫힘
```

#### 변경된 파일 목록

| 파일 | 변경 유형 |
|------|-----------|
| `src/store/useMeetingStore.ts` | 수정 — 에러 상태/액션 4+5개 추가, AppError 인터페이스 |
| `src/components/ui/Toast.tsx` | **신규** — 글로벌 Toast 알림 컴포넌트 |
| `src/hooks/useNetworkStatus.ts` | **신규** — 네트워크 상태 감지 훅 |
| `src/hooks/useAudioRecorder.ts` | 수정 — STT 타임아웃, 연속 실패 감지, 자동 일시정지 |
| `src/hooks/useAiHint.ts` | 수정 — 실패 시 Toast 알림 추가 |
| `src/components/meeting/TopBar.tsx` | 수정 — generateSummary 분리, 타임아웃, 에러 피드백 |
| `src/components/meeting/PostMeetingResult.tsx` | 수정 — summaryError 재시도 UI |
| `src/components/providers/AuthProvider.tsx` | 수정 — getSession 5초 타임아웃 |
| `src/app/meeting/page.tsx` | 수정 — Toast, PostMeetingResult, useNetworkStatus 연동 |

### 2026-04-04: 미팅 검색 + 미니 캘린더 실데이터 연동

#### 완료한 작업

**1. 미팅 검색 기능 구현**
- 사이드바 검색바를 실제 `<input>`으로 전환 (기존: `<span>` 플레이스홀더)
- 미팅 제목 + 프로젝트명으로 실시간 필터링
- 검색어 지우기(X) 버튼 + 포커스 시 mint 테두리 하이라이트
- 검색 결과 건수 표시
- 검색 결과 없을 때 빈 상태 UI + "필터 초기화" 버튼

**2. 프로젝트별 미팅 필터링**
- 사이드바 프로젝트 클릭 시 해당 프로젝트 미팅만 필터링
- 활성 프로젝트 mint 하이라이트
- "필터 해제" 버튼으로 전체 미팅 다시 보기
- 검색 + 프로젝트 필터 복합 적용 가능

**3. 미니 캘린더 실데이터 연동**
- 하드코딩된 미팅일(`meetingDays`) 제거
- 실제 DB 미팅 `created_at` 기준으로 현재 월의 미팅 날짜 표시
- `MiniCalendar` 컴포넌트에 `meetings` props 추가

#### 변경된 파일 목록

| 파일 | 변경 유형 |
|------|-----------|
| `src/app/dashboard/page.tsx` | 수정 — 검색 input, 프로젝트 필터, filteredMeetings, MiniCalendar 실데이터 |
| `docs/followup_plan.md` | 수정 — 미팅 검색, 미니 캘린더 완료 처리 |

### 2026-04-04: 설정 페이지 구현

#### 완료한 작업

**1. 설정 페이지 전면 구현 (`/settings`)**
- 기존 "Phase 2에서 구현" 플레이스홀더를 완전한 설정 페이지로 교체
- Notion 스타일 디자인 일관성 유지
- 설정값 localStorage 저장 (향후 DB 마이그레이션 대비)

**2. 구현된 설정 항목**
- **AI 힌트**: 자동 힌트 ON/OFF 토글 + 힌트 생성 주기 (3/5/10/15분)
- **녹음**: STT 기본 언어 (한국어/영어/일본어/중국어)
- **단축키**: 클라이언트 모드 전환 키 표시 (Ctrl+Space)
- **데이터 관리**: 나만의 용어 사전, 프로필 수정 바로가기
- **계정**: 계정 삭제 (2단계 확인 + 전체 데이터 삭제)

**3. 재사용 컴포넌트**
- `SettingsSection`: 아이콘 + 제목 + 설명 + 구분선 카드
- `SettingsRow`: 라벨 + 설명 + 컨트롤 레이아웃
- `ToggleSwitch`: mint 색상 토글 스위치

**4. 대시보드 설정 버튼 연결**
- 사이드바 "설정" 버튼을 `<button>` → `<Link href="/settings">`로 변경

#### 변경된 파일 목록

| 파일 | 변경 유형 |
|------|-----------|
| `src/app/settings/page.tsx` | **대폭 수정** — 전체 설정 페이지 구현 |
| `src/app/dashboard/page.tsx` | 수정 — 설정 버튼 Link 연결 |
| `docs/followup_plan.md` | 수정 — 설정 페이지 완료 처리 |

### 2026-04-04: 다가오는 미팅 일정 관리 + 미팅 추가 버튼 구현

#### 완료한 작업

**1. 다가오는 미팅 실제 기능 구현**
- 하드코딩된 4개 플레이스홀더 카드 제거
- localStorage 기반 미팅 일정 CRUD 구현
- 지난 일정 자동 정리 (오늘 이전 일정 필터)
- 시간순 자동 정렬
- 오늘 미팅 mint 하이라이트, 내일/이후 날짜 표시

**2. 미팅 일정 추가 모달**
- 제목, 일시(datetime-local), 소요 시간(30분~2시간), 참석자 수, 장소 입력
- 필수 필드 검증 (제목 + 일시)
- 캘린더 옆 + 버튼 클릭 시 모달 오픈

**3. 미팅 일정 삭제**
- UpcomingMeetingCard에 호버 시 삭제(X) 버튼 표시
- 빈 상태 UI ("예정된 미팅이 없습니다" + 추가 링크)

#### 변경된 파일 목록

| 파일 | 변경 유형 |
|------|-----------|
| `src/app/dashboard/page.tsx` | 수정 — ScheduledMeeting 타입, CRUD 로직, 모달, UpcomingMeetingCard 삭제 기능 |
| `docs/followup_plan.md` | 수정 — 다가오는 미팅, 미팅 추가 버튼 완료 처리 |

---

## 라이선스

Private - All Rights Reserved
