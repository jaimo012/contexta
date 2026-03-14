"use client";

import { useState } from "react";
import { COLORS } from "@/constants/theme";

interface ClientModeOverlayProps {
  isActive: boolean;
}

export default function ClientModeOverlay({ isActive }: ClientModeOverlayProps) {
  const [text, setText] = useState("");

  if (!isActive) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col"
      style={{ backgroundColor: COLORS.clientModeBg }}
    >
      <div
        className="flex h-10 items-center border-b px-4"
        style={{ borderColor: COLORS.clientModeBorder }}
      >
        <span
          className="text-sm"
          style={{ color: COLORS.clientModeText }}
        >
          메모장
        </span>
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        autoFocus
        className="flex-1 w-full resize-none border-none p-4 text-sm leading-relaxed focus:outline-none"
        style={{
          backgroundColor: COLORS.clientModeBg,
          color: COLORS.clientModeText,
          caretColor: COLORS.clientModeText,
        }}
        placeholder="메모를 입력하세요..."
      />
    </div>
  );
}
