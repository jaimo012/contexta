"use client";

import { useRef, useCallback, useEffect } from "react";
import { useMeetingStore } from "@/store/useMeetingStore";
import { useAuthStore } from "@/store/useAuthStore";
import { supabase } from "@/utils/supabaseClient";

const DB_SYNC_INTERVAL_SEC = 30;
const MAX_SYNC_FAILURES = 3;

async function tryRpcUpdate(userId: string, delta: number): Promise<boolean> {
  const { error } = await supabase.rpc("increment_used_seconds", {
    uid: userId,
    delta,
  });
  return !error;
}

async function tryDirectUpdate(userId: string, delta: number): Promise<boolean> {
  const { data, error: selectError } = await supabase
    .from("users")
    .select("used_seconds")
    .eq("id", userId)
    .single();

  if (selectError || !data) return false;

  const { error: updateError } = await supabase
    .from("users")
    .update({ used_seconds: data.used_seconds + delta })
    .eq("id", userId);

  return !updateError;
}

export function useMeetingTimer(onForceStop?: () => void) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pendingSecondsRef = useRef(0);
  const userLimitRef = useRef<number | null>(null);
  const userUsedRef = useRef<number>(0);
  const syncFailCountRef = useRef(0);
  const dbSyncEnabledRef = useRef(true);

  const setMeetingTime = useMeetingStore((s) => s.setMeetingTime);

  const syncToDb = useCallback(async () => {
    if (!dbSyncEnabledRef.current) return;

    const seconds = pendingSecondsRef.current;
    if (seconds === 0) return;

    const user = useAuthStore.getState().user;
    if (!user) return;

    pendingSecondsRef.current = 0;

    const rpcOk = await tryRpcUpdate(user.id, seconds);
    if (rpcOk) {
      syncFailCountRef.current = 0;
      return;
    }

    const directOk = await tryDirectUpdate(user.id, seconds);
    if (directOk) {
      syncFailCountRef.current = 0;
      return;
    }

    syncFailCountRef.current += 1;
    pendingSecondsRef.current += seconds;

    if (syncFailCountRef.current >= MAX_SYNC_FAILURES) {
      dbSyncEnabledRef.current = false;
      console.warn(
        "[TIMER] DB 동기화 %d회 연속 실패 — 사용 시간 동기화를 비활성화합니다. " +
        "Supabase SQL Editor에서 schema.sql을 실행해 주세요.",
        MAX_SYNC_FAILURES
      );
    }
  }, []);

  const fetchUserQuota = useCallback(async () => {
    if (!dbSyncEnabledRef.current) return;

    const user = useAuthStore.getState().user;
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("users")
        .select("used_seconds, limit_seconds")
        .eq("id", user.id)
        .single();

      if (error) {
        console.warn("[TIMER] 사용 시간 조회 실패 (DB 미설정 가능):", error.message);
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
          onForceStop?.();
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
