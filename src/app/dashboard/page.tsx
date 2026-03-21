"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Markdown from "react-markdown";
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
  Settings,
  User,
  CreditCard,
  Search,
  ChevronsLeft,
  ChevronsRight,
  Calendar,
  Clock,
  MapPin,
  Users,
  Building2,
  Briefcase,
  Sparkles,
  ChevronRight,
  Pencil,
} from "lucide-react";
import { DEMO_MEETINGS } from "@/constants/demoMeetings";
import {
  type ProfileData,
  COACHING_STYLES,
} from "@/constants/profileOptions";

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
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMissionOpen, setIsMissionOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<{ title: string; summary: string; date: string; project?: string } | null>(null);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [profileCompleted, setProfileCompleted] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const displayName =
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "사용자";

  const userEmail = user?.email || "";

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
      .limit(20);
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

  const fetchProfile = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("users")
      .select("profile_data, profile_completed")
      .eq("id", user.id)
      .single();
    if (error) return;
    if (data?.profile_data) setProfileData(data.profile_data as ProfileData);
    setProfileCompleted(!!data?.profile_completed);
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
    fetchProfile();
  }, [user, fetchProjects, fetchMeetings, fetchQuota, fetchWordCount, fetchProfile]);

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
    <div className="h-screen w-screen overflow-hidden bg-notion-bg flex">
      {/* ===== Left Sidebar ===== */}
      <aside
        className={`shrink-0 h-full bg-notion-bg-sub border-r border-notion-border flex flex-col transition-all duration-200 ${
          sidebarOpen ? "w-60" : "w-0 overflow-hidden border-r-0"
        }`}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between h-11 px-3 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex h-5 w-5 items-center justify-center rounded bg-mint shrink-0">
              <Mic className="h-3 w-3 text-white" />
            </div>
            <span className="text-sm font-semibold text-dark truncate">Contexta</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded p-0.5 text-notion-text-muted hover:bg-notion-bg-hover hover:text-notion-text transition-colors"
          >
            <ChevronsLeft className="h-4 w-4" />
          </button>
        </div>

        {/* New meeting button */}
        <div className="px-3 mb-1">
          <Link
            href="/meeting"
            className="flex items-center gap-2 w-full rounded-md bg-mint px-3 py-2 text-sm font-medium text-white hover:bg-mint-dark transition-colors"
          >
            <Plus className="h-4 w-4" />
            새 미팅 시작
          </Link>
        </div>

        {/* Search (placeholder) */}
        <div className="px-3 mb-2">
          <div className="flex items-center gap-2 rounded-md border border-notion-border bg-notion-bg px-2.5 py-1.5 text-xs text-notion-text-muted">
            <Search className="h-3.5 w-3.5" />
            <span>미팅 검색...</span>
          </div>
        </div>

        {/* Projects section */}
        <div className="px-3 mb-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-semibold text-notion-text-muted uppercase tracking-wider">
              프로젝트
            </span>
            <button
              onClick={() => setIsModalOpen(true)}
              className="rounded p-0.5 text-notion-text-muted hover:bg-notion-bg-hover hover:text-notion-text transition-colors"
              title="새 프로젝트"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="flex flex-col">
            {projects.map((project) => (
              <div
                key={project.id}
                className="group flex items-center gap-2 rounded-md px-2 py-1 text-sm text-notion-text-secondary hover:bg-notion-bg-hover transition-colors cursor-pointer"
              >
                <FolderOpen className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate flex-1" title={project.name}>
                  {project.name}
                </span>
                <button
                  type="button"
                  onClick={() => handleDeleteProject(project.id, project.name)}
                  className="rounded p-0.5 text-notion-text-muted opacity-0 group-hover:opacity-100 hover:text-pink transition-all"
                  title="삭제"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Meetings list */}
        <div className="px-3 mt-2 flex-1 min-h-0 flex flex-col">
          <span className="text-[11px] font-semibold text-notion-text-muted uppercase tracking-wider mb-1">
            미팅 기록
          </span>
          <div className="flex-1 overflow-y-auto">
            {meetings.length === 0 && DEMO_MEETINGS.length > 0 ? (
              <div className="flex flex-col">
                <p className="text-[10px] text-notion-text-muted px-2 mb-1">예시 미팅</p>
                {DEMO_MEETINGS.map((demo) => (
                  <div
                    key={demo.id}
                    onClick={() => router.push(`/meeting?demo=${demo.id}`)}
                    className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-notion-bg-hover transition-colors cursor-pointer"
                  >
                    <FileText className="h-3.5 w-3.5 text-mint/60 shrink-0" />
                    <span className="truncate flex-1 text-notion-text-secondary">
                      {demo.title}
                    </span>
                  </div>
                ))}
              </div>
            ) : meetings.length === 0 ? (
              <p className="text-xs text-notion-text-muted py-2 px-2">
                아직 미팅 기록이 없습니다.
              </p>
            ) : (
              <div className="flex flex-col">
                {meetings.map((meeting) => (
                  <div
                    key={meeting.id}
                    onClick={() => setSelectedMeeting({ title: meeting.title || "제목 없는 미팅", summary: meeting.summary, date: new Date(meeting.created_at).toLocaleDateString("ko-KR") })}
                    className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-notion-bg-hover transition-colors cursor-pointer"
                  >
                    <FileText className="h-3.5 w-3.5 text-notion-text-muted shrink-0" />
                    <span className="truncate flex-1 text-notion-text">
                      {meeting.title || "제목 없는 미팅"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar bottom menu */}
        <div className="border-t border-notion-border px-2 py-2 shrink-0">
          {/* Subscription plan + remaining time */}
          <div className="rounded-md px-2 py-1.5 mb-1">
            <div className="flex items-center gap-2">
              <CreditCard className="h-3.5 w-3.5 text-mint shrink-0" />
              <span className="text-xs font-medium text-dark">Free 플랜</span>
              <span className="ml-auto text-[10px] font-medium text-mint bg-mint-light rounded px-1.5 py-0.5 cursor-pointer hover:bg-mint/15 transition-colors">
                업그레이드
              </span>
            </div>
            {quota && (
              <div className="mt-2 ml-5.5">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] text-notion-text-muted">
                    남은 시간
                  </span>
                  <span className={`text-[11px] font-medium ${
                    (quota.limit_seconds - quota.used_seconds) / quota.limit_seconds <= 0.1
                      ? "text-pink"
                      : "text-notion-text-secondary"
                  }`}>
                    {formatSeconds(Math.max(quota.limit_seconds - quota.used_seconds, 0))}
                  </span>
                </div>
                <div className="h-1 w-full rounded-full bg-notion-surface overflow-hidden">
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
                {quota.limit_seconds <= FREE_LIMIT_SECONDS && (
                  <button
                    onClick={() => setIsMissionOpen(true)}
                    className="mt-1.5 w-full text-[11px] font-medium text-mint-dark hover:text-mint transition-colors text-left"
                  >
                    + 시간 늘리기
                  </button>
                )}
              </div>
            )}
          </div>

          <Link
            href="/settings/dictionary"
            className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-notion-text-secondary hover:bg-notion-bg-hover transition-colors"
          >
            <BookOpen className="h-3.5 w-3.5" />
            내 사전
          </Link>
          <button
            onClick={() => {
              if (!profileCompleted) {
                router.push("/onboarding");
              } else {
                setShowProfile(true);
                setSelectedMeeting(null);
              }
            }}
            className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-notion-text-secondary hover:bg-notion-bg-hover transition-colors w-full text-left"
          >
            <User className="h-3.5 w-3.5" />
            내 정보
          </button>
          <button
            className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-notion-text-secondary hover:bg-notion-bg-hover transition-colors w-full text-left"
          >
            <Settings className="h-3.5 w-3.5" />
            설정
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-notion-text-secondary hover:bg-notion-bg-hover transition-colors w-full text-left"
          >
            <LogOut className="h-3.5 w-3.5" />
            로그아웃
          </button>

          {/* User info */}
          <div className="flex items-center gap-2 mt-2 px-2 py-1.5 border-t border-notion-border pt-3">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-notion-surface text-xs font-medium text-notion-text-secondary shrink-0">
              {displayName.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-dark truncate">{displayName}</p>
              <p className="text-[11px] text-notion-text-muted truncate">{userEmail}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ===== Main Content ===== */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        {/* Top bar */}
        <div className="flex items-center h-11 px-4 shrink-0 border-b border-notion-border">
          {!sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded p-1 text-notion-text-muted hover:bg-notion-bg-hover hover:text-notion-text transition-colors mr-2"
            >
              <ChevronsRight className="h-4 w-4" />
            </button>
          )}
          <span className="text-sm text-notion-text-secondary">
            {showProfile ? "내 정보" : "대시보드"}
          </span>
          {showProfile && (
            <button
              onClick={() => setShowProfile(false)}
              className="ml-auto text-xs text-notion-text-muted hover:text-notion-text-secondary transition-colors"
            >
              ← 대시보드로 돌아가기
            </button>
          )}
        </div>

        {/* Scrollable main area - split into left content + right calendar */}
        <main className="flex-1 flex overflow-hidden">
          {/* Left: main content */}
          <div className="flex-1 overflow-y-auto min-w-0">
            {showProfile ? (
              <ProfileView
                profileData={profileData}
                displayName={displayName}
                userEmail={userEmail}
                onEdit={() => router.push("/onboarding")}
              />
            ) : (
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

              {/* Recent meetings - main content area */}
              <section>
                <h2 className="text-xs font-semibold text-notion-text-secondary uppercase tracking-wider mb-3">
                  최근 미팅
                </h2>
                {meetings.length === 0 ? (
                  <div className="flex flex-col">
                    {/* CTA banner */}
                    <div className="rounded-lg border border-mint/20 bg-mint-light/50 p-4 mb-4">
                      <p className="text-sm font-medium text-dark">
                        아래 예시 미팅을 클릭해 Contexta가 생성하는 회의록을 확인해보세요
                      </p>
                      <p className="text-xs text-notion-text-secondary mt-1">
                        녹음을 시작하면 AI가 실시간으로 코칭하고, 회의록을 자동 생성합니다.
                      </p>
                      <Link
                        href="/meeting"
                        className="inline-flex items-center gap-2 rounded-lg bg-mint px-4 py-2 text-sm font-medium text-white hover:bg-mint-dark transition-colors mt-3"
                      >
                        <Plus className="h-4 w-4" />
                        첫 미팅 시작하기
                      </Link>
                    </div>

                    {/* Clickable demo meetings */}
                    {DEMO_MEETINGS.map((demo) => (
                      <div
                        key={demo.id}
                        onClick={() => router.push(`/meeting?demo=${demo.id}`)}
                        className="flex items-center gap-3 px-2 py-2.5 -mx-2 rounded-md hover:bg-notion-bg-hover transition-colors cursor-pointer group"
                      >
                        <div className="flex h-6 w-6 items-center justify-center rounded bg-mint-light shrink-0">
                          <FileText className="h-3.5 w-3.5 text-mint-dark" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-dark truncate">{demo.title}</span>
                            <span className="shrink-0 text-[11px] text-mint-dark bg-mint-light rounded px-1.5 py-0.5">{demo.project}</span>
                          </div>
                          <p className="text-xs text-notion-text-secondary mt-0.5 truncate">{demo.snippet}</p>
                        </div>
                        <time className="text-xs text-notion-text-muted shrink-0">{demo.date}</time>
                      </div>
                    ))}
                    <p className="text-[11px] text-notion-text-muted text-center mt-3">
                      예시 데이터입니다. 실제 미팅을 녹음하면 여기에 회의록이 쌓입니다.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col">
                    {meetings.map((meeting) => {
                      const projectName = getProjectName(meeting.project_id);
                      return (
                        <div
                          key={meeting.id}
                          onClick={() => setSelectedMeeting({ title: meeting.title || "제목 없는 미팅", summary: meeting.summary, date: new Date(meeting.created_at).toLocaleDateString("ko-KR"), project: projectName || undefined })}
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
            )}
          </div>

          {/* Right: Calendar & Upcoming Meetings */}
          <aside className="hidden lg:flex w-72 shrink-0 border-l border-notion-border bg-notion-bg-sub flex-col overflow-y-auto">
            <div className="p-5 flex flex-col gap-6">
              {/* Mini Calendar */}
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="h-4 w-4 text-notion-text-secondary" />
                  <h3 className="text-xs font-semibold text-notion-text-secondary uppercase tracking-wider">
                    캘린더
                  </h3>
                </div>
                <MiniCalendar />
              </section>

              {/* Upcoming Meetings */}
              <section>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-notion-text-secondary" />
                    <h3 className="text-xs font-semibold text-notion-text-secondary uppercase tracking-wider">
                      다가오는 미팅
                    </h3>
                  </div>
                  <button className="rounded p-0.5 text-notion-text-muted hover:bg-notion-bg-hover hover:text-notion-text transition-colors" title="미팅 추가">
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="flex flex-col gap-2">
                  {/* Placeholder upcoming meetings */}
                  <UpcomingMeetingCard
                    title="삼성SDS 클라우드 전환 2차"
                    time="오늘 오후 3:00"
                    duration="1시간"
                    attendees={3}
                    isToday
                  />
                  <UpcomingMeetingCard
                    title="LG CNS 보안 솔루션 데모"
                    time="내일 오전 10:00"
                    duration="30분"
                    location="Google Meet"
                    attendees={5}
                  />
                  <UpcomingMeetingCard
                    title="현대오토에버 인프라 논의"
                    time="3월 21일 (금) 오후 2:00"
                    duration="1시간"
                    location="회의실 B"
                    attendees={4}
                  />
                  <UpcomingMeetingCard
                    title="SK C&C 분기 리뷰"
                    time="3월 24일 (월) 오전 11:00"
                    duration="1시간 30분"
                    attendees={6}
                  />
                </div>

                <p className="text-[11px] text-notion-text-muted mt-3 text-center">
                  Google Calendar 연동 시 자동으로 표시됩니다
                </p>
              </section>
            </div>
          </aside>
        </main>
      </div>

      {/* Meeting detail modal */}
      {selectedMeeting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="w-full max-w-3xl max-h-[85vh] mx-4 rounded-xl bg-notion-bg border border-notion-border shadow-xl flex flex-col overflow-hidden animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-notion-border shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <h2 className="text-sm font-semibold text-dark truncate">{selectedMeeting.title}</h2>
                {selectedMeeting.project && (
                  <span className="shrink-0 text-[11px] text-mint-dark bg-mint-light rounded px-1.5 py-0.5">{selectedMeeting.project}</span>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-notion-text-muted">{selectedMeeting.date}</span>
                <button
                  onClick={() => setSelectedMeeting(null)}
                  className="rounded-md p-1 text-notion-text-muted hover:bg-notion-bg-hover hover:text-notion-text transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 md:px-12 py-6">
              <article className="prose prose-sm prose-neutral max-w-none [&_h1]:text-dark [&_h1]:text-xl [&_h1]:mb-4 [&_h2]:text-dark [&_h2]:text-base [&_h2]:mt-6 [&_h3]:text-dark [&_h3]:text-sm [&_p]:text-notion-text [&_li]:text-notion-text [&_strong]:text-dark [&_ul]:my-2 [&_ol]:my-2">
                <Markdown>{selectedMeeting.summary}</Markdown>
              </article>
            </div>
          </div>
        </div>
      )}

      {/* Mission modal - 시간 늘리기 */}
      {isMissionOpen && quota && quota.limit_seconds <= FREE_LIMIT_SECONDS && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="w-full max-w-md mx-4 rounded-xl bg-white p-6 shadow-xl border border-notion-border animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-mint-dark" />
                <h3 className="text-base font-semibold text-dark">시간 늘리기</h3>
              </div>
              <button
                onClick={() => setIsMissionOpen(false)}
                className="rounded-md p-1 text-notion-text-muted hover:bg-notion-bg-hover transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="rounded-lg bg-mint-light border border-mint/20 p-4">
              <p className="text-sm font-medium text-dark">
                내 사전에 단어를 {WORD_MISSION_THRESHOLD}개 이상 등록하세요
              </p>
              <p className="text-xs text-notion-text-secondary mt-1">
                영업에 자주 쓰는 IT 용어를 등록하면 AI가 더 정확한 힌트를 제공합니다.
                <br />
                달성 시 사용 시간이 <strong className="text-mint-dark">+1시간</strong> 늘어납니다!
              </p>

              <div className="mt-3 flex items-center gap-3">
                <div className="flex-1 h-2 rounded-full bg-mint/10 overflow-hidden">
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
                <span className="text-xs font-medium text-mint-dark shrink-0">
                  {wordCount}/{WORD_MISSION_THRESHOLD}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              {wordCount >= WORD_MISSION_THRESHOLD ? (
                <button
                  onClick={() => { claimReward(); setIsMissionOpen(false); }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-mint rounded-lg hover:bg-mint-dark transition-colors"
                >
                  <Gift className="h-4 w-4" />
                  보상 받기
                </button>
              ) : (
                <Link
                  href="/settings/dictionary"
                  onClick={() => setIsMissionOpen(false)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-mint rounded-lg hover:bg-mint-dark transition-colors"
                >
                  단어 등록하러 가기
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

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

/* ===== Mini Calendar Component ===== */
function MiniCalendar() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const todayDate = today.getDate();

  const monthNames = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"];
  const dayNames = ["일", "월", "화", "수", "목", "금", "토"];

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Placeholder: days with meetings (dots)
  const meetingDays = new Set([todayDate, todayDate + 1, todayDate + 2, todayDate + 5]);

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="rounded-lg border border-notion-border bg-notion-bg p-3">
      <div className="text-xs font-medium text-dark text-center mb-2">
        {year}년 {monthNames[month]}
      </div>
      <div className="grid grid-cols-7 gap-0.5 text-center">
        {dayNames.map((d) => (
          <div key={d} className="text-[10px] font-medium text-notion-text-muted py-1">
            {d}
          </div>
        ))}
        {cells.map((day, i) => (
          <div key={i} className="relative flex flex-col items-center">
            <button
              className={`w-7 h-7 rounded-md text-xs transition-colors ${
                day === null
                  ? ""
                  : day === todayDate
                    ? "bg-mint text-white font-medium"
                    : "text-notion-text hover:bg-notion-bg-hover"
              }`}
              disabled={day === null}
            >
              {day}
            </button>
            {day && meetingDays.has(day) && day !== todayDate && (
              <span className="absolute bottom-0 h-1 w-1 rounded-full bg-mint" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ===== Profile View Component ===== */
function ProfileView({
  profileData,
  displayName,
  userEmail,
  onEdit,
}: {
  profileData: ProfileData | null;
  displayName: string;
  userEmail: string;
  onEdit: () => void;
}) {
  const coachingLabel = COACHING_STYLES.find(
    (cs) => cs.value === profileData?.coachingStyle
  );

  const sections = [
    {
      title: "회사 정보",
      icon: Building2,
      items: [
        { label: "기업명", value: profileData?.companyName },
        { label: "업종", value: profileData?.industry },
        { label: "매출 규모", value: profileData?.companySize },
      ],
    },
    {
      title: "내 정보",
      icon: User,
      items: [
        { label: "이름", value: profileData?.displayName || displayName },
        { label: "이메일", value: userEmail },
        { label: "부서", value: profileData?.department },
        { label: "직급", value: profileData?.position },
        { label: "직무", value: profileData?.role },
        { label: "세부 직무", value: profileData?.roleDetail },
      ],
    },
    {
      title: "사용 목적",
      icon: Target,
      items: [
        {
          label: "주요 사용 용도",
          value:
            profileData?.useCases && profileData.useCases.length > 0
              ? profileData.useCases.join(", ")
              : undefined,
          chips: profileData?.useCases,
        },
        { label: "주간 미팅 빈도", value: profileData?.meetingFrequency },
        {
          label: "주요 미팅 상대방",
          value:
            profileData?.clientTypes && profileData.clientTypes.length > 0
              ? profileData.clientTypes.join(", ")
              : undefined,
          chips: profileData?.clientTypes,
        },
        {
          label: "AI 코칭 스타일",
          value: coachingLabel
            ? `${coachingLabel.label} — ${coachingLabel.desc}`
            : undefined,
        },
        { label: "주요 취급 제품·서비스", value: profileData?.mainProducts },
      ],
    },
  ];

  return (
    <div className="max-w-[720px] mx-auto px-6 md:px-12 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-dark">내 프로필</h1>
          <p className="text-notion-text-secondary mt-1">
            AI가 미팅 중 더 정확한 힌트를 제공하기 위해 사용됩니다
          </p>
        </div>
        <button
          onClick={onEdit}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-mint rounded-lg hover:bg-mint-dark transition-colors"
        >
          <Pencil className="h-3.5 w-3.5" />
          수정하기
        </button>
      </div>

      {/* Profile sections */}
      <div className="flex flex-col gap-6">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <div
              key={section.title}
              className="rounded-lg border border-notion-border bg-white p-5"
            >
              <div className="flex items-center gap-2 mb-4">
                <Icon className="h-4 w-4 text-mint-dark" />
                <h2 className="text-sm font-semibold text-dark">
                  {section.title}
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
                {section.items.map((item) => (
                  <div key={item.label}>
                    <dt className="text-xs text-notion-text-muted mb-0.5">
                      {item.label}
                    </dt>
                    {"chips" in item && item.chips && item.chips.length > 0 ? (
                      <dd className="flex flex-wrap gap-1.5">
                        {item.chips.map((chip) => (
                          <span
                            key={chip}
                            className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border border-mint/30 bg-mint-light/50 text-mint-dark"
                          >
                            {chip}
                          </span>
                        ))}
                      </dd>
                    ) : (
                      <dd className="text-sm text-dark">
                        {item.value || (
                          <span className="text-notion-text-muted">
                            미입력
                          </span>
                        )}
                      </dd>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ===== Upcoming Meeting Card ===== */
function UpcomingMeetingCard({
  title,
  time,
  duration,
  location,
  attendees,
  isToday,
}: {
  title: string;
  time: string;
  duration: string;
  location?: string;
  attendees?: number;
  isToday?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border p-3 hover:bg-notion-bg-hover transition-colors cursor-pointer ${
        isToday
          ? "border-mint/30 bg-mint-light/50"
          : "border-notion-border bg-notion-bg"
      }`}
    >
      <div className="flex items-start gap-2">
        <div
          className={`w-0.5 h-full min-h-[36px] rounded-full shrink-0 mt-0.5 ${
            isToday ? "bg-mint" : "bg-notion-border"
          }`}
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-dark truncate">{title}</p>
          <p className={`text-xs mt-0.5 ${isToday ? "text-mint-dark font-medium" : "text-notion-text-secondary"}`}>
            {time} · {duration}
          </p>
          <div className="flex items-center gap-3 mt-1.5">
            {location && (
              <span className="inline-flex items-center gap-1 text-[11px] text-notion-text-muted">
                <MapPin className="h-3 w-3" />
                {location}
              </span>
            )}
            {attendees && (
              <span className="inline-flex items-center gap-1 text-[11px] text-notion-text-muted">
                <Users className="h-3 w-3" />
                {attendees}명
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
