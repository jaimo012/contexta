"use client";

import { useEffect, useRef } from "react";
import { useMeetingStore } from "@/store/useMeetingStore";
import { X, WifiOff, AlertTriangle, RefreshCw } from "lucide-react";

const AUTO_DISMISS_MS = 6000;

const ERROR_ICONS: Record<string, typeof AlertTriangle> = {
  network: WifiOff,
  stt: AlertTriangle,
  hint: AlertTriangle,
  summary: AlertTriangle,
  db: AlertTriangle,
};

const ERROR_COLORS: Record<string, string> = {
  network: "border-red-400 bg-red-50 text-red-800",
  stt: "border-yellow-400 bg-yellow-50 text-yellow-800",
  hint: "border-blue-400 bg-blue-50 text-blue-800",
  summary: "border-red-400 bg-red-50 text-red-800",
  db: "border-yellow-400 bg-yellow-50 text-yellow-800",
};

interface ToastProps {
  onRetry?: () => void;
}

export default function Toast({ onRetry }: ToastProps) {
  const lastError = useMeetingStore((s) => s.lastError);
  const clearLastError = useMeetingStore((s) => s.clearLastError);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!lastError) return;

    if (timerRef.current) clearTimeout(timerRef.current);

    // Network errors persist until resolved
    if (lastError.type === "network") return;

    timerRef.current = setTimeout(() => {
      clearLastError();
    }, AUTO_DISMISS_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [lastError, clearLastError]);

  if (!lastError) return null;

  const Icon = ERROR_ICONS[lastError.type] ?? AlertTriangle;
  const colorClass = ERROR_COLORS[lastError.type] ?? ERROR_COLORS.stt;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[60] w-[90%] max-w-md animate-fade-in">
      <div
        className={`flex items-start gap-3 rounded-lg border px-4 py-3 shadow-lg ${colorClass}`}
      >
        <Icon className="h-5 w-5 shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium leading-snug">
            {lastError.message}
          </p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {lastError.retryable && onRetry && (
            <button
              onClick={() => {
                clearLastError();
                onRetry();
              }}
              className="p-1 rounded hover:bg-black/10 transition-colors"
              title="재시도"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={clearLastError}
            className="p-1 rounded hover:bg-black/10 transition-colors"
            title="닫기"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
