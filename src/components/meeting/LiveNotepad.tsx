"use client";

import { useState } from "react";

export default function LiveNotepad() {
  const [note, setNote] = useState("");

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <h2 className="text-xs font-semibold text-notion-text-secondary uppercase tracking-wider mb-2">
        메모
      </h2>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="고객사 특징이나 맥락을 메모하세요..."
        className="flex-1 w-full resize-none rounded-md border border-notion-border bg-notion-bg p-3 text-sm leading-relaxed text-dark placeholder:text-notion-text-muted focus:border-notion-text-muted focus:outline-none transition-colors"
      />
    </div>
  );
}
