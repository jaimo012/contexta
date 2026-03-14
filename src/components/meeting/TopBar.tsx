"use client";

import { useMeetingStore } from "@/store/useMeetingStore";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { useMeetingTimer } from "@/hooks/useMeetingTimer";

function formatTime(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

export default function TopBar() {
  const meetingTime = useMeetingStore((s) => s.meetingTime);
  const isRecording = useMeetingStore((s) => s.isRecording);
  const isSpeaking = useMeetingStore((s) => s.isSpeaking);
  const { startRecording, stopRecording } = useAudioRecorder();
  const { startTimer, stopTimer } = useMeetingTimer();

  const handleStart = () => {
    startRecording();
    startTimer();
  };

  const handleStop = () => {
    stopRecording();
    stopTimer();
  };

  return (
    <div className="h-16 bg-white border-b border-gray-200 px-4 md:px-6 flex items-center justify-between shrink-0">
      {/* 좌측: 미팅 제목 */}
      <h1 className="text-sm md:text-base font-bold text-gray-900 truncate max-w-[200px] md:max-w-xs">
        A사 솔루션 도입 1차 미팅
      </h1>

      {/* 중앙: 타이머 + VAD 인디케이터 */}
      <div className="flex items-center gap-2.5">
        {isRecording && (
          <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
        )}
        <span className="font-mono text-sm text-gray-500 tabular-nums">
          {formatTime(meetingTime)}
        </span>
        {isRecording && (
          <span
            className={`h-2.5 w-2.5 rounded-full ${
              isSpeaking
                ? "bg-green-500 animate-pulse"
                : "bg-gray-300"
            }`}
            title={isSpeaking ? "음성 감지 중" : "무음"}
          />
        )}
      </div>

      {/* 우측: 액션 버튼 */}
      <div className="flex items-center gap-2 md:gap-3">
        <button className="px-3 md:px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
          💡 힌트 줘
        </button>
        <button
          onClick={isRecording ? handleStop : handleStart}
          className={`px-3 md:px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            isRecording
              ? "text-white bg-gray-700 hover:bg-gray-800"
              : "text-white bg-red-500 hover:bg-red-600"
          }`}
        >
          {isRecording ? "⏹ 녹음 종료" : "🔴 녹음 시작"}
        </button>
      </div>
    </div>
  );
}
