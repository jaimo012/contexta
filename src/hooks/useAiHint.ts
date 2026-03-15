"use client";

import { useRef, useCallback, useEffect } from "react";
import { useMeetingStore } from "@/store/useMeetingStore";
import { apiUrl } from "@/utils/apiUrl";

const SILENCE_AUTO_HINT_MS = 3000;
const INTERVAL_AUTO_HINT_MS = 5 * 60 * 1000;
const HINT_FETCH_TIMEOUT_MS = 25_000;

export function useAiHint() {
  const isFetchingRef = useRef(false);
  const lastHintTimeRef = useRef<number>(0);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const addHint = useMeetingStore((s) => s.addHint);

  const fetchHint = useCallback(async () => {
    if (isFetchingRef.current) return;

    const { transcripts } = useMeetingStore.getState();
    if (transcripts.length === 0) return;

    const combined = transcripts.map((t) => t.text).join(" ");
    if (combined.trim() === "") return;

    isFetchingRef.current = true;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), HINT_FETCH_TIMEOUT_MS);

      const res = await fetch(apiUrl("/api/hint"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcripts: combined }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const data = await res.json();

      if (res.ok && data.hint && data.hint.trim() !== "") {
        addHint({
          id: typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
          text: data.hint,
          timestamp: Date.now(),
        });
        lastHintTimeRef.current = Date.now();
        console.log(`[HINT] 💡 "${data.hint}"`);
      }
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        console.warn("[HINT] 힌트 요청 타임아웃");
      } else {
        console.error("[HINT] 힌트 요청 실패:", err);
      }
    } finally {
      isFetchingRef.current = false;
    }
  }, [addHint]);

  useEffect(() => {
    const unsubscribe = useMeetingStore.subscribe((state, prev) => {
      if (!state.isRecording) return;
      if (state.transcripts.length <= prev.transcripts.length) return;

      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }

      silenceTimerRef.current = setTimeout(() => {
        fetchHint();
      }, SILENCE_AUTO_HINT_MS);
    });

    return () => {
      unsubscribe();
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    };
  }, [fetchHint]);

  useEffect(() => {
    const unsubscribe = useMeetingStore.subscribe((state, prev) => {
      if (state.isRecording && !prev.isRecording) {
        lastHintTimeRef.current = Date.now();
        intervalTimerRef.current = setInterval(() => {
          const elapsed = Date.now() - lastHintTimeRef.current;
          if (elapsed >= INTERVAL_AUTO_HINT_MS) {
            fetchHint();
          }
        }, 30_000);
      }

      if (!state.isRecording && prev.isRecording) {
        if (intervalTimerRef.current) {
          clearInterval(intervalTimerRef.current);
          intervalTimerRef.current = null;
        }
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = null;
        }
      }
    });

    return () => {
      unsubscribe();
      if (intervalTimerRef.current) clearInterval(intervalTimerRef.current);
    };
  }, [fetchHint]);

  return { fetchHint };
}
