"use client";

import { useCallback, useEffect, useRef } from "react";
import { useCalendarConnection } from "@/hooks/useCalendarConnection";
import {
  useCalendarStore,
  type CalendarEvent,
} from "@/store/useCalendarStore";
import { apiUrl } from "@/utils/apiUrl";

const SYNC_INTERVAL_MS = 5 * 60_000; // 5 minutes

export function useCalendarSync() {
  const { isConnected } = useCalendarConnection();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mountedRef = useRef(false);

  const {
    isLoadingCalendars,
    isLoadingEvents,
    error,
    setGoogleCalendars,
    setSelectedCalendarIds,
    setCalendarEvents,
    setIsLoadingCalendars,
    setIsLoadingEvents,
    setError,
    hydrate,
  } = useCalendarStore();

  // Hydrate persisted state from localStorage on mount
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  /**
   * Fetch the user's Google Calendar list and auto-select primary if no
   * selection has been made yet.
   */
  const fetchCalendars = useCallback(async () => {
    if (!isConnected) return;
    setIsLoadingCalendars(true);
    setError(null);

    try {
      const res = await fetch(apiUrl("/api/calendar/list"), {
        credentials: "include",
      });

      if (res.status === 401) {
        setError("Google 토큰이 만료되었습니다. 캘린더를 다시 연동해 주세요.");
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "캘린더 목록을 가져올 수 없습니다.");
        return;
      }

      const { calendars } = await res.json();
      setGoogleCalendars(calendars);

      // Auto-select primary calendar if user hasn't made a selection yet
      const stored = useCalendarStore.getState().selectedCalendarIds;
      if (stored.length === 0 && calendars.length > 0) {
        const primaryCal = calendars.find(
          (c: { primary?: boolean }) => c.primary
        );
        setSelectedCalendarIds(
          primaryCal ? [primaryCal.id] : [calendars[0].id]
        );
      }
    } catch (err) {
      console.error("[CALENDAR SYNC] fetchCalendars 실패:", err);
      setError("캘린더 목록 조회 중 오류가 발생했습니다.");
    } finally {
      setIsLoadingCalendars(false);
    }
  }, [
    isConnected,
    setGoogleCalendars,
    setSelectedCalendarIds,
    setIsLoadingCalendars,
    setError,
  ]);

  /**
   * Fetch events from all selected Google calendars + all iCal URLs,
   * merge them, and update the store.
   */
  const syncEvents = useCallback(async () => {
    const calIds = useCalendarStore.getState().selectedCalendarIds;
    const urls = useCalendarStore.getState().icalUrls;

    // Nothing to sync
    if (!isConnected && urls.length === 0) return;
    if (isConnected && calIds.length === 0 && urls.length === 0) return;

    setIsLoadingEvents(true);
    setError(null);

    const allEvents: CalendarEvent[] = [];

    try {
      // 1. Google Calendar events
      if (isConnected && calIds.length > 0) {
        const res = await fetch(
          apiUrl(
            `/api/calendar/events?calendarIds=${encodeURIComponent(calIds.join(","))}`
          ),
          { credentials: "include" }
        );

        if (res.ok) {
          const { events } = await res.json();
          allEvents.push(...events);
        } else if (res.status === 401) {
          setError("Google 토큰이 만료되었습니다. 캘린더를 다시 연동해 주세요.");
        }
      }

      // 2. iCal URL events (fetch each in parallel)
      if (urls.length > 0) {
        const icalResults = await Promise.allSettled(
          urls.map(async (url) => {
            const res = await fetch(apiUrl("/api/calendar/ical"), {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ url }),
            });
            if (!res.ok) return [];
            const { events } = await res.json();
            return events as CalendarEvent[];
          })
        );

        for (const result of icalResults) {
          if (result.status === "fulfilled") {
            allEvents.push(...result.value);
          }
        }
      }

      // Sort by datetime
      allEvents.sort(
        (a, b) =>
          new Date(a.datetime).getTime() - new Date(b.datetime).getTime()
      );

      setCalendarEvents(allEvents);
    } catch (err) {
      console.error("[CALENDAR SYNC] syncEvents 실패:", err);
      setError("캘린더 이벤트 동기화 중 오류가 발생했습니다.");
    } finally {
      setIsLoadingEvents(false);
    }
  }, [isConnected, setCalendarEvents, setIsLoadingEvents, setError]);

  // Auto-sync on mount and every 5 minutes
  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;

    // Delay initial sync slightly to allow hydration
    const timer = setTimeout(() => {
      if (isConnected) {
        fetchCalendars().then(() => syncEvents());
      } else {
        // Still sync iCal URLs even without Google
        syncEvents();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [isConnected, fetchCalendars, syncEvents]);

  // Periodic sync
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      syncEvents();
    }, SYNC_INTERVAL_MS);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [syncEvents]);

  return {
    fetchCalendars,
    syncEvents,
    isLoadingCalendars,
    isLoadingEvents,
    error,
  };
}
