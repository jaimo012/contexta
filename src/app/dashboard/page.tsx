"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabaseClient";
import { useAuthStore } from "@/store/useAuthStore";

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
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 rounded-full border-4 border-gray-200 border-t-gray-800 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6 md:px-10">
        <span className="text-lg font-bold tracking-tight text-gray-900">
          Contexta
        </span>
        <div className="flex items-center gap-4">
          <span className="hidden sm:inline text-sm text-gray-500">
            환영합니다, <strong className="text-gray-900">{displayName}</strong>님
          </span>
          <Link
            href="/settings/dictionary"
            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            📖 내 사전
          </Link>
          <button
            onClick={handleLogout}
            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            로그아웃
          </button>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="mx-auto max-w-4xl px-6 py-10">
        {/* DB 미설정 안내 배너 */}
        {!dbReady && (
          <section className="mb-6">
            <div className="rounded-xl border border-amber-300 bg-amber-50 p-5">
              <h3 className="text-sm font-bold text-amber-800 mb-1">
                ⚠️ Supabase 데이터베이스 설정이 필요합니다
              </h3>
              <p className="text-xs text-amber-700 leading-relaxed">
                프로젝트, 미팅 내역 등의 기능을 사용하려면 Supabase Dashboard &gt; SQL Editor에서{" "}
                <code className="px-1 py-0.5 bg-amber-100 rounded text-amber-900 font-mono">
                  database/schema.sql
                </code>{" "}
                파일을 실행해 주세요. 녹음 및 AI 힌트 기능은 DB 없이도 정상 동작합니다.
              </p>
            </div>
          </section>
        )}

        {/* 사용 시간 프로그레스 바 + 미션 배너 */}
        {quota && (
          <section className="mb-8">
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-900">
                  사용 시간
                </span>
                <span className="text-xs text-gray-500">
                  {formatSeconds(quota.used_seconds)} / {formatSeconds(quota.limit_seconds)}
                </span>
              </div>
              <div className="h-3 w-full rounded-full bg-gray-100 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    quota.used_seconds / quota.limit_seconds >= 0.9
                      ? "bg-red-500"
                      : quota.used_seconds / quota.limit_seconds >= 0.6
                        ? "bg-yellow-400"
                        : "bg-blue-500"
                  }`}
                  style={{
                    width: `${Math.min(
                      (quota.used_seconds / quota.limit_seconds) * 100,
                      100
                    )}%`,
                  }}
                />
              </div>

              {/* 미션 배너 */}
              {quota.limit_seconds <= FREE_LIMIT_SECONDS && (
                <div className="mt-4 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-blue-800">
                        🎯 락인 미션: 내 사전에 단어를 {WORD_MISSION_THRESHOLD}개 이상 등록하세요!
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        달성 시 사용 시간이 <strong>+1시간</strong> 늘어납니다! (현재 {wordCount}/{WORD_MISSION_THRESHOLD}개)
                      </p>
                    </div>
                    {wordCount >= WORD_MISSION_THRESHOLD ? (
                      <button
                        onClick={claimReward}
                        className="shrink-0 px-4 py-2 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 animate-pulse transition-colors"
                      >
                        🎁 보상 받기
                      </button>
                    ) : (
                      <Link
                        href="/settings/dictionary"
                        className="shrink-0 px-4 py-2 text-sm font-medium text-blue-600 bg-white border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
                      >
                        단어 등록하기 →
                      </Link>
                    )}
                  </div>
                  {/* 미션 진행 바 */}
                  <div className="mt-3 h-2 w-full rounded-full bg-blue-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-blue-500 transition-all duration-500"
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

        {/* 상단 CTA */}
        <div className="flex flex-col items-center gap-2 mb-10">
          <h1 className="text-2xl font-bold text-gray-900">
            환영합니다, {displayName}님
          </h1>
          <p className="text-sm text-gray-500 mb-4">
            새로운 미팅을 시작하거나, 이전 회의록을 확인하세요.
          </p>
          <div className="flex items-center gap-3">
            <Link
              href="/meeting"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-blue-200 hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-200 transition-all"
            >
              🚀 새 미팅 시작하기
            </Link>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-6 py-4 text-base font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all"
            >
              📁 새 프로젝트 생성
            </button>
          </div>
        </div>

        {/* 프로젝트 목록 */}
        {projects.length > 0 && (
          <section className="mb-10">
            <h2 className="text-lg font-bold text-gray-900 mb-3">
              내 프로젝트
            </h2>
            <div className="flex flex-wrap gap-2">
              {projects.map((project) => (
                <span
                  key={project.id}
                  className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700"
                >
                  <span className="max-w-[120px] truncate" title={project.name}>
                    📁 {project.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDeleteProject(project.id, project.name)}
                    className="ml-0.5 rounded-full p-0.5 text-blue-500 hover:bg-blue-200 hover:text-blue-800 transition-colors"
                    title="프로젝트 삭제"
                    aria-label="프로젝트 삭제"
                  >
                    <span className="sr-only">삭제</span>
                    <span aria-hidden>×</span>
                  </button>
                </span>
              ))}
            </div>
          </section>
        )}

        {/* 최근 미팅 내역 */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            최근 미팅 내역
          </h2>
          {meetings.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
              <p className="text-gray-400">
                아직 미팅 기록이 없습니다. 새 미팅을 시작해 보세요.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {meetings.map((meeting) => {
                const projectName = getProjectName(meeting.project_id);
                return (
                  <div
                    key={meeting.id}
                    className="rounded-xl border border-gray-200 bg-white p-5 hover:shadow-md hover:border-gray-300 transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <h3 className="text-sm font-semibold text-gray-900 truncate">
                          {meeting.title || "제목 없는 미팅"}
                        </h3>
                        {projectName && (
                          <span className="shrink-0 rounded-full bg-blue-50 border border-blue-200 px-2 py-0.5 text-xs font-medium text-blue-600">
                            {projectName}
                          </span>
                        )}
                      </div>
                      <time className="text-xs text-gray-400 shrink-0 ml-4">
                        {new Date(meeting.created_at).toLocaleDateString("ko-KR")}
                      </time>
                    </div>
                    <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">
                      {meeting.summary
                        ? meeting.summary.slice(0, 120) + "..."
                        : "요약 없음"}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* 프로젝트 생성 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm mx-4 rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              새 프로젝트 생성
            </h3>
            <input
              type="text"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateProject()}
              placeholder="프로젝트(폴더) 이름을 입력하세요"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              autoFocus
            />
            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setNewProjectName("");
                }}
                className="px-4 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleCreateProject}
                disabled={isCreating || !newProjectName.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isCreating ? "생성 중..." : "생성하기"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
