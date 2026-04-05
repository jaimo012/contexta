"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "contexta_calendar_connection";

export type CalendarProvider = "google" | "outlook";

export interface CalendarConnection {
  provider: CalendarProvider;
  email?: string;
  connectedAt: string;
}

function readConnection(): CalendarConnection | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CalendarConnection;
  } catch {
    return null;
  }
}

function writeConnection(conn: CalendarConnection | null) {
  if (typeof window === "undefined") return;
  if (conn) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conn));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
  // Notify listeners in the same tab
  window.dispatchEvent(new CustomEvent("contexta-calendar-change"));
}

/**
 * Tracks calendar integration state.
 * Stored locally for now — future versions can sync to Supabase.
 */
export function useCalendarConnection() {
  const [connection, setConnection] = useState<CalendarConnection | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setConnection(readConnection());
    setHydrated(true);

    const handleChange = () => setConnection(readConnection());
    window.addEventListener("contexta-calendar-change", handleChange);
    window.addEventListener("storage", handleChange);
    return () => {
      window.removeEventListener("contexta-calendar-change", handleChange);
      window.removeEventListener("storage", handleChange);
    };
  }, []);

  const connect = useCallback((provider: CalendarProvider, email?: string) => {
    const next: CalendarConnection = {
      provider,
      email,
      connectedAt: new Date().toISOString(),
    };
    writeConnection(next);
    setConnection(next);
  }, []);

  const disconnect = useCallback(() => {
    writeConnection(null);
    setConnection(null);
  }, []);

  return {
    connection,
    isConnected: !!connection,
    hydrated,
    connect,
    disconnect,
  };
}
