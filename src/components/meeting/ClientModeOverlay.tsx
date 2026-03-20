"use client";

import { useCallback, useMemo } from "react";
import { useMeetingStore } from "@/store/useMeetingStore";

export default function ClientModeOverlay() {
  const isClientMode = useMeetingStore((s) => s.isClientMode);
  const note = useMeetingStore((s) => s.note);
  const setNote = useMeetingStore((s) => s.setNote);
  const agendaItems = useMeetingStore((s) => s.agendaItems);
  const summaries = useMeetingStore((s) => s.summaries);

  const preventBounce = useCallback((e: React.TouchEvent) => {
    e.stopPropagation();
  }, []);

  // Build plain-text AI summary that looks like handwritten notes
  const summaryText = useMemo(() => {
    if (agendaItems.length > 0) {
      return agendaItems
        .map((a) => {
          const marker = a.isCurrent ? `▶ ${a.title}` : `  ${a.title}`;
          const bullets = a.bullets.map((b) => `    - ${b}`).join("\n");
          return `${marker}\n${bullets}`;
        })
        .join("\n\n");
    }

    // Fallback: flat summaries
    const summaryOnly = summaries.filter((s) => s.type === "summary");
    if (summaryOnly.length > 0) {
      return summaryOnly.map((s) => `- ${s.text}`).join("\n");
    }

    return "";
  }, [agendaItems, summaries]);

  if (!isClientMode) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-client-bg flex flex-col overflow-hidden overscroll-none safe-top safe-bottom"
      onTouchMove={preventBounce}
    >
      <div className="h-8 bg-[#f0f0f0] border-b border-[#d4d4d4] flex items-center px-3 shrink-0">
        <span className="text-xs text-client-text">메모장</span>
      </div>

      <div className="flex-1 flex flex-col overflow-y-auto overscroll-none">
        {/* AI summary section - read-only, looks like pre-typed notes */}
        {summaryText && (
          <div className="px-4 pt-4 pb-2 border-b border-[#e0e0e0] shrink-0">
            <pre className="whitespace-pre-wrap text-sm leading-relaxed text-client-text font-sans">
              {summaryText}
            </pre>
          </div>
        )}

        {/* User notes - editable, synced with store */}
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          autoFocus
          placeholder="메모..."
          className="flex-1 w-full resize-none border-none bg-client-bg p-4 text-sm leading-relaxed text-client-text placeholder:text-[#b0b0b0] focus:outline-none overscroll-none"
          style={{ caretColor: "#6b6b6b", WebkitOverflowScrolling: "touch" }}
        />
      </div>
    </div>
  );
}
