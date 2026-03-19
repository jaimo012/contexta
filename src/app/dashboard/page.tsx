"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabaseClient";
import { useAuthStore } from "@/store/useAuthStore";
import {
  Mic,
  Plus,
  BookOpen,
  LogOut,
  FolderOpen,
  FileText,
  X,
  AlertTriangle,
  Target,
  Gift,
  ArrowRight,
} from "lucide-react";

const WORD_MISSION_THRESHOLD = 10;
const FREE_LIMIT_SECONDS = 3600;
const REWARD_LIMIT_SECONDS = 7200;

interface UserQuota {
  used_seconds: number;
  limit_seconds: number;
}

interface Project {
  id: string;
  name: string;
  created_at: string;
}

interface Meeting {
  id: string;
  title: string;
  summary: string;
  created_at: string;
  project_id: string | null;
}

function formatSeconds(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  if (h > 0 && m > 0) return `${h}시간 ${m}분`;
  if (h > 0) return `${h}시간`;
  return `${m}분`;
}

export default function DashboardPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);

  const [projects, setProjects] = useState<Project[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [quota, setQuota] = useState<UserQuota | null>(null);
  const [wordCount, setWordCount] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [dbReady, setDbReady] = useState(true);

  const displayName =
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "사용자";

  const fetchProjects = useCallback(async () => {
    const { data, error } = await supabase
      .from("projects")
      .select("id, name, created_at")
      .order("created_at", { ascending: false });
    if (error) { setDbReady(false); return; }
    if (data) setProjects(data);
  }, []);

  const fetchMeetings = useCallback(async () => {
    const { data, error } = await supabase
      .from("meetings")
      .select("id, title, summary, created_at, project_id")
      .order("created_at", { ascending: false })
      .limit(10);
    if (error) { setDbReady(false); return; }
    if (data) setMeetings(data);
  }, []);

  const fetchQuota = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("users")
      .select("used_seconds, limit_seconds")
      .eq("id", user.id)
      .single();
    if (error) return;
    if (data) setQuota(data);
  }, [user]);

  const fetchWordCount = useCallback(async () => {
    const { count, error } = await supabase
      .from("custom_words")
      .select("id", { count: "exact", head: true });
    if (error) return;
    setWordCount(count ?? 0);
  }, []);

  const claimReward = useCallback(async () => {
    if (!user) return;
    await supabase
      .from("users")
      .update({ limit_seconds: REWARD_LIMIT_SECONDS })
      .eq("id", user.id);
    await fetchQuota();
  }, [user, fetchQuota]);

  useEffect(() => {
    if (!user) return;
    fetchProjects();
    fetchMeetings();
    fetchQuota();
    fetchWordCount();
  }, [user, fetchProjects, fetchMeetings, fetchQuota, fetchWordCount]);

  const handleCreateProject = async () => {
    if (!newProjectName.trim() || !user) return;
    setIsCreating(true);

    const { error } = await supabase.from("projects").insert({
      user_id: user.id,
      name: newProjectName.trim(),
    });

    if (error) {
      setDbReady(false);
      alert("프로젝트 생성 실패: Supabase SQL Editor에서 schema.sql을 먼저 실행해 주세요.");
      console.warn("[DB] 프로젝트 생성 실패:", error.message);
    } else {
      setNewProjectName("");
      setIsModalOpen(false);
      await fetchProjects();
    }
    setIsCreating(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const handleDeleteProject = async (projectId: string, projectName: string) => {
    if (
      !confirm(
        `"${projectName}" 프로젝트를 삭제할까요? 연결된 미팅은 '폴더 없음'으로 유지됩니다.`
      )
    )
      return;
    const { error } = await supabase.from("projects").delete().eq("id", projectId);
    if (error) {
      console.warn("[DB] 프로젝트 삭제 실패:", error.message);
      alert("프로젝트 삭제에 실패했습니다.");
      return;
    }
    await fetchProjects();
    await fetchMeetings();
  };

  const getProjectName = (projectId: string | null): string | null => {
    if (!projectId) return null;
    return projects.find((p) => p.id === projectId)?.name ?? null;
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-notion-bg">
        <div className="h-6 w-6 rounded-full border-2 border-notion-border border-t-dark animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-notion-bg">
      {/* Header - Notion style */}
      <header className="flex h-11 items-center justify-between border-b border-notion-border px-4 md:px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-mint">
            <Mic className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-sm font-semibold text-dark">Contexta</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="hidden sm:inline text-xs text-notion-text-secondary mr-2">
            {displayName}
          </span>
          <Link
            href="/settings/dictionary"
            className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-notion-text-secondary hover:bg-notion-bg-hover transition-colors"
          >
            <BookOpen className="h-3.5 w-3.5" />
            내 사전
          </Link>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-notion-text-secondary hover:bg-notion-bg-hover transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            로그아웃
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-[900px] px-6 md:px-24 py-10">
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

        {/* Usage quota */}
        {quota && (
          <section className="mb-8">
            <div className="rounded-lg border border-notion-border p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-dark">
                  사용 시간
                </span>
                <span className="text-xs text-notion-text-secondary">
                  {formatSeconds(quota.used_seconds)} / {formatSeconds(quota.limit_seconds)}
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-notion-surface overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    quota.used_seconds / quota.limit_seconds >= 0.9
                      ? "bg-pink"
                      : "bg-mint"
                  }`}
                  style={{
                    width: `${Math.min(
                      (quota.used_seconds / quota.limit_seconds) * 100,
                      100
                    )}%`,
                  }}
                />
              </div>

              {/* Mission banner */}
              {quota.limit_seconds <= FREE_LIMIT_SECONDS && (
                <div className="mt-4 rounded-lg bg-mint-light border border-mint/20 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-start gap-2.5">
                      <Target className="h-4 w-4 text-mint-dark mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-dark">
                          락인 미션: 내 사전에 단어를 {WORD_MISSION_THRESHOLD}개 이상 등록하세요
                        </p>
                        <p className="text-xs text-notion-text-secondary mt-0.5">
                          달성 시 사용 시간 <strong className="text-mint-dark">+1시간</strong> (현재 {wordCount}/{WORD_MISSION_THRESHOLD}개)
                        </p>
                      </div>
                    </div>
                    {wordCount >= WORD_MISSION_THRESHOLD ? (
                      <button
                        onClick={claimReward}
                        className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-mint rounded-lg hover:bg-mint-dark transition-colors"
                      >
                        <Gift className="h-4 w-4" />
                        보상 받기
                      </button>
                    ) : (
                      <Link
                        href="/settings/dictionary"
                        className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-mint-dark bg-white border border-mint/30 rounded-lg hover:bg-mint-light transition-colors"
                      >
                        단어 등록하기
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    )}
                  </div>
                  <div className="mt-3 h-1.5 w-full rounded-full bg-mint/10 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-mint transition-all duration-500"
                      style={{
                        width: `${Math.min(
                          (wordCount / WORD_MISSION_THRESHOLD) * 100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* CTA Buttons */}
        <div className="flex items-center gap-2 mb-8">
          <Link
            href="/meeting"
            className="inline-flex items-center gap-2 rounded-lg bg-mint px-5 py-2.5 text-sm font-medium text-white hover:bg-mint-dark transition-colors"
          >
            <Plus className="h-4 w-4" />
            새 미팅 시작하기
          </Link>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-notion-border px-4 py-2.5 text-sm font-medium text-notion-text hover:bg-notion-bg-hover transition-colors"
          >
            <FolderOpen className="h-4 w-4" />
            새 프로젝트
          </button>
        </div>

        {/* Projects */}
        {projects.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xs font-semibold text-notion-text-secondary uppercase tracking-wider mb-3">
              프로젝트
            </h2>
            <div className="flex flex-wrap gap-2">
              {projects.map((project) => (
                <span
                  key={project.id}
                  className="group inline-flex items-center gap-1.5 rounded-md border border-notion-border bg-notion-bg px-3 py-1.5 text-sm text-notion-text hover:bg-notion-bg-hover transition-colors"
                >
                  <FolderOpen className="h-3.5 w-3.5 text-notion-text-secondary" />
                  <span className="max-w-[120px] truncate" title={project.name}>
                    {project.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDeleteProject(project.id, project.name)}
                    className="ml-0.5 rounded p-0.5 text-notion-text-muted opacity-0 group-hover:opacity-100 hover:bg-notion-border hover:text-notion-text transition-all"
                    title="프로젝트 삭제"
                    aria-label="프로젝트 삭제"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Recent meetings - Notion page list style */}
        <section>
          <h2 className="text-xs font-semibold text-notion-text-secondary uppercase tracking-wider mb-3">
            최근 미팅
          </h2>
          {meetings.length === 0 ? (
            <div className="rounded-lg border border-notion-border p-12 text-center">
              <p className="text-sm text-notion-text-muted">
                아직 미팅 기록이 없습니다. 새 미팅을 시작해 보세요.
              </p>
            </div>
          ) : (
            <div className="flex flex-col">
              {meetings.map((meeting) => {
                const projectName = getProjectName(meeting.project_id);
                return (
                  <div
                    key={meeting.id}
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
      </main>

      {/* Project creation modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="w-full max-w-sm mx-4 rounded-xl bg-white p-6 shadow-xl border border-notion-border animate-fade-in">
            <h3 className="text-base font-semibold text-dark mb-4">
              새 프로젝트 생성
            </h3>
            <input
              type="text"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateProject()}
              placeholder="프로젝트 이름을 입력하세요"
              className="w-full rounded-lg border border-notion-border px-3 py-2.5 text-sm text-dark placeholder-notion-text-muted focus:border-mint focus:ring-1 focus:ring-mint outline-none transition-colors"
              autoFocus
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setNewProjectName("");
                }}
                className="px-4 py-2 text-sm font-medium text-notion-text-secondary rounded-lg hover:bg-notion-bg-hover transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleCreateProject}
                disabled={isCreating || !newProjectName.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-mint rounded-lg hover:bg-mint-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isCreating ? "생성 중..." : "생성"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
