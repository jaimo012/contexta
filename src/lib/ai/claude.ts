/**
 * Claude AI API 연동 모듈 (Phase 0 - 플레이스홀더)
 *
 * 실시간 힌트: Claude 3.5 Haiku
 * 회의록 생성: Claude 3.7 Sonnet (Thinking Mode)
 */

export const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY ?? "";

export const AI_MODELS = {
  REALTIME_HINT: "claude-3-5-haiku-latest",
  REPORT_GENERATION: "claude-3-7-sonnet-latest",
} as const;
