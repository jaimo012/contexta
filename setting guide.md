# Contexta API 키 발급 및 환경변수 세팅 가이드

개발 Phase 3(실시간 AI 연동) 및 이후 Phase 진행을 위해 필요한 API 키 발급 방법입니다.

## 🔑 0단계: 환경변수 파일 준비하기

1. 프로젝트 루트 폴더에 있는 `.env.local.example` 파일을 복사합니다.
2. 복사한 파일의 이름을 `.env.local`로 변경합니다.
3. 앞으로 발급받는 모든 키는 이 `.env.local` 파일 안에 따옴표 없이 붙여넣습니다.

---

## 🚀 1단계: 당장 필요한 AI 키 (Phase 3 & 4 용)

실시간 STT와 AI 힌트 기능을 위해 지금 바로 세팅해야 하는 항목입니다.

### ① Deepgram API Key (초고속 실시간 STT)
* **어디서:** [console.deepgram.com](https://console.deepgram.com/)
* **어떻게:** 1. 깃허브나 구글 계정으로 로그인 (가입 시 무료 크레딧 제공)
  2. 좌측 메뉴 `API Keys` -> `Create a New API Key` 클릭
  3. 이름 입력(예: `contexta-dev`) 후 키 복사 (※ 한 번만 보여주니 꼭 바로 복사하세요!)
* **어디에:** `.env.local` 파일의 `DEEPGRAM_API_KEY=` 뒤에 붙여넣기

### ② Anthropic API Key (Claude 3.5 & 3.7 LLM)
* **어디서:** [console.anthropic.com](https://console.anthropic.com/)
* **어떻게:** 1. 가입 후 로그인 (Billing에 카드 등록 필요. 초기 5달러 정도 충전 권장)
  2. 대시보드에서 `Get API keys` -> `Create Key` 클릭
  3. 생성된 키 복사
* **어디에:** `.env.local` 파일의 `CLAUDE_API_KEY=` 뒤에 붙여넣기

> **💡 확인 팁:** 여기까지 세팅하고 로컬 서버를 재시작(`npm run dev`)하면 Phase 3의 실시간 힌트 기능이 작동합니다!

---

## 🗄️ 2단계: DB 및 로그인 세팅 (Phase 5 준비용)

Phase 4 완료 후 '데이터 영구 저장' 및 '회원가입' 기능을 붙일 때 필요합니다.

### ③ Supabase (데이터베이스)
* **어디서:** [supabase.com](https://supabase.com/)
* **어떻게:**
  1. 가입 후 `New Project` 클릭 (무료 요금제, 리전은 `아시아-서울` 선택)
  2. 생성 완료 후 톱니바퀴(Project Settings) -> `API` 메뉴로 이동
  3. `Project URL`, `anon/public Key`, `service_role Key` 복사
* **어디에:** `.env.local`의 다음 변수에 각각 붙여넣기
  * `NEXT_PUBLIC_SUPABASE_URL=`
  * `NEXT_PUBLIC_SUPABASE_ANON_KEY=`
  * `SUPABASE_SERVICE_ROLE_KEY=`

### ④ Google OAuth (소셜 로그인)
* **어디서:** [Google Cloud Console](https://console.cloud.google.com/)
* **어떻게:**
  1. 새 프로젝트 생성 후 `API 및 서비스` -> `사용자 인증 정보` -> `+ 사용자 인증 정보 만들기` -> `OAuth 클라이언트 ID`
  2. 애플리케이션 유형: **웹 애플리케이션** 선택
  3. 승인된 리디렉션 URI: `https://[본인의-supabase-프로젝트-id].supabase.co/auth/v1/callback` 입력
  4. 생성된 `클라이언트 ID`와 `클라이언트 보안 비밀(Secret)` 복사
* **어디에:**
  1. Supabase 대시보드의 `Authentication` -> `Providers` -> `Google` 설정 창에 붙여넣고 활성화(Enable)
  2. `.env.local`의 `GOOGLE_CLIENT_ID=`, `GOOGLE_CLIENT_SECRET=` 에도 붙여넣기

---

## 🇰🇷 3단계: 고정밀 STT 세팅 (고도화 단계)

사후 회의록 작성 시 높은 퀄리티의 한글/IT 용어 인식이 필요할 때 세팅합니다.

### ⑤ Naver CLOVA Speech
* **어디서:** [네이버 클라우드 플랫폼](https://www.ncloud.com/)
* **어떻게:** 1. 가입 및 결제 수단 등록
  2. `Services` -> `AI Services` -> `CLOVA Speech` 검색 후 이용 신청
  3. Domain 생성 후 `Secret Key`와 `Invoke URL` 확보
* **어디에:** `.env.local`의 `CLOVA_SPEECH_API_KEY=` 와 `CLOVA_SPEECH_SECRET=` 에 맞게 입력


https://gemini.google.com/app/49c5aa276b998877