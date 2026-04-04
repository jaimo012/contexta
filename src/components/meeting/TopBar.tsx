"use client";

import { useState, useEffect, useCallback } from "react";
import { useMeetingStore } from "@/store/useMeetingStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { useMeetingTimer } from "@/hooks/useMeetingTimer";
import { useAiHint } from "@/hooks/useAiHint";
import { supabase } from "@/utils/supabaseClient";
import { apiUrl } from "@/utils/apiUrl";
import { Mic, Square, Sparkles, ChevronDown } from "lucide-react";

interface Project {
  id: string;
  name: string;
}

function formatTime(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

export default function TopBar() {
  const meetingTime = useMeetingStore((s) => s.meetingTime);
  const isRecording = useMeetingStore((s) => s.isRecording);
  const isSpeaking = useMeetingStore((s) => s.isSpeaking);
  const meetingTitle = useMeetingStore((s) => s.meetingTitle);
  const selectedProjectId = useMeetingStore((s) => s.selectedProjectId);
  const setMeetingTitle = useMeetingStore((s) => s.setMeetingTitle);
  const setSelectedProjectId = useMeetingStore((s) => s.setSelectedProjectId);
  const isDemoMode = useMeetingStore((s) => s.isDemoMode);

  const { startRecording, stopRecording } = useAudioRecorder();
  const { startTimer, stopTimer } = useMeetingTimer(stopRecording);
  const { fetchHint } = useAiHint();

  const [projects, setProjects] = useState<Project[]>([]);
  const [isStartingRecording, setIsStartingRecording] = useState(false);

  const fetchProjects = useCallback(async () => {
    const { data, error } = await supabase
      .from("projects")
      .select("id, name")
      .order("created_at", { ascending: false });
    if (error) {
      console.warn("[TOPBAR] 프로젝트 목록 조회 실패 (DB 미설정 가능):", error.message);
      return;
    }
    if (data) setProjects(data);
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleStart = async () => {
    if (isStartingRecording) return;
    setIsStartingRecording(true);
    try {
      await startRecording();
      const granted = useMeetingStore.getState().isRecording;
      if (granted) startTimer();
    } finally {
      setIsStartingRecording(false);
    }
  };

  const setMeetingEnded = useMeetingStore((s) => s.setMeetingEnded);
  const setIsGeneratingMinutes = useMeetingStore((s) => s.setIsGeneratingMinutes);
  const setFinalMinutes = useMeetingStore((s) => s.setFinalMinutes);
  const setIsSavedToDb = useMeetingStore((s) => s.setIsSavedToDb);

  const setLastError = useMeetingStore((s) => s.setLastError);
  const setSummaryError = useMeetingStore((s) => s.setSummaryError);

  const generateSummary = useCallback(async () => {
    const { transcripts } = useMeetingStore.getState();
    if (transcripts.length === 0) return;

    const fullTranscript = transcripts.map((t) => t.text).join("\n");
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
          message: "회의록 생성에 실패했습니다. 회의록 모달에서 재시도할 수 있습니다.",
          timestamp: Date.now(),
          retryable: true,
        });
        return;
      }

      setFinalMinutes(data.minutes);
      await saveMeetingToDb(fullTranscript, data.minutes);
    } catch (err) {
      setSummaryError(true);
      if (err instanceof Error && err.name === "AbortError") {
        setLastError({
          type: "summary",
          message: "회의록 생성 요청이 시간 초과되었습니다. 재시도해 주세요.",
          timestamp: Date.now(),
          retryable: true,
        });
      } else {
        setLastError({
          type: "summary",
          message: "회의록 생성 중 오류가 발생했습니다. 재시도해 주세요.",
          timestamp: Date.now(),
          retryable: true,
        });
      }
      console.error("[SUMMARY] 회의록 생성 실패:", err);
    } finally {
      setIsGeneratingMinutes(false);
    }
  }, [setIsGeneratingMinutes, setFinalMinutes, setSummaryError, setLastError]);

  const handleStop = async () => {
    stopRecording();
    stopTimer();
    setMeetingEnded(true);
    await generateSummary();
  };

  const saveMeetingToDb = async (transcript: string, summary: string) => {
    const user = useAuthStore.getState().user;
    if (!user) {
      console.error("[DB] 로그인된 사용자 정보가 없습니다.");
      return;
    }

    const { meetingTitle: title, selectedProjectId: projectId } =
      useMeetingStore.getState();

    const row: Record<string, unknown> = {
      user_id: user.id,
      title: title || "제목 없는 미팅",
      transcript,
      summary,
    };

    if (projectId) {
      row.project_id = projectId;
    }

    const { error } = await supabase.from("meetings").insert(row);

    if (error) {
      console.warn("[DB] 회의록 저장 실패:", error.message);
      alert(
        "회의록 DB 저장 실패: Supabase SQL Editor에서 schema.sql을 실행했는지 확인해 주세요.\n" +
        "회의록은 클립보드 복사 또는 TXT 다운로드로 보관할 수 있습니다."
      );
      return;
    }

    setIsSavedToDb(true);
    alert("회의록이 안전하게 저장되었습니다!");
  };

  return (
    <div className="h-11 bg-notion-bg border-b border-notion-border px-4 md:px-6 flex items-center justify-between shrink-0">
      {/* Left: Title + Project */}
      <div className="flex items-center gap-2 min-w-0 max-w-[45%]">
        <input
          type="text"
          value={meetingTitle}
          onChange={(e) => setMeetingTitle(e.target.value)}
          placeholder="제목 없음"
          disabled={isRecording || isDemoMode}
          readOnly={isDemoMode}
          className="text-sm font-medium text-dark bg-transparent border-none outline-none placeholder-notion-text-muted truncate min-w-0 w-full disabled:opacity-70"
        />
        <div className="relative shrink-0">
          <select
            value={selectedProjectId ?? ""}
            onChange={(e) =>
              setSelectedProjectId(e.target.value || null)
            }
            disabled={isRecording}
            className="appearance-none text-xs border border-notion-border rounded-md pl-2.5 pr-7 py-1 text-notion-text-secondary bg-notion-bg outline-none hover:bg-notion-bg-hover focus:border-mint disabled:opacity-50 transition-colors cursor-pointer"
          >
            <option value="">폴더 없음</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 h-3 w-3 text-notion-text-muted pointer-events-none" />
        </div>
      </div>

      {/* Center: Timer + VAD */}
      <div className="flex items-center gap-2">
        {isRecording && (
          <span className="h-2 w-2 rounded-full bg-pink animate-rec-pulse" />
        )}
        <span className="font-mono text-xs text-notion-text-secondary tabular-nums">
          {formatTime(meetingTime)}
        </span>
        {isRecording && (
          <span
            className={`h-2 w-2 rounded-full transition-colors ${
              isSpeaking
                ? "bg-mint animate-pulse"
                : "bg-notion-border"
            }`}
            title={isSpeaking ? "음성 감지 중" : "무음"}
          />
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1.5">
        {isDemoMode ? (
          <a
            href="/dashboard"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-notion-text-secondary bg-notion-bg-hover rounded-md hover:bg-notion-border transition-colors"
          >
            대시보드로 돌아가기
          </a>
        ) : (
          <>
            <button
              onClick={fetchHint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-mint-dark bg-mint-light rounded-md hover:bg-mint/15 transition-colors"
            >
              <Sparkles className="h-3.5 w-3.5" />
              힌트
            </button>
            <button
              onClick={isRecording ? handleStop : handleStart}
              disabled={isStartingRecording}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
                isRecording
                  ? "text-notion-text-secondary bg-notion-bg-hover hover:bg-notion-border"
                  : "text-white bg-pink hover:bg-pink-dark"
              }`}
            >
              {isStartingRecording ? (
                "시작 중..."
              ) : isRecording ? (
                <>
                  <Square className="h-3 w-3" />
                  종료
                </>
              ) : (
                <>
                  <Mic className="h-3.5 w-3.5" />
                  녹음
                </>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
