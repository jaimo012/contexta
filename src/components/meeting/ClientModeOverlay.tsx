"use client";

import { useState, useCallback } from "react";
import { useMeetingStore } from "@/store/useMeetingStore";

export default function ClientModeOverlay() {
  const isClientMode = useMeetingStore((s) => s.isClientMode);
  const [text, setText] = useState("");

  const preventBounce = useCallback((e: React.TouchEvent) => {
    e.stopPropagation();
  }, []);

  if (!isClientMode) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-client-bg flex flex-col overflow-hidden overscroll-none safe-top safe-bottom"
      onTouchMove={preventBounce}
    >
      <div className="h-8 bg-[#f0f0f0] border-b border-[#d4d4d4] flex items-center px-3 shrink-0">
        <span className="text-xs text-client-text">메모장</span>
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        autoFocus
        className="flex-1 w-full resize-none border-none bg-client-bg p-4 text-sm leading-relaxed text-client-text focus:outline-none overscroll-none"
        style={{ caretColor: "#6b6b6b", WebkitOverflowScrolling: "touch" }}
      />
    </div>
  );
}
