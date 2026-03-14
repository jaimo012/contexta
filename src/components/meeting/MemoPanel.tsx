"use client";

import { useState } from "react";

interface MemoPanelProps {
  meetingId: string;
}

export default function MemoPanel({ meetingId: _meetingId }: MemoPanelProps) {
  const [memo, setMemo] = useState("");

  return (
    <div className="flex flex-col h-full p-4">
      <h2 className="text-sm font-semibold text-zinc-700 mb-3">
        Knowledge & Input
      </h2>
      <textarea
        value={memo}
        onChange={(e) => setMemo(e.target.value)}
        placeholder="메모를 입력하세요. AI가 이 내용을 맥락으로 활용합니다."
        className="flex-1 w-full resize-none rounded-lg border border-zinc-200 p-3 text-sm
          placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400"
      />
    </div>
  );
}
