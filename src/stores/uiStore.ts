/**
 * UI 상태 관리 스토어 (Phase 0 - 플레이스홀더)
 * 사이드바, 모달, 토스트 등 전역 UI 상태를 관리합니다.
 */

export interface UIStoreState {
  isSidebarOpen: boolean;
  activeModal: string | null;
}

export const INITIAL_UI_STATE: UIStoreState = {
  isSidebarOpen: false,
  activeModal: null,
};
