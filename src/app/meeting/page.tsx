"use client";

import { useEffect, useRef } from "react";
import TopBar from "@/components/meeting/TopBar";
import SummaryBlock from "@/components/meeting/SummaryBlock";
import AiHint from "@/components/meeting/AiHint";
import LiveNotepad from "@/components/meeting/LiveNotepad";
import GlossaryCard from "@/components/meeting/GlossaryCard";
import ClientModeOverlay from "@/components/meeting/ClientModeOverlay";
import PostMeetingResult from "@/components/meeting/PostMeetingResult";
import { useMeetingStore } from "@/store/useMeetingStore";

export default function MeetingPage() {
  const toggleClientMode = useMeetingStore((s) => s.toggleClientMode);
  const transcripts = useMeetingStore((s) => s.transcripts);
  const hints = useMeetingStore((s) => s.hints);
  const isRecording = useMeetingStore((s) => s.isRecording);

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcripts, hints]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.code === "Space") {
        e.preventDefault();
        toggleClientMode();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleClientMode]);

  const hasContent = transcripts.length > 0 || hints.length > 0;

  return (
    <div className="h-screen w-screen overflow-hidden bg-notion-bg flex flex-col">
      <ClientModeOverlay />
      <PostMeetingResult />
      <TopBar />

      <div className="flex-1 flex flex-col md:flex-row w-full overflow-hidden">
        {/* Left: Main content area (Notion page style) */}
        <section className="w-full md:w-[70%] h-1/2 md:h-full border-b md:border-b-0 md:border-r border-notion-border bg-notion-bg overflow-y-auto overscroll-none">
          <div className="max-w-[720px] mx-auto px-6 md:px-12 py-6">
            {!hasContent && (
              <div className="flex items-center justify-center h-[60vh]">
                <p className="text-sm text-notion-text-muted">
                  {isRecording
                    ? "음성을 인식하고 있습니다. 대화를 시작하세요..."
                    : "녹음을 시작하면 실시간 요약과 힌트가 여기에 표시됩니다."}
                </p>
              </div>
            )}

            {transcripts.map((entry) => (
              <SummaryBlock
                key={entry.id}
                time={new Date(entry.timestamp).toLocaleTimeString("ko-KR", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
                content={[entry.text]}
              />
            ))}

            {hints.map((hint) => (
              <div key={hint.id} className="py-1.5 animate-fade-in">
                <AiHint message={hint.text} />
              </div>
            ))}

            <div ref={bottomRef} />
          </div>
        </section>

        {/* Right: Sidebar */}
        <aside className="w-full md:w-[30%] h-1/2 md:h-full bg-notion-bg-sub p-4 md:p-5 flex flex-col gap-4 overflow-y-auto overscroll-none border-l border-notion-border">
          <LiveNotepad />
          <div className="flex flex-col gap-2 overflow-y-auto">
            <h2 className="text-xs font-semibold text-notion-text-secondary uppercase tracking-wider">
              용어 사전
            </h2>
            <GlossaryCard
              term="Kubernetes"
              definition="컨테이너화된 애플리케이션의 자동 디플로이, 스케일링을 제공하는 시스템"
            />
            <GlossaryCard
              term="SLA (Service Level Agreement)"
              definition="서비스 제공자가 고객에게 보장하는 서비스 품질 수준에 대한 계약"
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
