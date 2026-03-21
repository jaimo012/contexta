/* ===== Profile Options & Types ===== */

export interface ProfileData {
  companyName: string;
  industry: string;
  companySize: string;
  displayName: string;
  department: string;
  position: string;
  role: string;
  roleDetail: string;
  useCases: string[];
  meetingFrequency: string;
  clientTypes: string[];
  coachingStyle: string;
  mainProducts: string;
}

export const INITIAL_PROFILE: ProfileData = {
  companyName: "",
  industry: "",
  companySize: "",
  displayName: "",
  department: "",
  position: "",
  role: "",
  roleDetail: "",
  useCases: [],
  meetingFrequency: "",
  clientTypes: [],
  coachingStyle: "",
  mainProducts: "",
};

export const INDUSTRIES = [
  "IT/소프트웨어",
  "제조업",
  "금융/보험",
  "유통/물류",
  "건설/부동산",
  "의료/바이오",
  "교육",
  "컨설팅",
  "미디어/콘텐츠",
  "에너지/환경",
  "기타",
];

export const COMPANY_SIZES = [
  "~10억",
  "10억~100억",
  "100억~1,000억",
  "1,000억~1조",
  "1조 이상",
];

export const ROLES = [
  "영업/세일즈",
  "마케팅",
  "기획/전략",
  "개발/IT",
  "컨설팅",
  "프로젝트 관리",
  "경영/임원",
  "기타",
];

export const USE_CASES = [
  "고객 미팅 실시간 코칭",
  "회의록 자동 생성",
  "기술 협의 지원",
  "영업 데이터 분석",
  "팀 미팅 기록",
  "고객 인터뷰/리서치",
  "내부 회의 효율화",
  "제안/입찰 미팅 준비",
];

export const MEETING_FREQUENCIES = [
  "주 1~2회",
  "주 3~5회",
  "주 6~10회",
  "주 10회 이상",
];

export const CLIENT_TYPES = [
  "대기업",
  "중견기업",
  "중소기업/스타트업",
  "공공기관/공기업",
];

export const COACHING_STYLES = [
  { value: "data", label: "데이터 중심", desc: "수치와 팩트 위주로 힌트 제공" },
  { value: "rapport", label: "관계 중심", desc: "공감과 래포 형성에 초점" },
  { value: "solution", label: "솔루션 중심", desc: "문제해결 방안 위주로 제안" },
  { value: "brief", label: "간결한 키워드", desc: "핵심만 짧게, 빠른 참고용" },
];
