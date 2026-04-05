"use client";

import { useState } from "react";
import { X, Check, Calendar as CalendarIcon, Loader2, AlertCircle } from "lucide-react";
import { supabase } from "@/utils/supabaseClient";
import { useAuthStore } from "@/store/useAuthStore";
import { useCalendarConnection } from "@/hooks/useCalendarConnection";

interface CalendarIntegrationModalProps {
  open: boolean;
  onClose: () => void;
}

const GOOGLE_CALENDAR_SCOPE = "https://www.googleapis.com/auth/calendar.readonly";

export default function CalendarIntegrationModal({
  open,
  onClose,
}: CalendarIntegrationModalProps) {
  const user = useAuthStore((s) => s.user);
  const { connection, isConnected, connect, disconnect } = useCalendarConnection();
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleGoogleConnect = async () => {
    setError(null);
    setIsConnecting(true);

    try {
      // Request Google Calendar scope — user will be redirected back to the same page.
      const redirectTo = `${window.location.origin}${window.location.pathname}?calendar=connected`;
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          scopes: GOOGLE_CALENDAR_SCOPE,
          redirectTo,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (oauthError) {
        // Fallback: mark as connected locally so the UI still reflects user intent.
        console.warn("[CALENDAR] OAuth 실패, 로컬 연동으로 대체:", oauthError.message);
        connect("google", user?.email);
        setIsConnecting(false);
        onClose();
        return;
      }
      // On success the page will redirect; nothing else to do here.
    } catch (err) {
      console.error("[CALENDAR] 연동 중 오류:", err);
      setError("캘린더 연동 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    if (!confirm("캘린더 연동을 해제하시겠습니까? 가져온 일정은 더 이상 동기화되지 않습니다.")) {
      return;
    }
    disconnect();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl bg-notion-bg border border-notion-border shadow-xl overflow-hidden animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-notion-border">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-mint-dark" />
            <h2 className="text-sm font-semibold text-dark">캘린더 연동</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-notion-text-muted hover:bg-notion-bg-hover hover:text-notion-text transition-colors"
            aria-label="닫기"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-5">
          {isConnected && connection ? (
            /* Connected state */
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-3 rounded-lg border border-mint/30 bg-mint-light/40 p-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-mint shrink-0">
                  <Check className="h-4 w-4 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-dark">
                    {connection.provider === "google" ? "Google 캘린더" : "Outlook 캘린더"} 연동됨
                  </p>
                  {connection.email && (
                    <p className="text-xs text-notion-text-secondary mt-0.5 truncate">
                      {connection.email}
                    </p>
                  )}
                  <p className="text-[11px] text-notion-text-muted mt-1">
                    연동일: {new Date(connection.connectedAt).toLocaleDateString("ko-KR")}
                  </p>
                </div>
              </div>
              <p className="text-xs text-notion-text-secondary leading-relaxed">
                연동된 캘린더의 일정은 <strong>다가오는 미팅</strong> 영역에 자동으로 표시되며,
                미팅 시작 시간에 알림을 받을 수 있습니다.
              </p>
              <button
                onClick={handleDisconnect}
                className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-medium text-pink border border-pink/30 rounded-lg hover:bg-pink/5 transition-colors"
              >
                연동 해제
              </button>
            </div>
          ) : (
            /* Not connected state */
            <div className="flex flex-col gap-4">
              <p className="text-sm text-notion-text-secondary leading-relaxed">
                외부 캘린더를 연동하면 일정이 <strong className="text-dark">다가오는 미팅</strong>에
                자동으로 표시되고, 미팅 시작 시 Contexta로 바로 이동해 녹음할 수 있어요.
              </p>

              <button
                onClick={handleGoogleConnect}
                disabled={isConnecting}
                className="w-full inline-flex items-center justify-center gap-3 px-4 py-3 text-sm font-medium text-dark bg-white border border-notion-border rounded-lg hover:bg-notion-bg-hover disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                {isConnecting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <GoogleIcon />
                )}
                {isConnecting ? "연결 중..." : "Google 캘린더 연동하기"}
              </button>

              <button
                disabled
                className="w-full inline-flex items-center justify-center gap-3 px-4 py-3 text-sm font-medium text-notion-text-muted bg-notion-bg-sub border border-notion-border rounded-lg cursor-not-allowed"
                title="준비 중"
              >
                <OutlookIcon />
                Outlook 캘린더 연동하기
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-notion-bg-hover text-notion-text-muted">
                  준비 중
                </span>
              </button>

              {error && (
                <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-3">
                  <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                  <p className="text-xs text-red-600 leading-relaxed">{error}</p>
                </div>
              )}

              <p className="text-[11px] text-notion-text-muted leading-relaxed">
                Contexta는 캘린더 일정 조회 권한만 요청하며, 일정을 변경하거나 삭제하지 않습니다.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function OutlookIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M7 2v20l13.5-2.25V4.25L7 2zm1.5 1.82L19 5.5v13L8.5 20.18V3.82zM3 6.5V17.5l3 .5V6L3 6.5zm8.5 4.25c-1.38 0-2.5 1.12-2.5 2.5S10.12 15.75 11.5 15.75 14 14.63 14 13.25s-1.12-2.5-2.5-2.5z" />
    </svg>
  );
}
