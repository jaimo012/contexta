"use client";

import type { SummaryBlock } from "@/types/meeting";
import Card from "@/components/ui/Card";

interface HintPanelProps {
  summaryBlocks: SummaryBlock[];
  isRecording: boolean;
}

export default function HintPanel({ summaryBlocks, isRecording }: HintPanelProps) {
  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-zinc-700">Context & Hint</h2>
        {isRecording && (
          <span className="flex items-center gap-1.5 text-xs text-red-500">
            <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            녹음 중
          </span>
        )}
      </div>

      {summaryBlocks.length === 0 ? (
        <p className="text-sm text-zinc-400 text-center py-12">
          미팅이 시작되면 AI 요약과 힌트가 여기에 표시됩니다.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {summaryBlocks.map((block) => (
            <div key={block.id} className="flex flex-col gap-2">
              <Card padding="sm">
                <p className="text-sm text-zinc-800">{block.content}</p>
              </Card>
              {block.hint && (
                <div className="rounded-lg bg-[var(--color-hint-blue)] px-3 py-2">
                  <p className="text-sm font-medium text-zinc-800">
                    💡 {block.hint}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
