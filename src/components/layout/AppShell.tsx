"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Mic,
  Plus,
  BookOpen,
  LogOut,
  FolderOpen,
  FileText,
  X,
  Settings,
  User,
  CreditCard,
  Search,
  ChevronsLeft,
  ChevronsRight,
  Calendar,
  Clock,
  Target,
  Gift,
  ArrowRight,
  ArrowLeft,
  Check,
} from "lucide-react";
import { supabase } from "@/utils/supabaseClient";
import { useAuthStore } from "@/store/useAuthStore";
import { DEMO_MEETINGS } from "@/constants/demoMeetings";
import MiniCalendar from "./MiniCalendar";
import UpcomingMeetingCard from "./UpcomingMeetingCard";
import CalendarIntegrationModal from "./CalendarIntegrationModal";
import { useCalendarConnection } from "@/hooks/useCalendarConnection";

/* ===== Types ===== */
export interface Project {
  id: string;
  name: string;
  created_at: string;
}

export interface Meeting {
  id: string;
  title: string;
  summary: string;
  created_at: string;
  project_id: string | null;
}

export interface UserQuota {
  used_seconds: number;
  limit_seconds: number;
}

export interface ScheduledMeeting {
  id: string;
  title: string;
  datetime: string;
  duration: string;
  location?: string;
  attendees?: number;
}

interface AppShellContextValue {
  projects: Project[];
  meetings: Meeting[];
  quota: UserQuota | null;
  wordCount: number;
  dbReady: boolean;
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  selectedProjectFilter: string | null;
  setSelectedProjectFilter: (v: string | null) => void;
  getProjectName: (projectId: string | null) => string | null;
  refreshMeetings: () => Promise<void>;
  refreshProjects: () => Promise<void>;
}

const AppShellContext = createContext<AppShellContextValue | null>(null);

export function useAppShell() {
  const ctx = useContext(AppShellContext);
  if (!ctx) {
    throw new Error("useAppShell must be used inside <AppShell>");
  }
  return ctx;
}

/* ===== Constants ===== */
const FREE_LIMIT_SECONDS = 3600;
const REWARD_LIMIT_SECONDS = 7200;
const WORD_MISSION_THRESHOLD = 10;

function formatSeconds(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  if (h > 0 && m > 0) return `${h}시간 ${m}분`;
  if (h > 0) return `${h}시간`;
  return `${m}분`;
}

/* ===== AppShell Props ===== */
interface AppShellProps {
  title: string;
  showBackButton?: boolean;
  backHref?: string;
  rightSlot?: ReactNode;
  children: ReactNode;
  /** hide right calendar panel on this page */
  hideRightPanel?: boolean;
}

