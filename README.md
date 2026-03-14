# Contexta (컨텍스타)

> B2B 영업대표를 위한 **실시간 AI 미팅 코파일럿** 웹 서비스

---

## 서비스 소개

Contexta는 B2B 영업/컨설팅 미팅 중 **실시간으로 AI 코칭 힌트와 문맥 요약**을 제공하는 웹 서비스입니다.

기존의 회의록/STT 앱이 미팅 종료 후 '사후 기록'에만 치중하는 것과 달리, Contexta는 **미팅이 진행되는 바로 그 순간** 영업대표에게 필요한 정보를 제공합니다.

### 핵심 차별점

- **실시간 AI 힌트**: 5분 주기로 대화를 요약하고, 화제 전환 및 대응 힌트를 파스텔 블루 박스로 즉시 노출
- **클라이언트 모드 (위장 기능)**: 단축키(F4) 입력 시 애니메이션 없이 회색 메모장으로 **즉시 전환** — 고객 대면 시 완벽한 신뢰 유지
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
├── docs/                         # 기획 문서
│   └── planning.md               # 서비스 기획안
├── public/                       # 정적 에셋
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── (auth)/login/         # 로그인 페이지
│   │   ├── dashboard/            # 대시보드 (홈)
│   │   ├── meeting/[id]/         # 미팅 진행 페이지
│   │   ├── review/[id]/          # 미팅 리뷰 페이지
│   │   ├── settings/             # 설정 페이지
│   │   ├── api/                  # API Routes
│   │   │   ├── auth/             # 인증 API
│   │   │   ├── meeting/          # 미팅 CRUD API
│   │   │   ├── stt/              # STT 연동 API
│   │   │   └── ai/               # AI 힌트/회의록 API
│   │   ├── layout.tsx            # 루트 레이아웃
│   │   ├── page.tsx              # 랜딩 페이지
│   │   └── globals.css           # 전역 스타일
│   ├── components/               # 재사용 컴포넌트
│   │   ├── ui/                   # 기본 UI (Button, Card, Input, Modal)
│   │   ├── layout/               # 레이아웃 (Header, SplitView)
│   │   └── meeting/              # 미팅 전용 (HintPanel, MemoPanel, ClientModeOverlay, RecordingControls)
│   ├── hooks/                    # 커스텀 훅
│   │   ├── useClientMode.ts      # 클라이언트 모드 토글
│   │   ├── useRecording.ts       # 마이크 녹음 제어
│   │   └── useMeeting.ts         # 미팅 상태 관리
│   ├── lib/                      # 라이브러리 설정
│   │   ├── supabase/             # Supabase 클라이언트
│   │   └── ai/                   # Claude AI 설정 및 프롬프트
│   ├── stores/                   # 전역 상태 관리
│   ├── types/                    # TypeScript 타입 정의
│   ├── utils/                    # 유틸리티 함수
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

### Phase 1: 인증 및 대시보드 (예정)

- [ ] Supabase 프로젝트 생성 및 연동
- [ ] Google 소셜 로그인 구현
- [ ] 사용자 프로필 설정 (직무, 산업군)
- [ ] 대시보드 UI 구현 (미팅 목록, 새 미팅 생성)
- [ ] 수동 미팅 셋업 폼

### Phase 2: 실시간 미팅 코어 (예정)

- [ ] 마이크 녹음 및 오디오 스트리밍
- [ ] Deepgram STT 실시간 연동
- [ ] Claude Haiku 실시간 힌트 생성
- [ ] 2단 스플릿 뷰 완성
- [ ] 클라이언트 모드 (F4 토글) 완성
- [ ] 온디맨드 힌트 버튼

### Phase 3: 미팅 종료 후 기능 (예정)

- [ ] CLOVA Speech 사후 처리
- [ ] 화자 분리 매핑
- [ ] 모듈형 회의록 생성 (Claude Sonnet)
- [ ] 파일 내보내기 (TXT, 클립보드 복사)

---

## 라이선스

Private - All Rights Reserved
