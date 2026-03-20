export interface DemoTranscript {
  id: string;
  text: string;
  timestamp: number;
}

export interface DemoHint {
  id: string;
  text: string;
  timestamp: number;
}

export interface DemoGlossary {
  term: string;
  definition: string;
}

export interface DemoSummary {
  id: string;
  text: string;
  timestamp: number;
  type: "summary" | "hint";
}

export interface AgendaItem {
  id: string;
  title: string;
  bullets: string[];
  isCurrent: boolean;
}

export interface DemoMeetingData {
  id: string;
  title: string;
  project: string;
  date: string;
  snippet: string;
  meetingTime: number; // seconds
  meetingStartTime: number; // timestamp
  lastUpdateTime: number; // timestamp
  transcripts: DemoTranscript[];
  hints: DemoHint[];
  summaries: DemoSummary[];
  agendaItems: AgendaItem[];
  glossary: DemoGlossary[];
  note: string;
  minutes: string;
}

const BASE_TIME = new Date("2026-03-18T10:00:00").getTime();

function t(minOffset: number, secOffset: number = 0): number {
  return BASE_TIME + minOffset * 60000 + secOffset * 1000;
}

export const DEMO_MEETINGS: DemoMeetingData[] = [
  {
    id: "demo-onboarding",
    title: "Contexta 온보딩 미팅",
    project: "Contexta",
    date: "2026-03-18",
    snippet: "Contexta 도입을 위한 제품 소개 및 활용 방안 논의",
    meetingTime: 1847, // 30:47
    meetingStartTime: t(0, 0),
    lastUpdateTime: t(11, 0),
    transcripts: [
      { id: "d1-t1", text: "안녕하세요, Contexta 온보딩 미팅 시작하겠습니다. 저는 Contexta 고객성공팀의 김민수입니다.", timestamp: t(0, 15) },
      { id: "d1-t2", text: "네, 반갑습니다. 저희 영업팀에서 도입을 검토 중인데, 실제로 어떻게 활용할 수 있는지 궁금합니다.", timestamp: t(0, 42) },
      { id: "d1-t3", text: "Contexta는 실시간 AI 회의 코파일럿입니다. 회의 중 자동으로 대화를 인식하고, 핵심 내용을 요약해 드립니다.", timestamp: t(1, 10) },
      { id: "d1-t4", text: "추가로 AI 힌트 기능이 있어서, 회의 맥락에 맞는 데이터 포인트나 제안을 실시간으로 제공합니다.", timestamp: t(1, 45) },
      { id: "d1-t5", text: "저희 팀이 주로 하는 건 고객사 미팅인데요, 기술 용어가 많이 나옵니다. 그 부분도 지원되나요?", timestamp: t(2, 30) },
      { id: "d1-t6", text: "네, 사용자 정의 사전 기능이 있습니다. 자주 사용하는 전문 용어를 등록하면 STT 인식률이 높아지고, 회의 중 용어 사전으로도 활용할 수 있습니다.", timestamp: t(3, 5) },
      { id: "d1-t7", text: "고객사 미팅 중에 상대방 화면에 이 도구가 보이면 좀 부담스러울 수 있을 것 같은데요.", timestamp: t(4, 20) },
      { id: "d1-t8", text: "좋은 지적입니다. Ctrl+Space를 누르면 '고객 모드'로 전환됩니다. 화면이 일반 메모장처럼 보여서, 상대방이 봐도 자연스럽습니다.", timestamp: t(4, 50) },
      { id: "d1-t9", text: "오, 그건 정말 유용하겠네요. 프로젝트별로 미팅을 분류할 수도 있나요?", timestamp: t(5, 35) },
      { id: "d1-t10", text: "네, 프로젝트 폴더를 만들어서 미팅을 분류할 수 있습니다. 대시보드에서 프로젝트별 미팅 이력을 한눈에 확인하실 수 있습니다.", timestamp: t(6, 10) },
      { id: "d1-t11", text: "가격 체계는 어떻게 되나요? 팀 단위로 사용할 예정입니다.", timestamp: t(8, 0) },
      { id: "d1-t12", text: "Free 플랜은 월 60분 무료입니다. Pro 플랜은 월 29,000원으로 무제한 녹음과 우선 AI 힌트를 제공합니다. 팀 플랜은 별도 문의 주시면 됩니다.", timestamp: t(8, 30) },
      { id: "d1-t13", text: "일단 Free 플랜으로 시작해서 팀원 2~3명이 테스트해 보고, 괜찮으면 Pro로 전환하겠습니다.", timestamp: t(10, 15) },
      { id: "d1-t14", text: "좋습니다. 온보딩 가이드 문서를 공유해 드릴게요. 추가 궁금한 점은 언제든 채팅으로 문의해 주세요.", timestamp: t(10, 50) },
    ],
    hints: [
      { id: "d1-h1", text: "고객 모드(Ctrl+Space): 화면을 메모장으로 위장하여 상대방에게 자연스럽게 보이도록 하는 기능입니다. 영업 미팅에서 특히 유용합니다.", timestamp: t(5, 0) },
      { id: "d1-h2", text: "경쟁사 대비 차별점: Contexta는 실시간 AI 힌트 + 고객 모드 + 사용자 정의 사전을 결합한 유일한 솔루션입니다. Otter.ai, Fireflies 등은 후처리 중심입니다.", timestamp: t(7, 0) },
      { id: "d1-h3", text: "Free → Pro 전환율 참고: 일반적으로 2주 내 3회 이상 미팅에 사용한 팀의 78%가 Pro로 전환합니다. 적극적인 초기 활용을 권장하세요.", timestamp: t(10, 30) },
    ],
    summaries: [
      { id: "d1-s1", text: "Contexta 고객성공팀 김민수와 고객사 영업팀 간 온보딩 미팅 시작. 고객사는 영업팀 도입을 검토 중이며 실제 활용 방안에 대해 관심을 표명함.", timestamp: t(1, 0), type: "summary" },
      { id: "d1-s2", text: "Contexta 핵심 기능 소개: 실시간 AI 회의 코파일럿으로 자동 대화 인식 + 핵심 내용 요약 + 맥락 기반 AI 힌트를 제공. 사용자 정의 사전으로 전문 용어 STT 인식률 향상 가능.", timestamp: t(3, 30), type: "summary" },
      { id: "d1-s3", text: "고객사가 고객 대면 시 화면 노출에 대한 우려를 제기함. → 고객 모드(Ctrl+Space) 기능으로 해결 가능. 메모장으로 위장되어 상대방이 봐도 자연스러움.", timestamp: t(5, 0), type: "summary" },
      { id: "d1-sh1", text: "고객 모드(Ctrl+Space): 화면을 메모장으로 위장하여 상대방에게 자연스럽게 보이도록 하는 기능입니다. 영업 미팅에서 특히 유용합니다.", timestamp: t(5, 0), type: "hint" },
      { id: "d1-s4", text: "프로젝트 폴더 기능으로 미팅을 분류 관리 가능. 대시보드에서 프로젝트별 미팅 이력 한눈에 확인.", timestamp: t(6, 30), type: "summary" },
      { id: "d1-sh2", text: "경쟁사 대비 차별점: Contexta는 실시간 AI 힌트 + 고객 모드 + 사용자 정의 사전을 결합한 유일한 솔루션입니다. Otter.ai, Fireflies 등은 후처리 중심입니다.", timestamp: t(7, 0), type: "hint" },
      { id: "d1-s5", text: "가격 체계 논의: Free(월 60분 무료) / Pro(월 29,000원, 무제한) / Team(별도 문의). 고객사는 Free 플랜으로 시작하여 2~3명 테스트 후 Pro 전환을 검토하기로 함.", timestamp: t(9, 0), type: "summary" },
      { id: "d1-sh3", text: "Free → Pro 전환율 참고: 일반적으로 2주 내 3회 이상 미팅에 사용한 팀의 78%가 Pro로 전환합니다. 적극적인 초기 활용을 권장하세요.", timestamp: t(10, 30), type: "hint" },
      { id: "d1-s6", text: "미팅 마무리: 온보딩 가이드 문서 공유 예정. 추가 질문은 채팅으로 문의 가능.", timestamp: t(11, 0), type: "summary" },
    ],
    agendaItems: [
      {
        id: "d1-a1",
        title: "제품 소개",
        bullets: [
          "Contexta: 실시간 AI 회의 코파일럿",
          "자동 대화 인식 + 핵심 내용 요약",
          "맥락 기반 AI 힌트 실시간 제공",
        ],
        isCurrent: false,
      },
      {
        id: "d1-a2",
        title: "핵심 기능 데모",
        bullets: [
          "사용자 정의 사전 — 전문 용어 등록 시 STT 인식률 향상",
          "고객 모드(Ctrl+Space) — 메모장 위장 화면",
          "프로젝트 폴더 — 미팅 분류 및 이력 관리",
        ],
        isCurrent: false,
      },
      {
        id: "d1-a3",
        title: "가격 체계",
        bullets: [
          "Free: 월 60분 무료",
          "Pro: 월 29,000원 (무제한 녹음 + 우선 AI 힌트)",
          "Team: 별도 문의",
        ],
        isCurrent: false,
      },
      {
        id: "d1-a4",
        title: "다음 단계",
        bullets: [
          "Free 플랜으로 팀원 2~3명 테스트 시작",
          "온보딩 가이드 문서 공유 예정",
          "2주 후 Pro 전환 여부 결정",
        ],
        isCurrent: true,
      },
    ],
    glossary: [
      { term: "STT (Speech-to-Text)", definition: "음성을 텍스트로 변환하는 기술. Contexta는 Deepgram과 CLOVA Speech를 사용합니다." },
      { term: "AI 코파일럿", definition: "사용자의 작업을 실시간으로 보조하는 AI 어시스턴트. 회의 맥락을 이해하고 능동적으로 도움을 제공합니다." },
      { term: "고객 모드", definition: "Ctrl+Space로 전환. 화면을 일반 메모장으로 위장하여 상대방에게 자연스럽게 보이는 기능입니다." },
    ],
    note: "- 영업팀 도입 검토 중 (2~3명 테스트 예정)\n- Free 플랜으로 시작 → 2주 후 Pro 전환 검토\n- 고객 모드 기능에 특히 관심\n- 온보딩 가이드 문서 공유 필요",
    minutes: `# Contexta 온보딩 미팅 회의록

## 참석자
- 김민수 (Contexta 고객성공팀)
- 고객사 영업팀 담당자

## 주요 논의 사항

### 1. 제품 소개
- Contexta: 실시간 AI 회의 코파일럿
- 자동 대화 인식 및 핵심 내용 요약
- AI 힌트 기능으로 실시간 데이터 포인트 제공

### 2. 핵심 기능 데모
- **사용자 정의 사전**: 전문 용어 등록 → STT 인식률 향상
- **고객 모드 (Ctrl+Space)**: 메모장 위장 화면
- **프로젝트 분류**: 폴더별 미팅 이력 관리

### 3. 가격 체계
- Free: 월 60분 무료
- Pro: 월 29,000원 (무제한 녹음 + 우선 AI 힌트)
- Team: 별도 문의

## Action Items
- [ ] 온보딩 가이드 문서 공유 (김민수)
- [ ] Free 플랜으로 팀원 2~3명 테스트 시작
- [ ] 2주 후 Pro 전환 여부 결정`,
  },
  {
    id: "demo-si-negotiation",
    title: "클라우드 마이그레이션 기술 협상",
    project: "한국전자 SI구축",
    date: "2026-03-17",
    snippet: "한국전자 클라우드 전환 프로젝트 기술 요건 및 일정 협의",
    meetingTime: 2534, // 42:14
    meetingStartTime: t(0, 0),
    lastUpdateTime: t(17, 30),
    transcripts: [
      { id: "d2-t1", text: "한국전자 클라우드 마이그레이션 프로젝트 기술 협상 미팅 시작하겠습니다.", timestamp: t(0, 10) },
      { id: "d2-t2", text: "현재 온프레미스 환경에서 운영 중인 ERP와 MES 시스템을 AWS 클라우드로 전환하는 것이 목표입니다.", timestamp: t(0, 40) },
      { id: "d2-t3", text: "전체 시스템 규모가 어떻게 되나요? 서버 대수와 데이터 볼륨을 알고 싶습니다.", timestamp: t(1, 20) },
      { id: "d2-t4", text: "물리 서버 48대, VM 120개입니다. 총 데이터 볼륨은 약 85TB이고, 그 중 DB가 32TB를 차지합니다.", timestamp: t(1, 55) },
      { id: "d2-t5", text: "DB 엔진은 Oracle 19c를 사용 중이시죠? 라이선스 이관 방식은 어떻게 계획하고 계신가요?", timestamp: t(2, 40) },
      { id: "d2-t6", text: "BYOL 방식으로 기존 라이선스를 가져갈 예정입니다. 다만 일부 시스템은 Aurora PostgreSQL로 전환도 검토 중입니다.", timestamp: t(3, 15) },
      { id: "d2-t7", text: "Aurora 전환 시 호환성 이슈가 있을 수 있습니다. 특히 PL/SQL 프로시저와 Oracle 전용 함수들을 점검해야 합니다.", timestamp: t(4, 0) },
      { id: "d2-t8", text: "네트워크 아키텍처는 어떻게 구성할 예정이시죠? Direct Connect를 사용하실 건가요?", timestamp: t(5, 30) },
      { id: "d2-t9", text: "네, AWS Direct Connect 전용선 2회선을 이중화로 구성하고, VPN을 백업으로 둘 예정입니다.", timestamp: t(6, 5) },
      { id: "d2-t10", text: "데이터 마이그레이션 방식은요? 85TB면 온라인 전송에 상당한 시간이 필요합니다.", timestamp: t(7, 20) },
      { id: "d2-t11", text: "AWS Snowball Edge를 통한 초기 벌크 전송 후, DMS로 변경분을 실시간 동기화하는 하이브리드 방식을 제안드립니다.", timestamp: t(7, 55) },
      { id: "d2-t12", text: "보안 요건이 중요합니다. 한국전자는 ISMS 인증 대상 기업이라 클라우드 환경에서도 동일한 보안 수준을 유지해야 합니다.", timestamp: t(9, 30) },
      { id: "d2-t13", text: "AWS는 ISMS, CSAP 인증을 보유하고 있습니다. 추가로 WAF, GuardDuty, Security Hub를 구성해서 보안 체계를 강화하겠습니다.", timestamp: t(10, 10) },
      { id: "d2-t14", text: "전체 프로젝트 일정은 6개월로 잡고 있습니다. 1단계 개발/테스트 환경 3개월, 2단계 운영 환경 전환 3개월입니다.", timestamp: t(12, 0) },
      { id: "d2-t15", text: "DR 구성은 서울 리전 내 Multi-AZ로 하시나요, 아니면 오사카 리전까지 고려하시나요?", timestamp: t(14, 0) },
      { id: "d2-t16", text: "MES는 RTO 1시간 이내가 요건이라 Multi-AZ로 충분합니다. ERP는 RTO 4시간이므로 Pilot Light로 오사카에 구성합니다.", timestamp: t(14, 40) },
      { id: "d2-t17", text: "예산 범위는 초기 구축비 12억, 월 운영비 3,500만원 이내로 맞춰주셔야 합니다.", timestamp: t(16, 30) },
      { id: "d2-t18", text: "Reserved Instance 3년 약정과 Savings Plan을 조합하면 월 운영비를 약 2,800만원 수준으로 최적화할 수 있습니다.", timestamp: t(17, 10) },
    ],
    hints: [
      { id: "d2-h1", text: "Oracle → Aurora PostgreSQL 전환 시 AWS SCT(Schema Conversion Tool)를 활용하면 약 80%의 스키마를 자동 변환할 수 있습니다. PL/SQL 프로시저는 수동 검토 필요.", timestamp: t(4, 30) },
      { id: "d2-h2", text: "85TB 데이터 Snowball Edge 전송 예상 소요: 약 5~7일. 10Gbps Direct Connect 온라인 전송 시 약 8~10일. 하이브리드 방식 권장.", timestamp: t(8, 0) },
      { id: "d2-h3", text: "ISMS 클라우드 심사 항목 참고: 접근통제, 암호화, 로깅/모니터링, 데이터 백업이 핵심. AWS Config + CloudTrail 필수 구성.", timestamp: t(10, 0) },
      { id: "d2-h4", text: "RI 3년 All Upfront vs Savings Plan 비교: RI가 약 7% 더 저렴하지만 유연성이 낮음. 워크로드 변동이 클 경우 Savings Plan 권장.", timestamp: t(17, 30) },
    ],
    summaries: [
      { id: "d2-s1", text: "한국전자 클라우드 마이그레이션 기술 협상 미팅 시작. 온프레미스 ERP + MES → AWS 클라우드 전환이 목표.", timestamp: t(0, 30), type: "summary" },
      { id: "d2-s2", text: "인프라 현황 파악: 물리 서버 48대, VM 120개, 총 데이터 85TB(DB 32TB). Oracle 19c 사용 중.", timestamp: t(2, 0), type: "summary" },
      { id: "d2-s3", text: "DB 전략 논의: Oracle BYOL 이관 기본, 일부 시스템 Aurora PostgreSQL 전환 검토. PL/SQL 프로시저 호환성 점검 필요.", timestamp: t(4, 0), type: "summary" },
      { id: "d2-sh1", text: "Oracle → Aurora PostgreSQL 전환 시 AWS SCT(Schema Conversion Tool)를 활용하면 약 80%의 스키마를 자동 변환할 수 있습니다. PL/SQL 프로시저는 수동 검토 필요.", timestamp: t(4, 30), type: "hint" },
      { id: "d2-s4", text: "네트워크: AWS Direct Connect 전용선 2회선 이중화 구성, VPN 백업. 데이터 마이그레이션은 Snowball Edge 초기 벌크 전송 + DMS 실시간 CDC 하이브리드 방식 제안.", timestamp: t(8, 0), type: "summary" },
      { id: "d2-sh2", text: "85TB 데이터 Snowball Edge 전송 예상 소요: 약 5~7일. 10Gbps Direct Connect 온라인 전송 시 약 8~10일. 하이브리드 방식 권장.", timestamp: t(8, 0), type: "hint" },
      { id: "d2-s5", text: "보안 요건: ISMS 인증 대상 기업으로 클라우드에서도 동일 수준 요구. AWS CSAP 인증 보유, WAF + GuardDuty + Security Hub 구성으로 대응.", timestamp: t(10, 0), type: "summary" },
      { id: "d2-sh3", text: "ISMS 클라우드 심사 항목 참고: 접근통제, 암호화, 로깅/모니터링, 데이터 백업이 핵심. AWS Config + CloudTrail 필수 구성.", timestamp: t(10, 0), type: "hint" },
      { id: "d2-s6", text: "프로젝트 일정: 총 6개월. 1단계(3개월) 개발/테스트 환경 구축, 2단계(3개월) 운영 환경 전환.", timestamp: t(13, 0), type: "summary" },
      { id: "d2-s7", text: "DR 구성: MES는 Multi-AZ(RTO 1h), ERP는 오사카 리전 Pilot Light(RTO 4h)로 차등 적용.", timestamp: t(15, 0), type: "summary" },
      { id: "d2-s8", text: "예산 협의: 초기 구축 12억, 월 운영비 3,500만원 이내 요구. RI 3년 약정 + Savings Plan 조합 시 월 ~2,800만원으로 최적화 가능.", timestamp: t(17, 0), type: "summary" },
      { id: "d2-sh4", text: "RI 3년 All Upfront vs Savings Plan 비교: RI가 약 7% 더 저렴하지만 유연성이 낮음. 워크로드 변동이 클 경우 Savings Plan 권장.", timestamp: t(17, 30), type: "hint" },
    ],
    agendaItems: [
      {
        id: "d2-a1",
        title: "인프라 현황 파악",
        bullets: [
          "물리 서버 48대, VM 120개",
          "총 데이터 85TB (DB 32TB, Oracle 19c)",
          "ERP + MES 시스템 대상",
        ],
        isCurrent: false,
      },
      {
        id: "d2-a2",
        title: "DB 전략",
        bullets: [
          "Oracle BYOL 이관 (메인)",
          "일부 시스템 Aurora PostgreSQL 전환 검토",
          "PL/SQL 프로시저 호환성 점검 필요",
        ],
        isCurrent: false,
      },
      {
        id: "d2-a3",
        title: "네트워크 & 마이그레이션",
        bullets: [
          "Direct Connect 전용선 2회선 이중화 + VPN 백업",
          "Snowball Edge 초기 벌크 전송 + DMS 실시간 CDC",
        ],
        isCurrent: false,
      },
      {
        id: "d2-a4",
        title: "보안 요건",
        bullets: [
          "ISMS 인증 대상 — 동일 보안 수준 유지 필수",
          "AWS CSAP 인증 보유, WAF + GuardDuty + Security Hub",
        ],
        isCurrent: false,
      },
      {
        id: "d2-a5",
        title: "프로젝트 일정 & DR",
        bullets: [
          "총 6개월: 1단계(3개월) 개발·테스트, 2단계(3개월) 운영 전환",
          "MES: Multi-AZ (RTO 1h) / ERP: Pilot Light 오사카 (RTO 4h)",
        ],
        isCurrent: false,
      },
      {
        id: "d2-a6",
        title: "예산 협의",
        bullets: [
          "초기 구축: 12억",
          "월 운영비 3,500만원 이내 요구",
          "RI 3년 약정 + Savings Plan 조합 시 월 ~2,800만원 최적화 가능",
        ],
        isCurrent: true,
      },
    ],
    glossary: [
      { term: "BYOL (Bring Your Own License)", definition: "기존 소프트웨어 라이선스를 클라우드 환경으로 이관하여 사용하는 방식" },
      { term: "Direct Connect", definition: "AWS와 온프레미스 데이터센터 간 전용 네트워크 연결 서비스. 안정적인 대역폭과 낮은 지연시간 제공" },
      { term: "DMS (Database Migration Service)", definition: "AWS 데이터베이스 마이그레이션 서비스. 실시간 변경분 동기화(CDC) 지원" },
      { term: "RTO (Recovery Time Objective)", definition: "장애 발생 시 서비스 복구까지 허용되는 최대 시간. 낮을수록 높은 가용성 요구" },
      { term: "Multi-AZ", definition: "AWS의 다중 가용영역 배포. 하나의 AZ 장애 시 자동으로 다른 AZ로 페일오버" },
      { term: "ISMS", definition: "정보보호 관리체계 인증. 일정 규모 이상의 기업은 의무 취득 대상" },
    ],
    note: "- 한국전자: 물리 48대, VM 120개, 85TB (DB 32TB)\n- Oracle 19c → BYOL + 일부 Aurora 전환 검토\n- 보안: ISMS 인증 대상 → CSAP, WAF, GuardDuty 필수\n- 예산: 구축 12억, 운영 월 3,500만 이내\n- RI 3년 약정 시 월 2,800만 가능\n- 일정: 6개월 (3+3)",
    minutes: `# 클라우드 마이그레이션 기술 협상 회의록

## 참석자
- 한국전자 IT인프라팀
- SI 구축사 클라우드 아키텍트팀

## 인프라 현황
- 물리 서버 48대, VM 120개
- 총 데이터 85TB (DB 32TB, Oracle 19c)
- ERP + MES 시스템 대상

## 주요 기술 결정

### 1. DB 전략
- Oracle BYOL 이관 (메인)
- 일부 시스템 Aurora PostgreSQL 전환 검토
- SCT 활용 스키마 변환 + PL/SQL 수동 점검

### 2. 네트워크
- Direct Connect 2회선 이중화
- VPN 백업 구성

### 3. 마이그레이션
- Snowball Edge 초기 벌크 전송
- DMS 실시간 CDC 동기화

### 4. 보안
- ISMS/CSAP 준수
- WAF + GuardDuty + Security Hub

### 5. DR 구성
- MES: Multi-AZ (RTO 1h)
- ERP: Pilot Light 오사카 (RTO 4h)

### 6. 예산
- 초기 구축: 12억
- 월 운영: RI 3년 약정 시 ~2,800만원

## 일정
- 1단계 (3개월): 개발/테스트 환경 구축
- 2단계 (3개월): 운영 환경 전환

## Action Items
- [ ] Oracle → Aurora 호환성 사전 분석 (2주 내)
- [ ] Direct Connect 회선 신청
- [ ] ISMS 클라우드 심사 체크리스트 작성
- [ ] 상세 견적서 제출 (1주 내)`,
  },
  {
    id: "demo-customer-interview",
    title: "B2B SaaS 고객 인터뷰",
    project: "고객 리서치",
    date: "2026-03-16",
    snippet: "기존 고객의 제품 사용 경험 및 개선 요구사항 인터뷰",
    meetingTime: 1523, // 25:23
    meetingStartTime: t(0, 0),
    lastUpdateTime: t(14, 0),
    transcripts: [
      { id: "d3-t1", text: "안녕하세요, 오늘 인터뷰에 참여해 주셔서 감사합니다. 현재 저희 솔루션을 어떻게 활용하고 계신지 여쭤보겠습니다.", timestamp: t(0, 10) },
      { id: "d3-t2", text: "저희는 주로 세일즈팀 15명이 사용하고 있어요. 매일 평균 3~4건의 고객 미팅에서 활용합니다.", timestamp: t(0, 45) },
      { id: "d3-t3", text: "가장 만족스러운 기능이 무엇인지 알려주실 수 있을까요?", timestamp: t(1, 20) },
      { id: "d3-t4", text: "실시간 요약이요. 미팅 끝나고 회의록 정리하는 시간이 80% 정도 줄었어요. 예전에는 미팅당 30분씩 정리했는데, 지금은 5분이면 끝납니다.", timestamp: t(1, 50) },
      { id: "d3-t5", text: "AI 힌트 기능도 자주 사용하시나요?", timestamp: t(2, 40) },
      { id: "d3-t6", text: "네, 특히 기술 미팅에서 많이 써요. 고객이 특정 기술 스펙을 물어볼 때 AI가 관련 데이터를 바로 띄워줘서 당황하지 않고 대응할 수 있어요.", timestamp: t(3, 10) },
      { id: "d3-t7", text: "고객 모드는 사용해 보셨나요?", timestamp: t(4, 0) },
      { id: "d3-t8", text: "매일 씁니다! 특히 임원급 미팅에서 필수예요. 상대방이 화면을 볼 때 메모장처럼 보이니까 자연스럽습니다.", timestamp: t(4, 25) },
      { id: "d3-t9", text: "혹시 불편하거나 개선이 필요한 부분이 있으시면 말씀해 주세요.", timestamp: t(5, 30) },
      { id: "d3-t10", text: "음, 몇 가지 있어요. 첫 번째는 팀 대시보드가 없다는 점이에요. 매니저가 팀원들의 미팅 현황을 한눈에 볼 수 있으면 좋겠습니다.", timestamp: t(6, 0) },
      { id: "d3-t11", text: "두 번째는 CRM 연동이요. 지금은 미팅 후에 Salesforce에 수동으로 입력하는데, 자동으로 동기화되면 엄청 편할 것 같아요.", timestamp: t(7, 10) },
      { id: "d3-t12", text: "세 번째는 다국어 지원입니다. 저희가 글로벌 고객도 있어서 영어 미팅도 자주 하거든요. 한영 혼합 미팅에서 인식률이 떨어지는 편이에요.", timestamp: t(8, 20) },
      { id: "d3-t13", text: "소중한 피드백 감사합니다. 팀 대시보드와 CRM 연동은 현재 로드맵에 있는 기능입니다.", timestamp: t(9, 30) },
      { id: "d3-t14", text: "ROI 관점에서 도입 전후 비교가 가능하실까요?", timestamp: t(10, 40) },
      { id: "d3-t15", text: "네, 도입 전에는 미팅 후 정리에 팀 전체가 하루에 약 7~8시간을 쓰고 있었어요. 지금은 1~2시간으로 줄었습니다. 월 기준으로 약 130시간 절감이에요.", timestamp: t(11, 20) },
      { id: "d3-t16", text: "그리고 의외로 큰 효과가 '미팅 품질' 향상이에요. AI 힌트 덕분에 고객 질문에 즉답률이 올라가면서 계약 전환율이 약 15% 개선됐습니다.", timestamp: t(12, 10) },
      { id: "d3-t17", text: "정말 의미 있는 수치네요. 마지막으로, 저희 솔루션을 한마디로 표현한다면요?", timestamp: t(13, 20) },
      { id: "d3-t18", text: "'미팅의 부조종사'라고 할 수 있을 것 같아요. 혼자 운전하던 미팅에 믿음직한 부조종사가 생긴 느낌이에요.", timestamp: t(13, 50) },
    ],
    hints: [
      { id: "d3-h1", text: "고객 언급 핵심 지표: 회의록 정리 시간 80% 감소 (30분→5분/건), 팀 전체 월 130시간 절감. ROI 산출에 활용 가능.", timestamp: t(2, 10) },
      { id: "d3-h2", text: "NPS 조사 참고: '고객 모드'는 현재 사용자 만족도 1위 기능 (4.8/5.0). 마케팅 자료에서 강조 포인트로 활용 권장.", timestamp: t(4, 50) },
      { id: "d3-h3", text: "요청 기능 우선순위 참고: 팀 대시보드 (요청 빈도 1위), CRM 연동 (2위), 다국어 지원 (3위). Q2 로드맵에 1,2위 항목 반영 예정.", timestamp: t(8, 50) },
      { id: "d3-h4", text: "계약 전환율 15% 개선은 매우 강력한 사례. 케이스 스터디로 발행 시 마케팅 활용 가치가 높습니다. 고객 동의 확인 필요.", timestamp: t(12, 30) },
    ],
    summaries: [
      { id: "d3-s1", text: "고객사 세일즈팀 리드와 제품 사용 경험 인터뷰 시작. 세일즈팀 15명이 일 평균 3~4건 미팅에서 활용 중.", timestamp: t(1, 0), type: "summary" },
      { id: "d3-s2", text: "만족 기능 Top 1: 실시간 요약 — 미팅 후 회의록 정리 시간이 80% 감소(30분→5분/건). AI 힌트도 기술 미팅에서 즉답률 향상에 기여.", timestamp: t(2, 30), type: "summary" },
      { id: "d3-sh1", text: "고객 언급 핵심 지표: 회의록 정리 시간 80% 감소 (30분→5분/건), 팀 전체 월 130시간 절감. ROI 산출에 활용 가능.", timestamp: t(2, 10), type: "hint" },
      { id: "d3-s3", text: "고객 모드 사용 현황: 매일 사용, 특히 임원급 미팅에서 필수. 메모장 위장이 자연스러워 호평.", timestamp: t(4, 30), type: "summary" },
      { id: "d3-sh2", text: "NPS 조사 참고: '고객 모드'는 현재 사용자 만족도 1위 기능 (4.8/5.0). 마케팅 자료에서 강조 포인트로 활용 권장.", timestamp: t(4, 50), type: "hint" },
      { id: "d3-s4", text: "개선 요청 3가지: ① 팀 대시보드(매니저용 통합 현황) ② CRM 연동(Salesforce 자동 동기화) ③ 다국어 지원(한영 혼합 인식률 개선)", timestamp: t(8, 30), type: "summary" },
      { id: "d3-sh3", text: "요청 기능 우선순위 참고: 팀 대시보드 (요청 빈도 1위), CRM 연동 (2위), 다국어 지원 (3위). Q2 로드맵에 1,2위 항목 반영 예정.", timestamp: t(8, 50), type: "hint" },
      { id: "d3-s5", text: "ROI 수치 확인: 미팅 후 정리 시간 7~8h/일 → 1~2h/일(월 130시간 절감). 계약 전환율 약 15% 개선. 매우 강력한 도입 효과.", timestamp: t(12, 0), type: "summary" },
      { id: "d3-sh4", text: "계약 전환율 15% 개선은 매우 강력한 사례. 케이스 스터디로 발행 시 마케팅 활용 가치가 높습니다. 고객 동의 확인 필요.", timestamp: t(12, 30), type: "hint" },
      { id: "d3-s6", text: "고객 인용문: \"미팅의 부조종사 — 혼자 운전하던 미팅에 믿음직한 부조종사가 생긴 느낌.\" 마케팅 활용 가치 높음, 케이스 스터디 동의 확인 필요.", timestamp: t(14, 0), type: "summary" },
    ],
    agendaItems: [
      {
        id: "d3-a1",
        title: "사용 현황",
        bullets: [
          "세일즈팀 15명 활용",
          "일 평균 3~4건 고객 미팅에서 사용",
        ],
        isCurrent: false,
      },
      {
        id: "d3-a2",
        title: "만족 기능",
        bullets: [
          "실시간 요약 — 회의록 정리 80% 시간 절감 (30분→5분/건)",
          "AI 힌트 — 기술 미팅 즉답률 향상",
          "고객 모드 — 임원급 미팅 필수, 매일 사용",
        ],
        isCurrent: false,
      },
      {
        id: "d3-a3",
        title: "개선 요청",
        bullets: [
          "팀 대시보드 — 매니저 통합 현황 조회",
          "CRM 연동 — Salesforce 자동 동기화",
          "다국어 지원 — 한영 혼합 인식률 개선",
        ],
        isCurrent: false,
      },
      {
        id: "d3-a4",
        title: "ROI 분석",
        bullets: [
          "미팅 후 정리: 7~8h/일 → 1~2h/일 (월 130시간 절감)",
          "계약 전환율 약 15% 개선",
        ],
        isCurrent: false,
      },
      {
        id: "d3-a5",
        title: "고객 피드백 마무리",
        bullets: [
          "고객 인용: \"미팅의 부조종사\"",
          "케이스 스터디 발행 동의 확인 필요",
          "팀 대시보드 / CRM 연동 로드맵 공유 예정",
        ],
        isCurrent: true,
      },
    ],
    glossary: [
      { term: "NPS (Net Promoter Score)", definition: "고객 충성도를 측정하는 지표. -100~100 범위이며, 50 이상이면 우수한 수준" },
      { term: "CRM (Customer Relationship Management)", definition: "고객 관계 관리 시스템. Salesforce, HubSpot 등이 대표적" },
      { term: "ROI (Return on Investment)", definition: "투자 대비 수익률. 솔루션 도입 효과를 정량적으로 측정하는 핵심 지표" },
      { term: "계약 전환율", definition: "영업 파이프라인에서 미팅/제안 단계에서 실제 계약으로 이어지는 비율" },
    ],
    note: "- 세일즈팀 15명, 일 평균 3~4건 미팅 활용\n- 핵심 만족: 실시간 요약 (시간 80% 절감), 고객 모드\n- 개선 요청: 팀 대시보드, CRM(Salesforce) 연동, 다국어\n- ROI: 월 130시간 절감, 계약 전환율 15% 개선\n- 케이스 스터디 발행 동의 여부 확인 필요\n- \"미팅의 부조종사\" - 고객 인용문으로 활용 가능",
    minutes: `# B2B SaaS 고객 인터뷰 회의록

## 참석자
- 프로덕트팀 인터뷰어
- 고객사 세일즈팀 리드

## 사용 현황
- 세일즈팀 15명 활용
- 일 평균 3~4건 고객 미팅에서 사용

## 만족 기능 (Top 3)
1. **실시간 요약**: 회의록 정리 80% 시간 절감 (30분→5분)
2. **AI 힌트**: 기술 미팅 즉답률 향상
3. **고객 모드**: 임원급 미팅 필수 기능

## 개선 요청
1. **팀 대시보드**: 매니저가 팀원 미팅 현황 통합 조회
2. **CRM 연동**: Salesforce 자동 동기화
3. **다국어 지원**: 한영 혼합 미팅 인식률 개선

## ROI 지표
- 미팅 후 정리 시간: 7~8시간/일 → 1~2시간/일 (월 130시간 절감)
- 계약 전환율: 약 15% 개선

## 고객 인용
> "미팅의 부조종사. 혼자 운전하던 미팅에 믿음직한 부조종사가 생긴 느낌."

## Action Items
- [ ] 케이스 스터디 발행 동의 확인
- [ ] 팀 대시보드 / CRM 연동 로드맵 공유
- [ ] 다국어 지원 현황 및 계획 안내`,
  },
];
