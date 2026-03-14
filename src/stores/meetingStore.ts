/**
 * 미팅 상태 관리 스토어 (Phase 0 - 플레이스홀더)
 * 후속 Phase에서 Zustand 등으로 구현합니다.
 */

export interface MeetingStoreState {
  currentMeetingId: string | null;
  isRecording: boolean;
  isClientMode: boolean;
}

export const INITIAL_MEETING_STATE: MeetingStoreState = {
  currentMeetingId: null,
  isRecording: false,
  isClientMode: false,
};
