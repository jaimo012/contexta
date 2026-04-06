"use client";

import { useState, useEffect } from "react";
import {
  X,
  Check,
  Calendar as CalendarIcon,
  Loader2,
  AlertCircle,
  Link2,
  Trash2,
  RefreshCw,
} from "lucide-react";
import { supabase } from "@/utils/supabaseClient";
import { useAuthStore } from "@/store/useAuthStore";
import { useCalendarConnection } from "@/hooks/useCalendarConnection";
import { useCalendarStore, type GoogleCalendar } from "@/store/useCalendarStore";
import { useCalendarSync } from "@/hooks/useCalendarSync";
import { apiUrl } from "@/utils/apiUrl";

interface CalendarIntegrationModalProps {
  open: boolean;
  onClose: () => void;
}

const GOOGLE_CALENDAR_SCOPE = "https://www.googleapis.com/auth/calendar.readonly";

type ModalTab = "connection" | "calendars" | "ical";

export default function CalendarIntegrationModal({
  open,
  onClose,
}: CalendarIntegrationModalProps) {
  const user = useAuthStore((s) => s.user);
  const { connection, isConnected, connect, disconnect } = useCalendarConnection();
  const {
    googleCalendars,
    selectedCalendarIds,
    icalUrls,
    setSelectedCalendarIds,
    addIcalUrl,
    removeIcalUrl,
  } = useCalendarStore();
  const { fetchCalendars, syncEvents, isLoadingCalendars, isLoadingEvents } =
    useCalendarSync();

  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ModalTab>("connection");
  const [icalInput, setIcalInput] = useState("");
  const [isAddingIcal, setIsAddingIcal] = useState(false);
  const [pendingCalendarIds, setPendingCalendarIds] = useState<string[]>([]);

  // Switch to appropriate tab when opening and sync calendar state
  useEffect(() => {
    if (!open) return;
    if (isConnected) {
      setActiveTab("calendars");
      fetchCalendars();
    } else {
      setActiveTab("connection");
    }
    setError(null);
    setIcalInput("");
  }, [open, isConnected, fetchCalendars]);

  // Sync pending selection with store
  useEffect(() => {
    setPendingCalendarIds(selectedCalendarIds);
  }, [selectedCalendarIds]);

  if (!open) return null;

  const handleGoogleConnect = async () => {
    setError(null);
    setIsConnecting(true);

    try {
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
        console.warn("[CALENDAR] OAuth 실패, 로컬 연동으로 대체:", oauthError.message);
        connect("google", user?.email);
        setIsConnecting(false);
        onClose();
        return;
      }
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
    setActiveTab("connection");
  };

  const handleToggleCalendar = (id: string) => {
    setPendingCalendarIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleSaveCalendars = async () => {
    setSelectedCalendarIds(pendingCalendarIds);
    await syncEvents();
  };

  const handleAddIcalUrl = async () => {
    const url = icalInput.trim();
    if (!url) return;

    setIsAddingIcal(true);
    setError(null);

    try {
      // Validate by actually fetching
      const res = await fetch(apiUrl("/api/calendar/ical"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "iCal URL을 가져올 수 없습니다.");
        return;
      }

      addIcalUrl(url);
      setIcalInput("");
      // Re-sync to include new events
      await syncEvents();
    } catch (err) {
      console.error("[ICAL] 추가 실패:", err);
      setError("iCal URL 검증 중 오류가 발생했습니다.");
    } finally {
      setIsAddingIcal(false);
    }
  };

  const handleRemoveIcalUrl = async (url: string) => {
    removeIcalUrl(url);
    await syncEvents();
  };

  const calendarsDirty =
    JSON.stringify(pendingCalendarIds.sort()) !==
    JSON.stringify(selectedCalendarIds.sort());

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-xl bg-notion-bg border border-notion-border shadow-xl overflow-hidden animate-fade-in"
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

        {/* Tabs */}
        {isConnected && (
          <div className="flex border-b border-notion-border">
            {(
              [
                { key: "calendars" as const, label: "캘린더 선택" },
                { key: "ical" as const, label: "iCal URL" },
                { key: "connection" as const, label: "연동 관리" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${
                  activeTab === tab.key
                    ? "text-mint-dark border-b-2 border-mint"
                    : "text-notion-text-muted hover:text-notion-text"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* Body */}
        <div className="px-5 py-5 max-h-[60vh] overflow-y-auto">
          {/* ===== Connection Tab ===== */}
          {activeTab === "connection" && (
            <>
              {isConnected && connection ? (
                <div className="flex flex-col gap-4">
                  <div className="flex items-start gap-3 rounded-lg border border-mint/30 bg-mint-light/40 p-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-mint shrink-0">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-dark">
                        {connection.provider === "google"
                          ? "Google 캘린더"
                          : "Outlook 캘린더"}{" "}
                        연동됨
                      </p>
                      {connection.email && (
                        <p className="text-xs text-notion-text-secondary mt-0.5 truncate">
                          {connection.email}
                        </p>
                      )}
                      <p className="text-[11px] text-notion-text-muted mt-1">
                        연동일:{" "}
                        {new Date(connection.connectedAt).toLocaleDateString(
                          "ko-KR"
                        )}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleDisconnect}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-medium text-pink border border-pink/30 rounded-lg hover:bg-pink/5 transition-colors"
                  >
                    연동 해제
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <p className="text-sm text-notion-text-secondary leading-relaxed">
                    외부 캘린더를 연동하면 일정이{" "}
                    <strong className="text-dark">다가오는 미팅</strong>에
                    자동으로 표시됩니다.
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

                  {/* iCal URL shortcut for non-connected users */}
                  <div className="border-t border-notion-border pt-4 mt-1">
                    <p className="text-xs text-notion-text-secondary mb-3">
                      또는 <strong>iCal URL</strong>로 캘린더를 가져올 수 있습니다.
                      Google/Outlook/네이버 캘린더 등 대부분의 캘린더 서비스에서 공유 URL을
                      제공합니다.
                    </p>
                    <IcalUrlInput
                      value={icalInput}
                      onChange={setIcalInput}
                      onAdd={handleAddIcalUrl}
                      isAdding={isAddingIcal}
                    />
                    <IcalUrlList urls={icalUrls} onRemove={handleRemoveIcalUrl} />
                  </div>

                  <p className="text-[11px] text-notion-text-muted leading-relaxed">
                    Contexta는 캘린더 일정 조회 권한만 요청하며, 일정을 변경하거나
                    삭제하지 않습니다.
                  </p>
                </div>
              )}
            </>
          )}

          {/* ===== Calendar Selection Tab ===== */}
          {activeTab === "calendars" && isConnected && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-dark">
                  동기화할 캘린더 선택
                </p>
                <button
                  onClick={fetchCalendars}
                  disabled={isLoadingCalendars}
                  className="inline-flex items-center gap-1 text-[11px] text-notion-text-muted hover:text-notion-text transition-colors"
                >
                  <RefreshCw
                    className={`h-3 w-3 ${isLoadingCalendars ? "animate-spin" : ""}`}
                  />
                  새로고침
                </button>
              </div>

              {isLoadingCalendars ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-mint" />
                  <span className="ml-2 text-xs text-notion-text-muted">
                    캘린더 목록을 가져오는 중...
                  </span>
                </div>
              ) : googleCalendars.length === 0 ? (
                <p className="text-xs text-notion-text-muted text-center py-6">
                  가져올 캘린더가 없습니다. Google 계정에 캘린더가 있는지 확인해 주세요.
                </p>
              ) : (
                <>
                  <div className="space-y-1.5">
                    {googleCalendars.map((cal) => (
                      <CalendarCheckbox
                        key={cal.id}
                        calendar={cal}
                        checked={pendingCalendarIds.includes(cal.id)}
                        onChange={() => handleToggleCalendar(cal.id)}
                      />
                    ))}
                  </div>

                  <button
                    onClick={handleSaveCalendars}
                    disabled={!calendarsDirty || isLoadingEvents}
                    className="w-full px-4 py-2.5 text-sm font-semibold rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed bg-mint text-white hover:bg-mint-dark"
                  >
                    {isLoadingEvents ? (
                      <span className="inline-flex items-center gap-2">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        동기화 중...
                      </span>
                    ) : calendarsDirty ? (
                      "저장 및 동기화"
                    ) : (
                      "변경 사항 없음"
                    )}
                  </button>
                </>
              )}
            </div>
          )}

          {/* ===== iCal URL Tab ===== */}
          {activeTab === "ical" && (
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-sm font-medium text-dark mb-1">
                  iCal URL로 캘린더 가져오기
                </p>
                <p className="text-xs text-notion-text-secondary leading-relaxed">
                  Google, Outlook, 네이버 캘린더 등에서 제공하는 공유 URL(.ics)을
                  붙여넣으면 일정이 자동으로 가져와집니다.
                </p>
              </div>

              {/* How-to guide */}
              <div className="rounded-lg border border-notion-border bg-notion-bg-sub p-3">
                <p className="text-[11px] font-semibold text-notion-text mb-2">
                  iCal URL 찾는 방법
                </p>
                <div className="space-y-1.5 text-[11px] text-notion-text-secondary leading-relaxed">
                  <p>
                    <strong>Google 캘린더:</strong> 설정 → 특정 캘린더 → &quot;iCal
                    형식의 공개 주소&quot; 또는 &quot;비밀 주소(iCal 형식)&quot;
                  </p>
                  <p>
                    <strong>Outlook:</strong> 설정 → 캘린더 → 공유 캘린더 →
                    &quot;ICS 링크&quot;
                  </p>
                  <p>
                    <strong>네이버 캘린더:</strong> 캘린더 설정 → 구독 URL 복사
                  </p>
                </div>
              </div>

              <IcalUrlInput
                value={icalInput}
                onChange={setIcalInput}
                onAdd={handleAddIcalUrl}
                isAdding={isAddingIcal}
              />

              <IcalUrlList urls={icalUrls} onRemove={handleRemoveIcalUrl} />
            </div>
          )}

          {/* Error display */}
          {error && (
            <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-3 mt-4">
              <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
              <p className="text-xs text-red-600 leading-relaxed">{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ===== Sub-components ===== */

function CalendarCheckbox({
  calendar,
  checked,
  onChange,
}: {
  calendar: GoogleCalendar;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex items-center gap-3 rounded-lg border border-notion-border p-3 cursor-pointer hover:bg-notion-bg-hover transition-colors">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 rounded border-notion-border text-mint accent-mint"
      />
      <div
        className="h-3 w-3 rounded-full shrink-0"
        style={{ backgroundColor: calendar.backgroundColor ?? "#4285F4" }}
      />
      <span className="text-sm text-dark flex-1 truncate">
        {calendar.summary}
      </span>
      {calendar.primary && (
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-mint-light text-mint-dark font-medium">
          기본
        </span>
      )}
    </label>
  );
}

function IcalUrlInput({
  value,
  onChange,
  onAdd,
  isAdding,
}: {
  value: string;
  onChange: (v: string) => void;
  onAdd: () => void;
  isAdding: boolean;
}) {
  return (
    <div className="flex gap-2">
      <div className="flex-1 relative">
        <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-notion-text-muted" />
        <input
          type="url"
          placeholder="https://calendar.google.com/...basic.ics"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && value.trim()) onAdd();
          }}
          className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-notion-border bg-notion-bg text-dark placeholder:text-notion-text-muted focus:outline-none focus:border-mint transition-colors"
        />
      </div>
      <button
        onClick={onAdd}
        disabled={!value.trim() || isAdding}
        className="px-4 py-2.5 text-sm font-medium rounded-lg bg-mint text-white hover:bg-mint-dark disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
      >
        {isAdding ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          "추가"
        )}
      </button>
    </div>
  );
}

function IcalUrlList({
  urls,
  onRemove,
}: {
  urls: string[];
  onRemove: (url: string) => void;
}) {
  if (urls.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="text-[11px] font-medium text-notion-text-muted">
        등록된 iCal URL ({urls.length})
      </p>
      {urls.map((url) => (
        <div
          key={url}
          className="flex items-center gap-2 rounded-lg border border-notion-border bg-notion-bg-sub p-2.5"
        >
          <Link2 className="h-3 w-3 text-notion-text-muted shrink-0" />
          <span className="text-xs text-notion-text-secondary flex-1 truncate">
            {url}
          </span>
          <button
            onClick={() => onRemove(url)}
            className="rounded p-1 text-notion-text-muted hover:text-pink transition-colors shrink-0"
            title="삭제"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      ))}
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
