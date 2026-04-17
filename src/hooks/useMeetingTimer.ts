"use client";

import { useRef, useCallback, useEffect } from "react";
import { useMeetingStore } from "@/store/useMeetingStore";

export function useMeetingTimer() {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const setMeetingTime = useMeetingStore((s) => s.setMeetingTime);

  const stopTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    stopTimer();

    intervalRef.current = setInterval(() => {
      const current = useMeetingStore.getState().meetingTime;
      setMeetingTime(current + 1);
    }, 1000);
  }, [stopTimer, setMeetingTime]);

  const resetTimer = useCallback(() => {
    stopTimer();
    setMeetingTime(0);
  }, [stopTimer, setMeetingTime]);

  useEffect(() => {
    return () => stopTimer();
  }, [stopTimer]);

  return { startTimer, stopTimer, resetTimer };
}
