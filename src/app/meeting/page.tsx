"use client";

import { useEffect, useRef } from "react";
import TopBar from "@/components/meeting/TopBar";
import SummaryBlock from "@/components/meeting/SummaryBlock";
import AiHint from "@/components/meeting/AiHint";
import LiveNotepad from "@/components/meeting/LiveNotepad";
import GlossaryCard from "@/components/meeting/GlossaryCard";
import ClientModeOverlay from "@/components/meeting/ClientModeOverlay";
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
    <div className="h-screen w-screen overflow-hidden bg-gray-50 flex flex-col">
      <ClientModeOverlay />
      <TopBar />
      <div className="flex-1 flex flex-row w-full h-[calc(100vh-4rem)]">
        {/* 좌측 메인 영역 (70%) */}
        <section className="w-[70%] h-full border-r bg-white p-6 overflow-y-auto">
          {!hasContent && (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-400 text-sm">
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
            <div key={hint.id} className="pt-2">
              <AiHint message={hint.text} />
            </div>
          ))}

          <div ref={bottomRef} />
        </section>

        {/* 우측 사이드 영역 (30%) */}
        <aside className="w-[30%] h-full bg-gray-50 p-6 flex flex-col gap-4">
          <LiveNotepad />
          <div className="flex flex-col gap-2 overflow-y-auto">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
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
