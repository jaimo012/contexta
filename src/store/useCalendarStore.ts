import { create } from "zustand";

const STORAGE_KEY_SELECTED = "contexta_calendar_selected_ids";
const STORAGE_KEY_ICAL = "contexta_ical_urls";

export interface GoogleCalendar {
  id: string;
  summary: string;
  backgroundColor?: string;
  primary?: boolean;
}

export interface CalendarEvent {
  id: string;
  title: string;
  datetime: string;
  endDatetime?: string;
  duration: string;
  location?: string;
  attendees?: number;
  source: "google" | "ical" | "manual";
  calendarId?: string;
}

interface CalendarState {
  googleCalendars: GoogleCalendar[];
  selectedCalendarIds: string[];
  calendarEvents: CalendarEvent[];
  icalUrls: string[];
  isLoadingCalendars: boolean;
  isLoadingEvents: boolean;
  error: string | null;
}

interface CalendarActions {
  setGoogleCalendars: (cals: GoogleCalendar[]) => void;
  setSelectedCalendarIds: (ids: string[]) => void;
  setCalendarEvents: (events: CalendarEvent[]) => void;
  addIcalUrl: (url: string) => void;
  removeIcalUrl: (url: string) => void;
  setIsLoadingCalendars: (val: boolean) => void;
  setIsLoadingEvents: (val: boolean) => void;
  setError: (msg: string | null) => void;
  hydrate: () => void;
}

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

export const useCalendarStore = create<CalendarState & CalendarActions>(
  (set) => ({
    // State
    googleCalendars: [],
    selectedCalendarIds: [],
    calendarEvents: [],
    icalUrls: [],
    isLoadingCalendars: false,
    isLoadingEvents: false,
    error: null,

    // Actions
    setGoogleCalendars: (cals) => set({ googleCalendars: cals }),

    setSelectedCalendarIds: (ids) => {
      writeJson(STORAGE_KEY_SELECTED, ids);
      set({ selectedCalendarIds: ids });
    },

    setCalendarEvents: (events) => set({ calendarEvents: events }),

    addIcalUrl: (url) =>
      set((state) => {
        if (state.icalUrls.includes(url)) return state;
        const next = [...state.icalUrls, url];
        writeJson(STORAGE_KEY_ICAL, next);
        return { icalUrls: next };
      }),

    removeIcalUrl: (url) =>
      set((state) => {
        const next = state.icalUrls.filter((u) => u !== url);
        writeJson(STORAGE_KEY_ICAL, next);
        return { icalUrls: next };
      }),

    setIsLoadingCalendars: (val) => set({ isLoadingCalendars: val }),
    setIsLoadingEvents: (val) => set({ isLoadingEvents: val }),
    setError: (msg) => set({ error: msg }),

    hydrate: () =>
      set({
        selectedCalendarIds: readJson<string[]>(STORAGE_KEY_SELECTED, []),
        icalUrls: readJson<string[]>(STORAGE_KEY_ICAL, []),
      }),
  })
);