export default function AppShell({
  title,
  showBackButton = false,
  backHref,
  rightSlot,
  children,
  hideRightPanel = false,
}: AppShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);

  /* ===== Shared data ===== */
  const [projects, setProjects] = useState<Project[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [quota, setQuota] = useState<UserQuota | null>(null);
  const [wordCount, setWordCount] = useState(0);
  const [profileCompleted, setProfileCompleted] = useState(false);
  const [dbReady, setDbReady] = useState(true);
  const [scheduledMeetings, setScheduledMeetings] = useState<ScheduledMeeting[]>([]);

  /* ===== UI state ===== */
  const [sidebarOpen, setSidebarOpenState] = useState(true);

  // Persist sidebar open state across pages
  useEffect(() => {
    const stored = localStorage.getItem("contexta_sidebar_open");
    if (stored !== null) {
      setSidebarOpenState(stored === "1");
    }
  }, []);

  const setSidebarOpen = (v: boolean) => {
    setSidebarOpenState(v);
    localStorage.setItem("contexta_sidebar_open", v ? "1" : "0");
  };
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProjectFilter, setSelectedProjectFilter] = useState<string | null>(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [newSchedule, setNewSchedule] = useState({
    title: "",
    datetime: "",
    duration: "1시간",
    location: "",
    attendees: "",
  });
  const [isMissionOpen, setIsMissionOpen] = useState(false);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const { isConnected: isCalendarConnected, connect: connectCalendar } =
    useCalendarConnection();

  // Handle OAuth return: ?calendar=connected in URL → mark connected
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("calendar") === "connected" && user) {
      connectCalendar("google", user.email);
      // Clean up URL without reloading
      params.delete("calendar");
      const newSearch = params.toString();
      const newUrl =
        window.location.pathname + (newSearch ? `?${newSearch}` : "") + window.location.hash;
      window.history.replaceState({}, "", newUrl);
    }
  }, [user, connectCalendar]);

  const displayName =
    user?.user_metadata?.full_name || user?.email?.split("@")[0] || "사용자";
  const userEmail = user?.email || "";

  /* ===== Fetchers ===== */
  const refreshProjects = useCallback(async () => {
    const { data, error } = await supabase
      .from("projects")
      .select("id, name, created_at")
      .order("created_at", { ascending: false });
    if (error) {
      setDbReady(false);
      return;
    }
    if (data) setProjects(data);
  }, []);

  const refreshMeetings = useCallback(async () => {
    const { data, error } = await supabase
      .from("meetings")
      .select("id, title, summary, created_at, project_id")
      .order("created_at", { ascending: false })
      .limit(20);
    if (error) {
      setDbReady(false);
      return;
    }
    if (data) setMeetings(data);
  }, []);

  const refreshQuota = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("users")
      .select("used_seconds, limit_seconds")
      .eq("id", user.id)
      .single();
    if (error) return;
    if (data) setQuota(data);
  }, [user]);

  const refreshWordCount = useCallback(async () => {
    const { count, error } = await supabase
      .from("custom_words")
      .select("id", { count: "exact", head: true });
    if (error) return;
    setWordCount(count ?? 0);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("users")
      .select("profile_completed")
      .eq("id", user.id)
      .single();
    if (error) return;
    setProfileCompleted(!!data?.profile_completed);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    refreshProjects();
    refreshMeetings();
    refreshQuota();
    refreshWordCount();
    refreshProfile();
  }, [user, refreshProjects, refreshMeetings, refreshQuota, refreshWordCount, refreshProfile]);

  // Scheduled meetings (localStorage)
  useEffect(() => {
    const stored = localStorage.getItem("contexta_scheduled_meetings");
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored) as ScheduledMeeting[];
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const future = parsed.filter((m) => new Date(m.datetime) >= now);
      setScheduledMeetings(
        future.sort(
          (a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime()
        )
      );
    } catch {
      /* ignore */
    }
  }, []);

  const saveScheduledMeetings = (updated: ScheduledMeeting[]) => {
    const sorted = [...updated].sort(
      (a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime()
    );
    setScheduledMeetings(sorted);
    localStorage.setItem("contexta_scheduled_meetings", JSON.stringify(sorted));
  };

  const handleCreateSchedule = () => {
    if (!newSchedule.title.trim() || !newSchedule.datetime) return;
    const entry: ScheduledMeeting = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      title: newSchedule.title.trim(),
      datetime: newSchedule.datetime,
      duration: newSchedule.duration,
      location: newSchedule.location.trim() || undefined,
      attendees: newSchedule.attendees ? Number(newSchedule.attendees) : undefined,
    };
    saveScheduledMeetings([...scheduledMeetings, entry]);
    setNewSchedule({
      title: "",
      datetime: "",
      duration: "1시간",
      location: "",
      attendees: "",
    });
    setIsScheduleModalOpen(false);
  };

  const handleDeleteSchedule = (id: string) => {
    saveScheduledMeetings(scheduledMeetings.filter((m) => m.id !== id));
  };

  const handleCreateProject = async () => {
    if (!newProjectName.trim() || !user) return;
    setIsCreatingProject(true);
    const { error } = await supabase.from("projects").insert({
      user_id: user.id,
      name: newProjectName.trim(),
    });
    if (error) {
      setDbReady(false);
      alert("프로젝트 생성 실패: Supabase SQL Editor에서 schema.sql을 먼저 실행해 주세요.");
    } else {
      setNewProjectName("");
      setIsProjectModalOpen(false);
      await refreshProjects();
    }
    setIsCreatingProject(false);
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
      alert("프로젝트 삭제에 실패했습니다.");
      return;
    }
    await refreshProjects();
    await refreshMeetings();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const claimReward = useCallback(async () => {
    if (!user) return;
    await supabase
      .from("users")
      .update({ limit_seconds: REWARD_LIMIT_SECONDS })
      .eq("id", user.id);
    await refreshQuota();
  }, [user, refreshQuota]);

  const getProjectName = useCallback(
    (projectId: string | null): string | null => {
      if (!projectId) return null;
      return projects.find((p) => p.id === projectId)?.name ?? null;
    },
    [projects]
  );

  /* ===== Search navigation ===== */
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    // If typing from a non-dashboard page, redirect to dashboard
    if (value && pathname !== "/dashboard") {
      router.push("/dashboard");
    }
  };

  const handleProjectClick = (projectId: string) => {
    const next = selectedProjectFilter === projectId ? null : projectId;
    setSelectedProjectFilter(next);
    if (pathname !== "/dashboard") {
      router.push("/dashboard");
    }
  };

  /* ===== Profile nav ===== */
  const handleProfileClick = () => {
    if (!profileCompleted) {
      router.push("/onboarding");
    } else {
      router.push("/profile");
    }
  };

  /* ===== Filtered meetings for sidebar list ===== */
  const filteredSidebarMeetings = useMemo(() => {
    return meetings.filter((meeting) => {
      if (
        selectedProjectFilter &&
        meeting.project_id !== selectedProjectFilter
      ) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const title = (meeting.title || "").toLowerCase();
        const projectName = (getProjectName(meeting.project_id) || "").toLowerCase();
        return title.includes(q) || projectName.includes(q);
      }
      return true;
    });
  }, [meetings, searchQuery, selectedProjectFilter, getProjectName]);

  const ctxValue = useMemo<AppShellContextValue>(
    () => ({
      projects,
      meetings,
      quota,
      wordCount,
      dbReady,
      searchQuery,
      setSearchQuery,
      selectedProjectFilter,
      setSelectedProjectFilter,
      getProjectName,
      refreshMeetings,
      refreshProjects,
    }),
    [
      projects,
      meetings,
      quota,
      wordCount,
      dbReady,
      searchQuery,
      selectedProjectFilter,
      getProjectName,
      refreshMeetings,
      refreshProjects,
    ]
  );

  const isActiveNav = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  const handleBack = () => {
    if (backHref) {
      router.push(backHref);
    } else {
      router.back();
    }
  };

  return (
    <AppShellContext.Provider value={ctxValue}>
      <div className="h-screen w-screen overflow-hidden bg-notion-bg flex">
        {/* ===== Left Sidebar ===== */}
        <aside
          className={`shrink-0 h-full bg-notion-bg-sub border-r border-notion-border flex flex-col transition-all duration-200 ${
            sidebarOpen ? "w-60" : "w-0 overflow-hidden border-r-0"
          }`}
        >
          {/* Sidebar header */}
          <div className="flex items-center justify-between h-11 px-3 shrink-0">
            <Link href="/dashboard" className="flex items-center gap-2 min-w-0 group">
              <div className="flex h-5 w-5 items-center justify-center rounded bg-mint shrink-0">
                <Mic className="h-3 w-3 text-white" />
              </div>
              <span className="text-sm font-semibold text-dark truncate group-hover:text-mint-dark transition-colors">
                Contexta
              </span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="rounded p-0.5 text-notion-text-muted hover:bg-notion-bg-hover hover:text-notion-text transition-colors"
              aria-label="사이드바 접기"
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
              <Plus className="h-4 w-4" />새 미팅 시작
            </Link>
          </div>

          {/* Search */}
          <div className="px-3 mb-2">
            <div className="flex items-center gap-2 rounded-md border border-notion-border bg-notion-bg px-2.5 py-1.5 text-xs text-notion-text-muted focus-within:border-mint focus-within:ring-1 focus-within:ring-mint transition-colors">
              <Search className="h-3.5 w-3.5 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="미팅 검색..."
                className="w-full bg-transparent text-xs text-dark placeholder-notion-text-muted outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="shrink-0 rounded p-0.5 hover:bg-notion-bg-hover transition-colors"
                  aria-label="검색 지우기"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>

          {/* Projects section */}
          <div className="px-3 mb-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-semibold text-notion-text-muted uppercase tracking-wider">
                프로젝트
              </span>
              <button
                onClick={() => setIsProjectModalOpen(true)}
                className="rounded p-0.5 text-notion-text-muted hover:bg-notion-bg-hover hover:text-notion-text transition-colors"
                title="새 프로젝트"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="flex flex-col">
              {selectedProjectFilter && (
                <button
                  onClick={() => setSelectedProjectFilter(null)}
                  className="flex items-center gap-2 rounded-md px-2 py-1 text-xs text-notion-text-muted hover:bg-notion-bg-hover transition-colors mb-0.5"
                >
                  <X className="h-3 w-3" />
                  필터 해제
                </button>
              )}
              {projects.map((project) => {
                const isActive = selectedProjectFilter === project.id;
                return (
                  <div
                    key={project.id}
                    onClick={() => handleProjectClick(project.id)}
                    className={`group flex items-center gap-2 rounded-md px-2 py-1 text-sm transition-colors cursor-pointer ${
                      isActive
                        ? "bg-mint-light text-mint-dark font-medium"
                        : "text-notion-text-secondary hover:bg-notion-bg-hover"
                    }`}
                  >
                    <FolderOpen className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate flex-1" title={project.name}>
                      {project.name}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteProject(project.id, project.name);
                      }}
                      className="rounded p-0.5 text-notion-text-muted opacity-0 group-hover:opacity-100 hover:text-pink transition-all"
                      title="삭제"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                );
              })}
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
                  <p className="text-[10px] text-notion-text-muted px-2 mb-1">
                    예시 미팅
                  </p>
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
              ) : filteredSidebarMeetings.length === 0 ? (
                <p className="text-xs text-notion-text-muted py-2 px-2">
                  {searchQuery || selectedProjectFilter
                    ? "검색 결과가 없습니다."
                    : "아직 미팅 기록이 없습니다."}
                </p>
              ) : (
                <div className="flex flex-col">
                  {filteredSidebarMeetings.map((meeting) => (
                    <div
                      key={meeting.id}
                      onClick={() =>
                        router.push(`/dashboard?meeting=${meeting.id}`)
                      }
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
                    <span
                      className={`text-[11px] font-medium ${
                        (quota.limit_seconds - quota.used_seconds) /
                          quota.limit_seconds <=
                        0.1
                          ? "text-pink"
                          : "text-notion-text-secondary"
                      }`}
                    >
                      {formatSeconds(
                        Math.max(quota.limit_seconds - quota.used_seconds, 0)
                      )}
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
              className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors ${
                isActiveNav("/settings/dictionary")
                  ? "bg-notion-bg-hover text-dark font-medium"
                  : "text-notion-text-secondary hover:bg-notion-bg-hover"
              }`}
            >
              <BookOpen className="h-3.5 w-3.5" />내 사전
            </Link>
            <button
              onClick={handleProfileClick}
              className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors w-full text-left ${
                isActiveNav("/profile")
                  ? "bg-notion-bg-hover text-dark font-medium"
                  : "text-notion-text-secondary hover:bg-notion-bg-hover"
              }`}
            >
              <User className="h-3.5 w-3.5" />내 정보
            </button>
            <Link
              href="/settings"
              className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors w-full text-left ${
                pathname === "/settings"
                  ? "bg-notion-bg-hover text-dark font-medium"
                  : "text-notion-text-secondary hover:bg-notion-bg-hover"
              }`}
            >
              <Settings className="h-3.5 w-3.5" />
              설정
            </Link>
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
                <p className="text-xs font-medium text-dark truncate">
                  {displayName}
                </p>
                <p className="text-[11px] text-notion-text-muted truncate">
                  {userEmail}
                </p>
              </div>
            </div>
          </div>
        </aside>

        {/* ===== Main Content ===== */}
        <div className="flex-1 flex flex-col min-w-0 h-full">
          {/* Top bar - consistent across all pages */}
          <div className="flex items-center h-11 px-4 shrink-0 border-b border-notion-border gap-2">
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="rounded p-1 text-notion-text-muted hover:bg-notion-bg-hover hover:text-notion-text transition-colors"
                aria-label="사이드바 펼치기"
              >
                <ChevronsRight className="h-4 w-4" />
              </button>
            )}
            {showBackButton && (
              <button
                onClick={handleBack}
                className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-notion-text-secondary hover:bg-notion-bg-hover hover:text-dark transition-colors"
                aria-label="뒤로가기"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                뒤로
              </button>
            )}
            <span className="text-sm text-notion-text-secondary">{title}</span>
            {rightSlot && <div className="ml-auto">{rightSlot}</div>}
          </div>

          {/* Main area split: content + right calendar panel */}
          <main className="flex-1 flex overflow-hidden">
            {/* Left: page content */}
            <div className="flex-1 overflow-y-auto min-w-0">{children}</div>

            {/* Right: Calendar & Upcoming Meetings - persistent */}
            {!hideRightPanel && (
              <aside className="hidden lg:flex w-72 shrink-0 border-l border-notion-border bg-notion-bg-sub flex-col overflow-y-auto">
                <div className="p-5 flex flex-col gap-6">
                  {/* Mini Calendar */}
                  <section>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-notion-text-secondary" />
                        <h3 className="text-xs font-semibold text-notion-text-secondary uppercase tracking-wider">
                          캘린더
                        </h3>
                      </div>
                      <button
                        onClick={() => setIsCalendarModalOpen(true)}
                        className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium transition-colors ${
                          isCalendarConnected
                            ? "text-mint-dark bg-mint-light/60 hover:bg-mint-light"
                            : "text-notion-text-secondary hover:bg-notion-bg-hover hover:text-dark"
                        }`}
                        title={isCalendarConnected ? "캘린더 연동 관리" : "캘린더 연동하기"}
                      >
                        {isCalendarConnected ? (
                          <>
                            <Check className="h-3 w-3" />
                            연동됨
                          </>
                        ) : (
                          <>
                            <Plus className="h-3 w-3" />
                            연동하기
                          </>
                        )}
                      </button>
                    </div>
                    <MiniCalendar meetings={meetings} scheduled={scheduledMeetings} />
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
                      <button
                        onClick={() => setIsScheduleModalOpen(true)}
                        className="rounded p-0.5 text-notion-text-muted hover:bg-notion-bg-hover hover:text-notion-text transition-colors"
                        title="미팅 추가"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="flex flex-col gap-2">
                      {scheduledMeetings.length === 0 ? (
                        <div className="text-center py-6">
                          <Calendar className="h-6 w-6 text-notion-border mx-auto mb-2" />
                          <p className="text-xs text-notion-text-muted">
                            예정된 미팅이 없습니다
                          </p>
                          <button
                            onClick={() => setIsScheduleModalOpen(true)}
                            className="mt-2 text-xs text-mint-dark hover:text-mint transition-colors"
                          >
                            + 미팅 추가
                          </button>
                        </div>
                      ) : (
                        scheduledMeetings.map((sm) => {
                          const dt = new Date(sm.datetime);
                          const now = new Date();
                          const isToday = dt.toDateString() === now.toDateString();
                          const tomorrow = new Date(now);
                          tomorrow.setDate(tomorrow.getDate() + 1);
                          const isTomorrow =
                            dt.toDateString() === tomorrow.toDateString();

                          const timeStr = isToday
                            ? `오늘 ${dt.toLocaleTimeString("ko-KR", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}`
                            : isTomorrow
                              ? `내일 ${dt.toLocaleTimeString("ko-KR", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}`
                              : `${dt.toLocaleDateString("ko-KR", {
                                  month: "short",
                                  day: "numeric",
                                  weekday: "short",
                                })} ${dt.toLocaleTimeString("ko-KR", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}`;

                          return (
                            <UpcomingMeetingCard
                              key={sm.id}
                              title={sm.title}
                              time={timeStr}
                              duration={sm.duration}
                              location={sm.location}
                              attendees={sm.attendees}
                              isToday={isToday}
                              onDelete={() => handleDeleteSchedule(sm.id)}
                            />
                          );
                        })
                      )}
                    </div>

                    <p className="text-[11px] text-notion-text-muted mt-3 text-center">
                      Google Calendar 연동 시 자동으로 동기화됩니다
                    </p>
                  </section>
                </div>
              </aside>
            )}
          </main>
        </div>

        {/* ===== Project creation modal ===== */}
        {isProjectModalOpen && (
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
                    setIsProjectModalOpen(false);
                    setNewProjectName("");
                  }}
                  className="px-4 py-2 text-sm font-medium text-notion-text-secondary rounded-lg hover:bg-notion-bg-hover transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleCreateProject}
                  disabled={isCreatingProject || !newProjectName.trim()}
                  className="px-4 py-2 text-sm font-medium text-white bg-mint rounded-lg hover:bg-mint-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isCreatingProject ? "생성 중..." : "생성"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===== Schedule meeting modal ===== */}
        {isScheduleModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
            <div className="w-full max-w-sm mx-4 rounded-xl bg-white p-6 shadow-xl border border-notion-border animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-dark">
                  미팅 일정 추가
                </h3>
                <button
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="rounded-md p-1 text-notion-text-muted hover:bg-notion-bg-hover transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="flex flex-col gap-3">
                <div>
                  <label className="text-xs font-medium text-notion-text-secondary mb-1 block">
                    미팅 제목 *
                  </label>
                  <input
                    type="text"
                    value={newSchedule.title}
                    onChange={(e) =>
                      setNewSchedule((s) => ({ ...s, title: e.target.value }))
                    }
                    placeholder="예: 삼성SDS 클라우드 전환 미팅"
                    className="w-full rounded-lg border border-notion-border px-3 py-2 text-sm text-dark placeholder-notion-text-muted focus:border-mint focus:ring-1 focus:ring-mint outline-none transition-colors"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-notion-text-secondary mb-1 block">
                    일시 *
                  </label>
                  <input
                    type="datetime-local"
                    value={newSchedule.datetime}
                    onChange={(e) =>
                      setNewSchedule((s) => ({ ...s, datetime: e.target.value }))
                    }
                    className="w-full rounded-lg border border-notion-border px-3 py-2 text-sm text-dark focus:border-mint focus:ring-1 focus:ring-mint outline-none transition-colors"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-notion-text-secondary mb-1 block">
                      소요 시간
                    </label>
                    <select
                      value={newSchedule.duration}
                      onChange={(e) =>
                        setNewSchedule((s) => ({ ...s, duration: e.target.value }))
                      }
                      className="w-full rounded-lg border border-notion-border px-3 py-2 text-sm text-dark focus:border-mint outline-none transition-colors"
                    >
                      <option value="30분">30분</option>
                      <option value="1시간">1시간</option>
                      <option value="1시간 30분">1시간 30분</option>
                      <option value="2시간">2시간</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-notion-text-secondary mb-1 block">
                      참석자 수
                    </label>
                    <input
                      type="number"
                      value={newSchedule.attendees}
                      onChange={(e) =>
                        setNewSchedule((s) => ({ ...s, attendees: e.target.value }))
                      }
                      placeholder="0"
                      min="0"
                      className="w-full rounded-lg border border-notion-border px-3 py-2 text-sm text-dark placeholder-notion-text-muted focus:border-mint focus:ring-1 focus:ring-mint outline-none transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-notion-text-secondary mb-1 block">
                    장소
                  </label>
                  <input
                    type="text"
                    value={newSchedule.location}
                    onChange={(e) =>
                      setNewSchedule((s) => ({ ...s, location: e.target.value }))
                    }
                    placeholder="예: Google Meet, 회의실 A"
                    className="w-full rounded-lg border border-notion-border px-3 py-2 text-sm text-dark placeholder-notion-text-muted focus:border-mint focus:ring-1 focus:ring-mint outline-none transition-colors"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-5">
                <button
                  onClick={() => {
                    setIsScheduleModalOpen(false);
                    setNewSchedule({
                      title: "",
                      datetime: "",
                      duration: "1시간",
                      location: "",
                      attendees: "",
                    });
                  }}
                  className="px-4 py-2 text-sm font-medium text-notion-text-secondary rounded-lg hover:bg-notion-bg-hover transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleCreateSchedule}
                  disabled={!newSchedule.title.trim() || !newSchedule.datetime}
                  className="px-4 py-2 text-sm font-medium text-white bg-mint rounded-lg hover:bg-mint-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  추가
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===== Mission modal ===== */}
        {isMissionOpen && quota && quota.limit_seconds <= FREE_LIMIT_SECONDS && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
            <div className="w-full max-w-md mx-4 rounded-xl bg-white p-6 shadow-xl border border-notion-border animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-mint-dark" />
                  <h3 className="text-base font-semibold text-dark">
                    시간 늘리기
                  </h3>
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
                  영업에 자주 쓰는 IT 용어를 등록하면 AI가 더 정확한 힌트를
                  제공합니다.
                  <br />
                  달성 시 사용 시간이{" "}
                  <strong className="text-mint-dark">+1시간</strong> 늘어납니다!
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
                    onClick={() => {
                      claimReward();
                      setIsMissionOpen(false);
                    }}
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

        {/* ===== Calendar integration modal ===== */}
        <CalendarIntegrationModal
          open={isCalendarModalOpen}
          onClose={() => setIsCalendarModalOpen(false)}
        />
      </div>
    </AppShellContext.Provider>
  );
}
