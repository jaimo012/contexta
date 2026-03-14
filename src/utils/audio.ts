/**
 * 오디오 관련 유틸리티 (Phase 0 - 플레이스홀더)
 * 마이크 접근, 오디오 스트림 처리 등의 헬퍼 함수를 정의합니다.
 */

export async function checkMicrophonePermission(): Promise<boolean> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach((track) => track.stop());
    return true;
  } catch {
    return false;
  }
}

export function createAudioContext(): AudioContext {
  return new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
}
