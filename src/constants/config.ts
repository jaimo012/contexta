export const APP_NAME = "Contexta";
export const APP_DESCRIPTION = "B2B 영업대표를 위한 실시간 AI 미팅 코파일럿";

export const SPLIT_VIEW_RATIO = {
  LEFT: 70,
  RIGHT: 30,
} as const;

export const SUMMARY_INTERVAL_MS = 5 * 60 * 1000;
export const SILENCE_THRESHOLD_MS = 2500;

export const CLIENT_MODE_SHORTCUT = "F4";

export const SUPPORTED_EXPORT_FORMATS = ["txt", "md", "pdf", "docx"] as const;
export type ExportFormat = (typeof SUPPORTED_EXPORT_FORMATS)[number];
