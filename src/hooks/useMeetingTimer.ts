"use client";

import { useRef, useCallback, useEffect } from "react";
import { useMeetingStore } from "@/store/useMeetingStore";
import { useAuthStore } from "@/store/useAuthStore";
import { supabase } from "@/utils/supabaseClient";

const DB_SYNC_INTERVAL_SEC = 30;

async function fallbackDirectUpdate(userId: string, delta: number): Promise<boolean> {
  const { data } = await supabase
    .from("users")
    .select("used_seconds")
    .eq("id", userId)
    .single();

  if (!data) return false;

  const { error } = await supabase
    .from("users")
    .update({ used_seconds: data.used_seconds + delta })
    .eq("id", userId);

  return !error;
}

export function useMeetingTimer() {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pendingSecondsRef = useRef(0);
  const userLimitRef = useRef<number | null>(null);
  const userUsedRef = useRef<number>(0);

  const setMeetingTime = useMeetingStore((s) => s.setMeetingTime);

  const syncToDb = useCallback(async () => {
    const seconds = pendingSecondsRef.current;
    if (seconds === 0) return;

    const user = useAuthStore.getState().user;
    if (!user) return;

    pendingSecondsRef.current = 0;

    const { error: rpcError } = await supabase.rpc("increment_used_seconds", {
      uid: user.id,
      delta: seconds,
    });

    if (rpcError) {
      console.warn("[TIMER] RPC 실패, 직접 UPDATE 폴백 시도:", rpcError.message);
      const ok = await fallbackDirectUpdate(user.id, seconds);
      if (!ok) {
        pendingSecondsRef.current += seconds;
        console.error("[TIMER] 폴백 UPDATE도 실패, 다음 동기화에 재시도");
      }
    }
  }, []);

  const fetchUserQuota = useCallback(async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("users")
        .select("used_seconds, limit_seconds")
        .eq("id", user.id)
        .single();

      if (error) {
        console.warn("[TIMER] 사용 시간 조회 실패:", error.message);
        return;
      }

      if (data) {
        userUsedRef.current = data.used_seconds ?? 0;
        userLimitRef.current = data.limit_seconds ?? 3600;
      }
    } catch (err) {
      console.warn("[TIMER] 사용 시간 조회 중 예외:", err);
    }
  }, []);

  const stopTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    syncToDb();
  }, [syncToDb]);

  const startTimer = useCallback(() => {
    stopTimer();
    pendingSecondsRef.current = 0;
    fetchUserQuota();

    intervalRef.current = setInterval(() => {
      const current = useMeetingStore.getState().meetingTime;
      setMeetingTime(current + 1);

      pendingSecondsRef.current += 1;
      userUsedRef.current += 1;

      if (
        userLimitRef.current !== null &&
        userUsedRef.current >= userLimitRef.current
      ) {
        const { isRecording } = useMeetingStore.getState();
        if (isRecording) {
          useMeetingStore.getState().setIsRecording(false);
          stopTimer();
          alert(
            "사용 시간이 만료되었습니다. 내 사전에 단어를 등록하면 시간이 늘어납니다!"
          );
        }
        return;
      }

      if (pendingSecondsRef.current >= DB_SYNC_INTERVAL_SEC) {
        syncToDb();
      }
    }, 1000);
  }, [stopTimer, setMeetingTime, syncToDb, fetchUserQuota]);

  const resetTimer = useCallback(() => {
    stopTimer();
    setMeetingTime(0);
  }, [stopTimer, setMeetingTime]);

  useEffect(() => {
    return () => stopTimer();
  }, [stopTimer]);

  return { startTimer, stopTimer, resetTimer };
}
