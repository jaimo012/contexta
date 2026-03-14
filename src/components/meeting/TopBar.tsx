"use client";

import { useState, useEffect, useCallback } from "react";
import { useMeetingStore } from "@/store/useMeetingStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { useMeetingTimer } from "@/hooks/useMeetingTimer";
import { useAiHint } from "@/hooks/useAiHint";
import { supabase } from "@/utils/supabaseClient";

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

  const { startRecording, stopRecording } = useAudioRecorder();
  const { startTimer, stopTimer } = useMeetingTimer();
  const { fetchHint } = useAiHint();

  const [projects, setProjects] = useState<Project[]>([]);

  const fetchProjects = useCallback(async () => {
    const { data } = await supabase
      .from("projects")
      .select("id, name")
      .order("created_at", { ascending: false });
    if (data) setProjects(data);
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleStart = () => {
    startRecording();
    startTimer();
  };

  const setMeetingEnded = useMeetingStore((s) => s.setMeetingEnded);
  const setIsGeneratingMinutes = useMeetingStore((s) => s.setIsGeneratingMinutes);
  const setFinalMinutes = useMeetingStore((s) => s.setFinalMinutes);
  const setIsSavedToDb = useMeetingStore((s) => s.setIsSavedToDb);

  const handleStop = async () => {
    stopRecording();
    stopTimer();
    setMeetingEnded(true);

    const { transcripts } = useMeetingStore.getState();
    if (transcripts.length === 0) return;

    const fullTranscript = transcripts.map((t) => t.text).join("\n");
    setIsGeneratingMinutes(true);

    try {
      const res = await fetch("/api/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullTranscript }),
      });
      const data = await res.json();

      if (!res.ok || !data.minutes) return;

      setFinalMinutes(data.minutes);
      await saveMeetingToDb(fullTranscript, data.minutes);
    } catch (err) {
      console.error("[SUMMARY] 회의록 생성 실패:", err);
    } finally {
      setIsGeneratingMinutes(false);
    }
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
      console.error("[DB] 회의록 저장 실패:", error.message);
      alert("회의록 DB 저장에 실패했습니다. 다시 시도해 주세요.");
      return;
    }

    setIsSavedToDb(true);
    alert("회의록이 안전하게 저장되었습니다!");
  };

  return (
    <div className="h-16 bg-white border-b border-gray-200 px-4 md:px-6 flex items-center justify-between shrink-0">
      {/* 좌측: 미팅 제목 + 프로젝트 선택 */}
      <div className="flex items-center gap-2 min-w-0 max-w-[45%]">
        <input
          type="text"
          value={meetingTitle}
          onChange={(e) => setMeetingTitle(e.target.value)}
          placeholder="미팅 제목 입력..."
          disabled={isRecording}
          className="text-sm md:text-base font-bold text-gray-900 bg-transparent border-none outline-none placeholder-gray-400 truncate min-w-0 w-full disabled:opacity-70"
        />
        <select
          value={selectedProjectId ?? ""}
          onChange={(e) =>
            setSelectedProjectId(e.target.value || null)
          }
          disabled={isRecording}
          className="shrink-0 text-xs border border-gray-200 rounded-lg px-2 py-1.5 text-gray-600 bg-gray-50 outline-none focus:border-blue-400 disabled:opacity-50"
        >
          <option value="">폴더 없음</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              📁 {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* 중앙: 타이머 + VAD 인디케이터 */}
      <div className="flex items-center gap-2.5">
        {isRecording && (
          <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
        )}
        <span className="font-mono text-sm text-gray-500 tabular-nums">
          {formatTime(meetingTime)}
        </span>
        {isRecording && (
          <span
            className={`h-2.5 w-2.5 rounded-full ${
              isSpeaking
                ? "bg-green-500 animate-pulse"
                : "bg-gray-300"
            }`}
            title={isSpeaking ? "음성 감지 중" : "무음"}
          />
        )}
      </div>

      {/* 우측: 액션 버튼 */}
      <div className="flex items-center gap-2 md:gap-3">
        <button
          onClick={fetchHint}
          className="px-3 md:px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
        >
          💡 힌트 줘
        </button>
        <button
          onClick={isRecording ? handleStop : handleStart}
          className={`px-3 md:px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            isRecording
              ? "text-white bg-gray-700 hover:bg-gray-800"
              : "text-white bg-red-500 hover:bg-red-600"
          }`}
        >
          {isRecording ? "⏹ 녹음 종료" : "🔴 녹음 시작"}
        </button>
      </div>
    </div>
  );
}
