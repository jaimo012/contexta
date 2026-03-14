"use client";

import SplitView from "@/components/layout/SplitView";
import HintPanel from "@/components/meeting/HintPanel";
import MemoPanel from "@/components/meeting/MemoPanel";
import ClientModeOverlay from "@/components/meeting/ClientModeOverlay";
import RecordingControls from "@/components/meeting/RecordingControls";
import { useClientMode } from "@/hooks/useClientMode";
import { useRecording } from "@/hooks/useRecording";
import { CLIENT_MODE_SHORTCUT } from "@/constants/config";

interface MeetingPageProps {
  params: Promise<{ id: string }>;
}

export default function MeetingPage({ params: _params }: MeetingPageProps) {
  const { isClientMode } = useClientMode();
  const { isRecording, elapsedTime, startRecording, stopRecording } = useRecording();

  const handleRequestHint = () => {
    // Phase 2에서 AI 힌트 요청 로직 구현
  };

  return (
    <div className="flex h-screen flex-col">
      <ClientModeOverlay isActive={isClientMode} />

      <header className="flex h-10 items-center justify-between border-b border-zinc-200 bg-white px-4">
        <div className="flex items-center gap-3">
          <a href="/dashboard" className="text-zinc-400 hover:text-zinc-700 text-sm">
            ← 대시보드
          </a>
          <span className="text-sm font-medium text-zinc-700">미팅 진행 중</span>
        </div>
        <span className="text-xs text-zinc-400">
          {CLIENT_MODE_SHORTCUT}키로 클라이언트 모드 전환
        </span>
      </header>

      <div className="flex-1 overflow-hidden">
        <SplitView
          leftPanel={
            <HintPanel summaryBlocks={[]} isRecording={isRecording} />
          }
          rightPanel={<MemoPanel meetingId="placeholder" />}
          isClientMode={isClientMode}
        />
      </div>

      <RecordingControls
        isRecording={isRecording}
        onStart={startRecording}
        onStop={stopRecording}
        onRequestHint={handleRequestHint}
        elapsedTime={elapsedTime}
      />
    </div>
  );
}
