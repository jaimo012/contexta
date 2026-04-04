"use client";

import { Suspense, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Markdown from "react-markdown";
import TopBar from "@/components/meeting/TopBar";
import SummaryBlock from "@/components/meeting/SummaryBlock";
import AiHint from "@/components/meeting/AiHint";
import LiveNotepad from "@/components/meeting/LiveNotepad";
import GlossaryCard from "@/components/meeting/GlossaryCard";
import ClientModeOverlay from "@/components/meeting/ClientModeOverlay";
import PostMeetingResult from "@/components/meeting/PostMeetingResult";
import Toast from "@/components/ui/Toast";
import { useMeetingStore, type MeetingTab, type AgendaItem } from "@/store/useMeetingStore";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { apiUrl } from "@/utils/apiUrl";
import { useAuthStore } from "@/store/useAuthStore";
import { supabase } from "@/utils/supabaseClient";
import { FileText, LayoutList, BookOpen, Loader2, Download, ClipboardCopy, Clock, CheckCircle2, Circle, Sparkles } from "lucide-react";
import { downloadAsTxt, copyToClipboard } from "@/utils/exportUtils";

const TABS: { key: MeetingTab; label: string; icon: typeof LayoutList }[] = [
  { key: "summary", label: "요약", icon: LayoutList },
  { key: "script", label: "스크립트", icon: FileText },
  { key: "minutes", label: "회의록", icon: BookOpen },
];

function MeetingContent() {
  const searchParams = useSearchParams();
  const toggleClientMode = useMeetingStore((s) => s.toggleClientMode);
  const transcripts = useMeetingStore((s) => s.transcripts);
  const summaries = useMeetingStore((s) => s.summaries);
  const isRecording = useMeetingStore((s) => s.isRecording);
  const isDemoMode = useMeetingStore((s) => s.isDemoMode);
  const glossaryTerms = useMeetingStore((s) => s.glossaryTerms);
  const agendaItems = useMeetingStore((s) => s.agendaItems);
  const meetingStartTime = useMeetingStore((s) => s.meetingStartTime);
  const lastUpdateTime = useMeetingStore((s) => s.lastUpdateTime);
  const hints = useMeetingStore((s) => s.hints);
  const activeTab = useMeetingStore((s) => s.activeTab);
  const setActiveTab = useMeetingStore((s) => s.setActiveTab);
  const isMeetingEnded = useMeetingStore((s) => s.isMeetingEnded);
  const isGeneratingMinutes = useMeetingStore((s) => s.isGeneratingMinutes);
  const finalMinutes = useMeetingStore((s) => s.finalMinutes);
  const isSavedToDb = useMeetingStore((s) => s.isSavedToDb);
  const meetingTitle = useMeetingStore((s) => s.meetingTitle);
  const loadDemoData = useMeetingStore((s) => s.loadDemoData);
  const resetMeeting = useMeetingStore((s) => s.resetMeeting);
  const setIsGeneratingMinutes = useMeetingStore((s) => s.setIsGeneratingMinutes);
  const setFinalMinutes = useMeetingStore((s) => s.setFinalMinutes);
  const setSummaryError = useMeetingStore((s) => s.setSummaryError);
  const setLastError = useMeetingStore((s) => s.setLastError);
  const setIsSavedToDb = useMeetingStore((s) => s.setIsSavedToDb);
  const setSttPaused = useMeetingStore((s) => s.setSttPaused);
  const setSttErrorCount = useMeetingStore((s) => s.setSttErrorCount);

  // Network status monitoring
  useNetworkStatus();

  const bottomRef = useRef<HTMLDivElement>(null);

  // Retry summary generation
  const retrySummary = useCallback(async () => {
    const { transcripts: t } = useMeetingStore.getState();
    if (t.length === 0) return;

    const fullTranscript = t.map((entry) => entry.text).join("\n");
    setIsGeneratingMinutes(true);
    setSummaryError(false);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60_000);

      const res = await fetch(apiUrl("/api/summary"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullTranscript }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const data = await res.json();

      if (!res.ok || !data.minutes) {
        setSummaryError(true);
        setLastError({
          type: "summary",
          message: "회의록 재생성에 실패했습니다.",
          timestamp: Date.now(),
          retryable: true,
        });
        return;
      }

      setFinalMinutes(data.minutes);

      // Try to save to DB
      const user = useAuthStore.getState().user;
      if (user) {
        const { meetingTitle: title, selectedProjectId: projectId } = useMeetingStore.getState();
        const row: Record<string, unknown> = {
          user_id: user.id,
          title: title || "제목 없는 미팅",
          transcript: fullTranscript,
          summary: data.minutes,
        };
        if (projectId) row.project_id = projectId;

        const { error } = await supabase.from("meetings").insert(row);
        if (!error) setIsSavedToDb(true);
      }
    } catch (err) {
      setSummaryError(true);
      setLastError({
        type: "summary",
        message: "회의록 재생성 중 오류가 발생했습니다.",
        timestamp: Date.now(),
        retryable: true,
      });
      console.error("[SUMMARY] 재시도 실패:", err);
    } finally {
      setIsGeneratingMinutes(false);
    }
  }, [setIsGeneratingMinutes, setFinalMinutes, setSummaryError, setLastError, setIsSavedToDb]);

  // Retry STT (resume after pause)
  const retryStt = useCallback(() => {
    setSttPaused(false);
    setSttErrorCount(0);
  }, [setSttPaused, setSttErrorCount]);

  // Load demo data if ?demo= param is present
  useEffect(() => {
    const demoId = searchParams.get("demo");
    if (demoId) {
      loadDemoData(demoId);
    }
    return () => {
      const state = useMeetingStore.getState();
      if (state.isDemoMode) {
        resetMeeting();
      }
    };
  }, [searchParams, loadDemoData, resetMeeting]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcripts, summaries, activeTab]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.code === "Space") {
        e.preventDefault();
        toggleClientMode();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleClientMode]);

  // Default glossary for non-demo mode
  const defaultGlossary = [
    { term: "Kubernetes", definition: "컨테이너화된 애플리케이션의 자동 디플로이, 스케일링을 제공하는 시스템" },
    { term: "SLA (Service Level Agreement)", definition: "서비스 제공자가 고객에게 보장하는 서비스 품질 수준에 대한 계약" },
  ];
  const glossary = glossaryTerms.length > 0 ? glossaryTerms : defaultGlossary;

  const hasSummaryContent = agendaItems.length > 0 || summaries.length > 0;
  const hasScriptContent = transcripts.length > 0;
  const hasMinutesContent = !!finalMinutes;

  const formatTime = (ts: number) =>
    new Date(ts).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });

  // Separate hints from summaries for the bottom section
  const hintEntries = hints;

  return (
    <div className="h-screen w-screen overflow-hidden bg-notion-bg flex flex-col">
      <ClientModeOverlay />
      <TopBar />
      <PostMeetingResult onRetrySummary={retrySummary} />
      <Toast onRetry={retryStt} />

      <div className="flex-1 flex flex-col md:flex-row w-full overflow-hidden">
        {/* Left: Main content area with tabs (70%) */}
        <section className="w-full md:w-[70%] h-1/2 md:h-full border-b md:border-b-0 md:border-r border-notion-border bg-notion-bg flex flex-col overflow-hidden">
          {/* Tab bar */}
          <div className="shrink-0 border-b border-notion-border bg-notion-bg">
            <div className="max-w-[720px] mx-auto px-6 md:px-12">
              <div className="flex items-center gap-0.5 -mb-px">
                {TABS.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.key;
                  const hasContent =
                    tab.key === "summary" ? hasSummaryContent :
                    tab.key === "script" ? hasScriptContent :
                    hasMinutesContent;

                  return (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`relative flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium transition-colors ${
                        isActive
                          ? "text-dark"
                          : hasContent
                            ? "text-notion-text-secondary hover:text-dark"
                            : "text-notion-text-muted hover:text-notion-text-secondary"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {tab.label}
                      {/* Active indicator */}
                      {isActive && (
                        <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-dark rounded-full" />
                      )}
                      {/* Content dot indicator */}
                      {!isActive && hasContent && (
                        <span className="h-1.5 w-1.5 rounded-full bg-mint" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto overscroll-none">
            <div className="max-w-[720px] mx-auto px-6 md:px-12 py-6">
              {isDemoMode && (
                <div className="mb-4 flex items-center gap-2 rounded-md bg-mint-light px-3 py-2">
                  <span className="text-xs text-mint-dark font-medium">데모 미팅</span>
                  <span className="text-xs text-notion-text-secondary">— Contexta가 실시간으로 회의를 기록하는 모습입니다</span>
                </div>
              )}

              {/* ===== 요약 Tab ===== */}
              {activeTab === "summary" && (
                <>
                  {!hasSummaryContent ? (
                    <div className="flex items-center justify-center h-[50vh]">
                      <div className="text-center">
                        <LayoutList className="h-8 w-8 text-notion-border mx-auto mb-3" />
                        <p className="text-sm text-notion-text-muted">
                          {isRecording
                            ? "대화를 분석하고 있습니다. 잠시만 기다려주세요..."
                            : "녹음을 시작하면 AI가 논의 내용을 실시간으로 요약합니다."}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      {/* Time header */}
                      {meetingStartTime > 0 && (
                        <div className="flex items-center gap-4 mb-5 pb-4 border-b border-notion-border">
                          <div className="flex items-center gap-1.5 text-xs text-notion-text-secondary">
                            <Clock className="h-3.5 w-3.5" />
                            <span>시작</span>
                            <span className="font-medium text-dark tabular-nums">{formatTime(meetingStartTime)}</span>
                          </div>
                          {lastUpdateTime > 0 && (
                            <div className="flex items-center gap-1.5 text-xs text-notion-text-secondary">
                              <span>마지막 업데이트</span>
                              <span className="font-medium text-dark tabular-nums">{formatTime(lastUpdateTime)}</span>
                            </div>
                          )}
                          {isRecording && (
                            <span className="ml-auto inline-flex items-center gap-1.5 text-xs font-medium text-pink">
                              <span className="h-1.5 w-1.5 rounded-full bg-pink animate-rec-pulse" />
                              녹음 중
                            </span>
                          )}
                        </div>
                      )}

                      {/* Agenda items */}
                      {agendaItems.length > 0 && (
                        <div className="flex flex-col gap-1 mb-6">
                          {agendaItems.map((agenda) => (
                            <AgendaBlock key={agenda.id} item={agenda} />
                          ))}
                        </div>
                      )}

                      {/* Fallback: flat summaries if no agenda items (real meeting before AI processes them) */}
                      {agendaItems.length === 0 && summaries.filter((s) => s.type === "summary").length > 0 && (
                        <div className="flex flex-col gap-1 mb-6">
                          {summaries
                            .filter((s) => s.type === "summary")
                            .map((item) => (
                              <div key={item.id} className="py-2 border-b border-notion-border/50 last:border-b-0 animate-fade-in">
                                <span className="text-xs text-notion-text-muted tabular-nums">
                                  {formatTime(item.timestamp)}
                                </span>
                                <p className="mt-1 text-sm leading-relaxed text-dark">{item.text}</p>
                              </div>
                            ))}
                        </div>
                      )}

                      {/* AI Hints section (bottom) */}
                      {hintEntries.length > 0 && (
                        <div className="border-t border-notion-border pt-4">
                          <div className="flex items-center gap-1.5 mb-3">
                            <Sparkles className="h-3.5 w-3.5 text-mint-dark" />
                            <span className="text-xs font-semibold text-notion-text-secondary uppercase tracking-wider">
                              AI 힌트
                            </span>
                            <span className="text-[11px] text-notion-text-muted ml-1">
                              {hintEntries.length}개
                            </span>
                          </div>
                          <div className="flex flex-col gap-2">
                            {hintEntries.map((hint) => (
                              <div key={hint.id} className="animate-fade-in">
                                <AiHint message={hint.text} />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}

              {/* ===== 스크립트 Tab ===== */}
              {activeTab === "script" && (
                <>
                  {!hasScriptContent ? (
                    <div className="flex items-center justify-center h-[50vh]">
                      <div className="text-center">
                        <FileText className="h-8 w-8 text-notion-border mx-auto mb-3" />
                        <p className="text-sm text-notion-text-muted">
                          {isRecording
                            ? "음성을 인식하고 있습니다..."
                            : "녹음을 시작하면 전체 발화 기록이 여기에 표시됩니다."}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      {transcripts.map((entry) => (
                        <SummaryBlock
                          key={entry.id}
                          time={new Date(entry.timestamp).toLocaleTimeString("ko-KR", {
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })}
                          content={[entry.text]}
                        />
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* ===== 회의록 Tab ===== */}
              {activeTab === "minutes" && (
                <>
                  {isGeneratingMinutes ? (
                    <div className="flex items-center justify-center h-[50vh]">
                      <div className="text-center">
                        <Loader2 className="h-6 w-6 text-mint animate-spin mx-auto mb-3" />
                        <p className="text-sm text-notion-text-muted">
                          AI가 회의록을 생성하고 있습니다...
                        </p>
                        <p className="text-xs text-notion-text-muted mt-1">
                          전체 대화를 분석하여 구조화된 회의록을 작성합니다.
                        </p>
                      </div>
                    </div>
                  ) : !hasMinutesContent ? (
                    <div className="flex items-center justify-center h-[50vh]">
                      <div className="text-center">
                        <BookOpen className="h-8 w-8 text-notion-border mx-auto mb-3" />
                        <p className="text-sm text-notion-text-muted">
                          미팅이 종료되면 AI가 자동으로 회의록을 생성합니다.
                        </p>
                        <p className="text-xs text-notion-text-muted mt-1">
                          녹음 종료 버튼을 누르면 생성이 시작됩니다.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <article className="prose prose-sm prose-neutral max-w-none [&_h1]:text-dark [&_h1]:text-xl [&_h1]:mb-4 [&_h2]:text-dark [&_h2]:text-base [&_h2]:mt-6 [&_h2]:mb-2 [&_h3]:text-dark [&_h3]:text-sm [&_h3]:mt-4 [&_p]:text-notion-text [&_li]:text-notion-text [&_strong]:text-dark [&_ul]:my-2 [&_ol]:my-2 [&_blockquote]:border-l-mint [&_blockquote]:bg-mint-light/30 [&_blockquote]:py-1 [&_code]:text-dark [&_code]:bg-notion-bg-hover [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs">
                        <Markdown>{finalMinutes}</Markdown>
                      </article>

                      {/* Export actions */}
                      <div className="flex items-center gap-2 mt-6 pt-4 border-t border-notion-border">
                        <button
                          onClick={() => copyToClipboard(finalMinutes)}
                          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-notion-text-secondary rounded-md border border-notion-border hover:bg-notion-bg-hover transition-colors"
                        >
                          <ClipboardCopy className="h-3.5 w-3.5" />
                          클립보드 복사
                        </button>
                        <button
                          onClick={() => downloadAsTxt(`${meetingTitle || "회의록"}.txt`, finalMinutes)}
                          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-notion-text-secondary rounded-md border border-notion-border hover:bg-notion-bg-hover transition-colors"
                        >
                          <Download className="h-3.5 w-3.5" />
                          TXT 다운로드
                        </button>
                        {isSavedToDb && (
                          <span className="text-xs text-mint-dark ml-auto">DB에 저장 완료</span>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}

              <div ref={bottomRef} />
            </div>
          </div>
        </section>

        {/* Right: Sidebar (30%) */}
        <aside className="w-full md:w-[30%] h-1/2 md:h-full bg-notion-bg-sub p-4 md:p-5 flex flex-col gap-4 overflow-y-auto overscroll-none border-l border-notion-border">
          <LiveNotepad />
          <div className="flex flex-col gap-2 overflow-y-auto">
            <h2 className="text-xs font-semibold text-notion-text-secondary uppercase tracking-wider">
              용어 사전
            </h2>
            {glossary.map((g) => (
              <GlossaryCard
                key={g.term}
                term={g.term}
                definition={g.definition}
              />
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}

/* ===== Agenda Block Component ===== */
function AgendaBlock({ item }: { item: AgendaItem }) {
  const Icon = item.isCurrent ? CheckCircle2 : Circle;

  return (
    <div
      className={`rounded-lg px-4 py-3 transition-colors ${
        item.isCurrent
          ? "bg-mint-light/60 border border-mint/20"
          : "hover:bg-notion-bg-hover"
      }`}
    >
      <div className="flex items-center gap-2.5">
        <Icon
          className={`h-4 w-4 shrink-0 ${
            item.isCurrent ? "text-mint-dark" : "text-notion-text-muted"
          }`}
        />
        <span
          className={`text-sm font-medium ${
            item.isCurrent ? "text-mint-dark" : "text-dark"
          }`}
        >
          {item.title}
        </span>
        {item.isCurrent && (
          <span className="text-[10px] font-medium text-mint-dark bg-mint/15 rounded px-1.5 py-0.5">
            현재 논의 중
          </span>
        )}
      </div>
      <ul className="mt-2 ml-6.5 flex flex-col gap-1">
        {item.bullets.map((bullet, i) => (
          <li key={i} className="flex items-start gap-2 text-sm leading-relaxed text-notion-text">
            <span className="text-notion-text-muted mt-1.5 shrink-0">•</span>
            <span>{bullet}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function MeetingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-notion-bg">
          <div className="h-6 w-6 rounded-full border-2 border-notion-border border-t-dark animate-spin" />
        </div>
      }
    >
      <MeetingContent />
    </Suspense>
  );
}
