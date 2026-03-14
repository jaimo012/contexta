"use client";

import { useState } from "react";
import { useMeetingStore } from "@/store/useMeetingStore";

export default function ClientModeOverlay() {
  const isClientMode = useMeetingStore((s) => s.isClientMode);
  const [text, setText] = useState("");

  if (!isClientMode) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#f5f5f5] flex flex-col">
      <div className="h-8 bg-[#f0f0f0] border-b border-[#d4d4d4] flex items-center px-3">
        <span className="text-xs text-[#6b6b6b]">메모장</span>
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        autoFocus
        className="flex-1 w-full resize-none border-none bg-[#f5f5f5] p-4 text-sm leading-relaxed text-[#6b6b6b] focus:outline-none"
        style={{ caretColor: "#6b6b6b" }}
      />
    </div>
  );
}
