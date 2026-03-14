"use client";

import Button from "@/components/ui/Button";

interface RecordingControlsProps {
  isRecording: boolean;
  onStart: () => void;
  onStop: () => void;
  onRequestHint: () => void;
  elapsedTime: number;
}

function formatElapsedTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n: number) => n.toString().padStart(2, "0");

  return hours > 0
    ? `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
    : `${pad(minutes)}:${pad(seconds)}`;
}

export default function RecordingControls({
  isRecording,
  onStart,
  onStop,
  onRequestHint,
  elapsedTime,
}: RecordingControlsProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-2 border-t border-zinc-200 bg-white">
      {isRecording ? (
        <>
          <Button variant="danger" size="sm" onClick={onStop}>
            ⏹ 녹음 종료
          </Button>
          <span className="text-sm font-mono text-zinc-500">
            {formatElapsedTime(elapsedTime)}
          </span>
          <Button variant="ghost" size="sm" onClick={onRequestHint}>
            힌트 줘
          </Button>
        </>
      ) : (
        <Button variant="primary" size="sm" onClick={onStart}>
          🎙 녹음 시작
        </Button>
      )}
    </div>
  );
}
