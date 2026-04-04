import { create } from "zustand";
import { DEMO_MEETINGS, type AgendaItem } from "@/constants/demoMeetings";

export type { AgendaItem } from "@/constants/demoMeetings";

export interface TranscriptEntry {
  id: string;
  text: string;
  timestamp: number;
}

export interface HintEntry {
  id: string;
  text: string;
  timestamp: number;
}

export interface SummaryEntry {
  id: string;
  text: string;
  timestamp: number;
  type: "summary" | "hint";
}

interface GlossaryEntry {
  term: string;
  definition: string;
}

export interface AppError {
  type: "stt" | "hint" | "summary" | "network" | "db";
  message: string;
  timestamp: number;
  retryable?: boolean;
}

export type MeetingTab = "summary" | "script" | "minutes";

interface MeetingState {
  isRecording: boolean;
  isClientMode: boolean;
  meetingTime: number;
  meetingTitle: string;
  selectedProjectId: string | null;
  isMicGranted: boolean;
  isSpeaking: boolean;
  audioChunks: Blob[];
  transcripts: TranscriptEntry[];
  hints: HintEntry[];
  summaries: SummaryEntry[];
  agendaItems: AgendaItem[];
  meetingStartTime: number;
  lastUpdateTime: number;
  activeTab: MeetingTab;
  isMeetingEnded: boolean;
  isGeneratingMinutes: boolean;
  finalMinutes: string;
  isSavedToDb: boolean;
  isDemoMode: boolean;
  glossaryTerms: GlossaryEntry[];
  note: string;
  // Error handling
  sttErrorCount: number;
  sttPaused: boolean;
  lastError: AppError | null;
  summaryError: boolean;
}

interface MeetingActions {
  setIsRecording: (value: boolean) => void;
  setIsClientMode: (value: boolean) => void;
  setMeetingTime: (value: number) => void;
  toggleClientMode: () => void;
  resetMeeting: () => void;
  setMicGranted: (value: boolean) => void;
  setIsSpeaking: (value: boolean) => void;
  addAudioChunk: (chunk: Blob) => void;
  clearAudioChunks: () => void;
  addTranscript: (entry: TranscriptEntry) => void;
  addHint: (entry: HintEntry) => void;
  addSummary: (entry: SummaryEntry) => void;
  setAgendaItems: (items: AgendaItem[]) => void;
  setActiveTab: (tab: MeetingTab) => void;
  setMeetingEnded: (value: boolean) => void;
  setIsGeneratingMinutes: (value: boolean) => void;
  setFinalMinutes: (value: string) => void;
  setIsSavedToDb: (value: boolean) => void;
  setMeetingTitle: (value: string) => void;
  setSelectedProjectId: (value: string | null) => void;
  setNote: (value: string) => void;
  loadDemoData: (demoId: string) => void;
  // Error handling
  setSttErrorCount: (value: number) => void;
  setSttPaused: (value: boolean) => void;
  setLastError: (error: AppError | null) => void;
  clearLastError: () => void;
  setSummaryError: (value: boolean) => void;
}

const INITIAL_STATE: MeetingState = {
  isRecording: false,
  isClientMode: false,
  meetingTime: 0,
  meetingTitle: "",
  selectedProjectId: null,
  isMicGranted: false,
  isSpeaking: false,
  audioChunks: [],
  transcripts: [],
  hints: [],
  summaries: [],
  agendaItems: [],
  meetingStartTime: 0,
  lastUpdateTime: 0,
  activeTab: "summary",
  isMeetingEnded: false,
  isGeneratingMinutes: false,
  finalMinutes: "",
  isSavedToDb: false,
  isDemoMode: false,
  glossaryTerms: [],
  note: "",
  sttErrorCount: 0,
  sttPaused: false,
  lastError: null,
  summaryError: false,
};

export const useMeetingStore = create<MeetingState & MeetingActions>(
  (set) => ({
    ...INITIAL_STATE,

    setIsRecording: (value) =>
      set((state) => ({
        isRecording: value,
        meetingStartTime: value && !state.meetingStartTime ? Date.now() : state.meetingStartTime,
      })),
    setIsClientMode: (value) => set({ isClientMode: value }),
    setMeetingTime: (value) => set({ meetingTime: value }),
    toggleClientMode: () =>
      set((state) => ({ isClientMode: !state.isClientMode })),
    resetMeeting: () => set(INITIAL_STATE),
    setMicGranted: (value) => set({ isMicGranted: value }),
    setIsSpeaking: (value) => set({ isSpeaking: value }),
    addAudioChunk: (chunk) =>
      set((state) => ({ audioChunks: [...state.audioChunks, chunk] })),
    clearAudioChunks: () => set({ audioChunks: [] }),
    addTranscript: (entry) =>
      set((state) => ({ transcripts: [...state.transcripts, entry] })),
    addHint: (entry) =>
      set((state) => ({
        hints: [...state.hints, entry],
        // Also add hints to summaries timeline
        summaries: [
          ...state.summaries,
          { id: entry.id, text: entry.text, timestamp: entry.timestamp, type: "hint" as const },
        ],
      })),
    addSummary: (entry) =>
      set((state) => ({
        summaries: [...state.summaries, entry],
        lastUpdateTime: entry.timestamp,
      })),
    setAgendaItems: (items) => set({ agendaItems: items }),
    setActiveTab: (tab) => set({ activeTab: tab }),
    setMeetingEnded: (value) => set({ isMeetingEnded: value }),
    setIsGeneratingMinutes: (value) => set({ isGeneratingMinutes: value }),
    setFinalMinutes: (value) => set({ finalMinutes: value }),
    setIsSavedToDb: (value) => set({ isSavedToDb: value }),
    setMeetingTitle: (value) => set({ meetingTitle: value }),
    setSelectedProjectId: (value) => set({ selectedProjectId: value }),
    setNote: (value) => set({ note: value }),
    setSttErrorCount: (value) => set({ sttErrorCount: value }),
    setSttPaused: (value) => set({ sttPaused: value }),
    setLastError: (error) => set({ lastError: error }),
    clearLastError: () => set({ lastError: null }),
    setSummaryError: (value) => set({ summaryError: value }),
    loadDemoData: (demoId) => {
      const demo = DEMO_MEETINGS.find((d) => d.id === demoId);
      if (!demo) return;
      set({
        ...INITIAL_STATE,
        isDemoMode: true,
        meetingTitle: demo.title,
        meetingTime: demo.meetingTime,
        meetingStartTime: demo.meetingStartTime,
        lastUpdateTime: demo.lastUpdateTime,
        transcripts: demo.transcripts,
        hints: demo.hints,
        summaries: demo.summaries,
        agendaItems: demo.agendaItems,
        glossaryTerms: demo.glossary,
        note: demo.note,
        finalMinutes: demo.minutes,
        isMeetingEnded: true,
      });
    },
  })
);
