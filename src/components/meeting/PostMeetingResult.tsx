"use client";

import { useEffect } from "react";
import Link from "next/link";
import Markdown from "react-markdown";
import { useMeetingStore } from "@/store/useMeetingStore";
import { downloadAsTxt, copyToClipboard } from "@/utils/exportUtils";
import { X, Copy, Download, ArrowLeft, Mic, RefreshCw, AlertTriangle } from "lucide-react";

const ENABLE_DB = process.env.NEXT_PUBLIC_ENABLE_DB === "true";

interface PostMeetingResultProps {
  onRetrySummary?: () => void;
}

export default function PostMeetingResult({ onRetrySummary }: PostMeetingResultProps) {
  const isMeetingEnded = useMeetingStore((s) => s.isMeetingEnded);
  const isGeneratingMinutes = useMeetingStore((s) => s.isGeneratingMinutes);
  const finalMinutes = useMeetingStore((s) => s.finalMinutes);
  const isSavedToDb = useMeetingStore((s) => s.isSavedToDb);
  const summaryError = useMeetingStore((s) => s.summaryError);
  const setMeetingEnded = useMeetingStore((s) => s.setMeetingEnded);
  const resetMeeting = useMeetingStore((s) => s.resetMeeting);

  useEffect(() => {
    if (!isGeneratingMinutes) return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isGeneratingMinutes]);

  if (!isMeetingEnded) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30">
      <div className="relative w-full max-w-3xl max-h-[85vh] mx-4 rounded-xl bg-notion-bg border border-notion-border shadow-xl flex flex-col overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-notion-border shrink-0">
          <h2 className="text-sm font-semibold text-dark">
            {isGeneratingMinutes ? "회의록 생성 중..." : "미팅 회의록"}
          </h2>
          {!isGeneratingMinutes && finalMinutes && (
            <button
              onClick={() => setMeetingEnded(false)}
              className="rounded-md p-1 text-notion-text-muted hover:bg-notion-bg-hover hover:text-notion-text transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 md:px-12 py-6">
          {isGeneratingMinutes ? (
            <div className="flex flex-col items-center justify-center gap-4 py-20">
              <div className="h-8 w-8 rounded-full border-2 border-notion-border border-t-dark animate-spin" />
              <p className="text-sm text-notion-text-secondary">
                AI가 회의록을 작성하고 있습니다...
              </p>
              <p className="text-xs text-notion-text-muted">
                대화 내용을 분석하여 4가지 모듈로 정리 중
              </p>
            </div>
          ) : finalMinutes ? (
            <article className="prose prose-sm prose-neutral max-w-none [&_h1]:text-dark [&_h2]:text-dark [&_h3]:text-dark [&_p]:text-notion-text [&_li]:text-notion-text [&_strong]:text-dark">
              <Markdown>{finalMinutes}</Markdown>
            </article>
          ) : summaryError ? (
            <div className="flex flex-col items-center justify-center gap-4 py-16">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-dark">
                  회의록 생성에 실패했습니다
                </p>
                <p className="mt-1 text-xs text-notion-text-muted">
                  네트워크 상태를 확인하고 다시 시도해 주세요.
                </p>
              </div>
              <div className="flex items-center gap-2 mt-2">
                {onRetrySummary && (
                  <button
                    onClick={onRetrySummary}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-dark rounded-lg hover:bg-dark/90 transition-colors"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    재시도
                  </button>
                )}
                <Link
                  href={ENABLE_DB ? "/dashboard" : "/meeting"}
                  onClick={!ENABLE_DB ? resetMeeting : undefined}
                  className="px-4 py-2 text-sm font-medium text-notion-text-secondary rounded-lg hover:bg-notion-bg-hover transition-colors"
                >
                  {ENABLE_DB ? "대시보드로 이동" : "새 미팅 시작"}
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-4 py-16">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-notion-surface">
                <Mic className="h-5 w-5 text-notion-text-muted" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-dark">
                  수집된 대화가 없어 회의록을 생성할 수 없습니다
                </p>
                <p className="mt-1 text-xs text-notion-text-muted">
                  녹음 중 마이크에 대고 말씀해 주세요.
                </p>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <button
                  onClick={() => setMeetingEnded(false)}
                  className="px-4 py-2 text-sm font-medium text-notion-text-secondary rounded-lg hover:bg-notion-bg-hover transition-colors"
                >
                  닫고 다시 녹음하기
                </button>
                <Link
                  href={ENABLE_DB ? "/dashboard" : "/meeting"}
                  onClick={!ENABLE_DB ? resetMeeting : undefined}
                  className="px-4 py-2 text-sm font-medium text-mint-dark bg-mint-light rounded-lg hover:bg-mint/15 transition-colors"
                >
                  {ENABLE_DB ? "대시보드로 이동" : "새 미팅 시작"}
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {!isGeneratingMinutes && finalMinutes && (
          <div className="flex items-center justify-between px-6 py-3 border-t border-notion-border shrink-0">
            {ENABLE_DB ? (
              isSavedToDb ? (
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-notion-text-secondary hover:text-dark transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  대시보드
                </Link>
              ) : (
                <span className="text-xs text-notion-text-muted">저장 중...</span>
              )
            ) : (
              <Link
                href="/meeting"
                onClick={resetMeeting}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-notion-text-secondary hover:text-dark transition-colors"
              >
                <Mic className="h-3.5 w-3.5" />
                새 미팅 시작
              </Link>
            )}
            <div className="flex items-center gap-2">
              <button
                onClick={() => copyToClipboard(finalMinutes)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-notion-text-secondary rounded-md hover:bg-notion-bg-hover transition-colors"
              >
                <Copy className="h-3.5 w-3.5" />
                복사
              </button>
              <button
                onClick={() => downloadAsTxt("회의록", finalMinutes)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-dark rounded-md hover:bg-dark/90 transition-colors"
              >
                <Download className="h-3.5 w-3.5" />
                다운로드
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
