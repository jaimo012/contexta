"use client";

import { useState } from "react";

export default function LiveNotepad() {
  const [note, setNote] = useState("");

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
        라이브 메모
      </h2>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="고객사 특징이나 맥락을 가볍게 메모하세요..."
        className="flex-1 w-full resize-none rounded-lg border border-gray-200 bg-white p-3 text-sm leading-relaxed text-gray-800 placeholder:text-gray-400 focus:border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-300"
      />
    </div>
  );
}
