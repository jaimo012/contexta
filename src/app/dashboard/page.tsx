"use client";

import { useState } from "react";
import Link from "next/link";
import Markdown from "react-markdown";
import { useAuthStore } from "@/store/useAuthStore";
import {
  Plus,
  FileText,
  X,
  AlertTriangle,
  Search,
} from "lucide-react";
import { DEMO_MEETINGS } from "@/constants/demoMeetings";
import AppShell, { useAppShell, type Meeting } from "@/components/layout/AppShell";

export default function DashboardPage() {
  return (
    <AppShell title="대시보드">
      <DashboardContent />
    </AppShell>
  );
}

function DashboardContent() {
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);
  const {
    meetings,
    dbReady,
    searchQuery,
    selectedProjectFilter,
    getProjectName,
  } = useAppShell();

  const [selectedMeeting, setSelectedMeeting] = useState<{
    title: string;
    summary: string;
    date: string;
    project?: string;
  } | null>(null);

  const displayName =
    user?.user_metadata?.full_name || user?.email?.split("@")[0] || "사용자";

  // Filter meetings based on sidebar filters
  const filteredMeetings = meetings.filter((meeting: Meeting) => {
    if (selectedProjectFilter && meeting.project_id !== selectedProjectFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const title = (meeting.title || "").toLowerCase();
      const projectName = (getProjectName(meeting.project_id) || "").toLowerCase();
      return title.includes(query) || projectName.includes(query);
    }
    return true;
  });

  if (isLoading) {
    return (
      <div className="flex min-h-full items-center justify-center">
        <div className="h-6 w-6 rounded-full border-2 border-notion-border border-t-dark animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="max-w-[720px] mx-auto px-6 md:px-12 py-10">
        {/* DB warning banner */}
        {!dbReady && (
          <section className="mb-6 animate-fade-in">
            <div className="flex items-start gap-3 rounded-lg border border-[#FFAA00]/30 bg-[#FFAA00]/5 p-4">
              <AlertTriangle className="h-4 w-4 text-[#FFAA00] mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-dark">
                  Supabase 데이터베이스 설정이 필요합니다
                </p>
                <p className="text-xs text-notion-text-secondary mt-1 leading-relaxed">
                  Supabase Dashboard &gt; SQL Editor에서{" "}
                  <code className="px-1 py-0.5 bg-notion-bg-hover rounded text-dark font-mono text-[11px]">
                    database/schema.sql
                  </code>{" "}
                  파일을 실행해 주세요.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Page title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-dark">
            안녕하세요, {displayName}님
          </h1>
          <p className="text-notion-text-secondary mt-1">
            새로운 미팅을 시작하거나, 이전 회의록을 확인하세요.
          </p>
        </div>

        {/* Recent meetings */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold text-notion-text-secondary uppercase tracking-wider">
              {selectedProjectFilter
                ? `${getProjectName(selectedProjectFilter) || "프로젝트"} 미팅`
                : searchQuery
                  ? `"${searchQuery}" 검색 결과`
                  : "최근 미팅"}
            </h2>
            {(searchQuery || selectedProjectFilter) && (
              <span className="text-xs text-notion-text-muted">
                {filteredMeetings.length}건
              </span>
            )}
          </div>

          {meetings.length === 0 ? (
            <div className="flex flex-col">
              {/* CTA banner */}
              <div className="rounded-lg border border-mint/20 bg-mint-light/50 p-4 mb-4">
                <p className="text-sm font-medium text-dark">
                  아래 예시 미팅을 클릭해 Contexta가 생성하는 회의록을
                  확인해보세요
                </p>
                <p className="text-xs text-notion-text-secondary mt-1">
                  녹음을 시작하면 AI가 실시간으로 코칭하고, 회의록을 자동
                  생성합니다.
                </p>
                <Link
                  href="/meeting"
                  className="inline-flex items-center gap-2 rounded-lg bg-mint px-4 py-2 text-sm font-medium text-white hover:bg-mint-dark transition-colors mt-3"
                >
                  <Plus className="h-4 w-4" />첫 미팅 시작하기
                </Link>
              </div>

              {DEMO_MEETINGS.map((demo) => (
                <Link
                  key={demo.id}
                  href={`/meeting?demo=${demo.id}`}
                  className="flex items-center gap-3 px-2 py-2.5 -mx-2 rounded-md hover:bg-notion-bg-hover transition-colors cursor-pointer group"
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded bg-mint-light shrink-0">
                    <FileText className="h-3.5 w-3.5 text-mint-dark" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-dark truncate">
                        {demo.title}
                      </span>
                      <span className="shrink-0 text-[11px] text-mint-dark bg-mint-light rounded px-1.5 py-0.5">
                        {demo.project}
                      </span>
                    </div>
                    <p className="text-xs text-notion-text-secondary mt-0.5 truncate">
                      {demo.snippet}
                    </p>
                  </div>
                  <time className="text-xs text-notion-text-muted shrink-0">
                    {demo.date}
                  </time>
                </Link>
              ))}
              <p className="text-[11px] text-notion-text-muted text-center mt-3">
                예시 데이터입니다. 실제 미팅을 녹음하면 여기에 회의록이 쌓입니다.
              </p>
            </div>
          ) : filteredMeetings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Search className="h-8 w-8 text-notion-border mb-3" />
              <p className="text-sm text-notion-text-muted">
                {searchQuery
                  ? `"${searchQuery}"에 대한 검색 결과가 없습니다`
                  : "해당 프로젝트의 미팅이 없습니다"}
              </p>
            </div>
          ) : (
            <div className="flex flex-col">
              {filteredMeetings.map((meeting) => {
                const projectName = getProjectName(meeting.project_id);
                return (
                  <div
                    key={meeting.id}
                    onClick={() =>
                      setSelectedMeeting({
                        title: meeting.title || "제목 없는 미팅",
                        summary: meeting.summary,
                        date: new Date(meeting.created_at).toLocaleDateString("ko-KR"),
                        project: projectName || undefined,
                      })
                    }
                    className="flex items-center gap-3 px-2 py-2 -mx-2 rounded-md hover:bg-notion-bg-hover transition-colors cursor-pointer group"
                  >
                    <FileText className="h-4 w-4 text-notion-text-muted shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-dark truncate">
                          {meeting.title || "제목 없는 미팅"}
                        </span>
                        {projectName && (
                          <span className="shrink-0 text-xs text-notion-text-muted">
                            {projectName}
                          </span>
                        )}
                      </div>
                    </div>
                    <time className="text-xs text-notion-text-muted shrink-0">
                      {new Date(meeting.created_at).toLocaleDateString("ko-KR")}
                    </time>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* Meeting detail modal */}
      {selectedMeeting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="w-full max-w-3xl max-h-[85vh] mx-4 rounded-xl bg-notion-bg border border-notion-border shadow-xl flex flex-col overflow-hidden animate-fade-in">
            <div className="flex items-center justify-between px-6 py-3 border-b border-notion-border shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <h2 className="text-sm font-semibold text-dark truncate">
                  {selectedMeeting.title}
                </h2>
                {selectedMeeting.project && (
                  <span className="shrink-0 text-[11px] text-mint-dark bg-mint-light rounded px-1.5 py-0.5">
                    {selectedMeeting.project}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-notion-text-muted">
                  {selectedMeeting.date}
                </span>
                <button
                  onClick={() => setSelectedMeeting(null)}
                  className="rounded-md p-1 text-notion-text-muted hover:bg-notion-bg-hover hover:text-notion-text transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-6 md:px-12 py-6">
              <article className="prose prose-sm prose-neutral max-w-none [&_h1]:text-dark [&_h1]:text-xl [&_h1]:mb-4 [&_h2]:text-dark [&_h2]:text-base [&_h2]:mt-6 [&_h3]:text-dark [&_h3]:text-sm [&_p]:text-notion-text [&_li]:text-notion-text [&_strong]:text-dark [&_ul]:my-2 [&_ol]:my-2">
                <Markdown>{selectedMeeting.summary}</Markdown>
              </article>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
