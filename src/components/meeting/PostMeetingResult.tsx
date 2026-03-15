"use client";

import { useEffect } from "react";
import Link from "next/link";
import Markdown from "react-markdown";
import { useMeetingStore } from "@/store/useMeetingStore";
import { downloadAsTxt, copyToClipboard } from "@/utils/exportUtils";

export default function PostMeetingResult() {
  const isMeetingEnded = useMeetingStore((s) => s.isMeetingEnded);
  const isGeneratingMinutes = useMeetingStore((s) => s.isGeneratingMinutes);
  const finalMinutes = useMeetingStore((s) => s.finalMinutes);
  const isSavedToDb = useMeetingStore((s) => s.isSavedToDb);
  const setMeetingEnded = useMeetingStore((s) => s.setMeetingEnded);

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
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
      <div className="relative w-full max-w-3xl max-h-[85vh] mx-4 rounded-2xl bg-white shadow-2xl flex flex-col overflow-hidden">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0">
          <h2 className="text-lg font-bold text-gray-900">
            {isGeneratingMinutes ? "회의록 생성 중" : "미팅 회의록"}
          </h2>
          {!isGeneratingMinutes && finalMinutes && (
            <button
              onClick={() => setMeetingEnded(false)}
              className="text-sm text-gray-400 hover:text-gray-700 transition-colors"
            >
              ✕ 닫기
            </button>
          )}
        </div>

        {/* 본문 */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {isGeneratingMinutes ? (
            <div className="flex flex-col items-center justify-center gap-4 py-20">
              <div className="h-10 w-10 rounded-full border-4 border-gray-200 border-t-gray-800 animate-spin" />
              <p className="text-sm text-gray-500">
                AI가 완벽한 회의록을 작성 중입니다...
              </p>
              <p className="text-xs text-gray-400">
                대화 내용을 분석하여 4가지 모듈로 정리하고 있어요.
              </p>
            </div>
          ) : finalMinutes ? (
            <article className="prose prose-sm prose-gray max-w-none">
              <Markdown>{finalMinutes}</Markdown>
            </article>
          ) : (
            <div className="flex flex-col items-center justify-center gap-4 py-16">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                <span className="text-2xl">🎙️</span>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600">
                  수집된 대화가 없어 회의록을 생성할 수 없습니다
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  녹음 중 마이크에 대고 말씀해 주세요. 음성이 감지되어야 텍스트가 수집됩니다.
                </p>
              </div>
              <div className="flex items-center gap-3 mt-2">
                <button
                  onClick={() => setMeetingEnded(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  닫고 다시 녹음하기
                </button>
                <Link
                  href="/dashboard"
                  className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  대시보드로 이동
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* 하단 액션 */}
        {!isGeneratingMinutes && finalMinutes && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 shrink-0">
            {isSavedToDb ? (
              <Link
                href="/dashboard"
                className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                ← 대시보드로 돌아가기
              </Link>
            ) : (
              <span className="text-xs text-gray-400">저장 중...</span>
            )}
            <div className="flex items-center gap-3">
              <button
                onClick={() => copyToClipboard(finalMinutes)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                📋 클립보드 복사
              </button>
              <button
                onClick={() => downloadAsTxt("회의록", finalMinutes)}
                className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-700 transition-colors"
              >
                📄 TXT 다운로드
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
