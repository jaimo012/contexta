import { create } from "zustand";

interface TranscriptEntry {
  id: string;
  text: string;
  timestamp: number;
}

interface HintEntry {
  id: string;
  text: string;
  timestamp: number;
}

interface MeetingState {
  isRecording: boolean;
  isClientMode: boolean;
  meetingTime: number;
  isMicGranted: boolean;
  isSpeaking: boolean;
  audioChunks: Blob[];
  transcripts: TranscriptEntry[];
  hints: HintEntry[];
  isMeetingEnded: boolean;
  isGeneratingMinutes: boolean;
  finalMinutes: string;
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
  setMeetingEnded: (value: boolean) => void;
  setIsGeneratingMinutes: (value: boolean) => void;
  setFinalMinutes: (value: string) => void;
}

const INITIAL_STATE: MeetingState = {
  isRecording: false,
  isClientMode: false,
  meetingTime: 0,
  isMicGranted: false,
  isSpeaking: false,
  audioChunks: [],
  transcripts: [],
  hints: [],
  isMeetingEnded: false,
  isGeneratingMinutes: false,
  finalMinutes: "",
};

export const useMeetingStore = create<MeetingState & MeetingActions>(
  (set) => ({
    ...INITIAL_STATE,

    setIsRecording: (value) => set({ isRecording: value }),
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
      set((state) => ({ hints: [...state.hints, entry] })),
    setMeetingEnded: (value) => set({ isMeetingEnded: value }),
    setIsGeneratingMinutes: (value) => set({ isGeneratingMinutes: value }),
    setFinalMinutes: (value) => set({ finalMinutes: value }),
  })
);
