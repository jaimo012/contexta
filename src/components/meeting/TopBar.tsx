"use client";

import { useMeetingStore } from "@/store/useMeetingStore";

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

  return (
    <div className="h-16 bg-white border-b border-gray-200 px-4 md:px-6 flex items-center justify-between shrink-0">
      {/* 좌측: 미팅 제목 */}
      <h1 className="text-sm md:text-base font-bold text-gray-900 truncate max-w-[200px] md:max-w-xs">
        A사 솔루션 도입 1차 미팅
      </h1>

      {/* 중앙: 타이머 */}
      <div className="flex items-center gap-2">
        {isRecording && (
          <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
        )}
        <span className="font-mono text-sm text-gray-500 tabular-nums">
          {formatTime(meetingTime)}
        </span>
      </div>

      {/* 우측: 액션 버튼 */}
      <div className="flex items-center gap-2 md:gap-3">
        <button className="px-3 md:px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
          💡 힌트 줘
        </button>
        <button className="px-3 md:px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors">
          🔴 녹음 시작
        </button>
      </div>
    </div>
  );
}
