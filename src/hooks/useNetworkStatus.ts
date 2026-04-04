"use client";

import { useState, useEffect } from "react";
import { useMeetingStore } from "@/store/useMeetingStore";

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );

  const setLastError = useMeetingStore((s) => s.setLastError);
  const clearLastError = useMeetingStore((s) => s.clearLastError);
  const setSttPaused = useMeetingStore((s) => s.setSttPaused);
  const setSttErrorCount = useMeetingStore((s) => s.setSttErrorCount);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);

      // Clear network error and resume STT
      const { lastError } = useMeetingStore.getState();
      if (lastError?.type === "network") {
        clearLastError();
      }
      setSttPaused(false);
      setSttErrorCount(0);
    };

    const handleOffline = () => {
      setIsOnline(false);

      const { isRecording } = useMeetingStore.getState();
      if (isRecording) {
        setLastError({
          type: "network",
          message: "네트워크 연결이 끊겼습니다. 연결이 복구되면 자동으로 재개됩니다.",
          timestamp: Date.now(),
        });
        setSttPaused(true);
      }
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [setLastError, clearLastError, setSttPaused, setSttErrorCount]);

  return { isOnline };
}
