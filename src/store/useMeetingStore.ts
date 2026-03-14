import { create } from "zustand";

interface MeetingState {
  isRecording: boolean;
  isClientMode: boolean;
  meetingTime: number;
  isMicGranted: boolean;
  isSpeaking: boolean;
  audioChunks: Blob[];
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
}

const INITIAL_STATE: MeetingState = {
  isRecording: false,
  isClientMode: false,
  meetingTime: 0,
  isMicGranted: false,
  isSpeaking: false,
  audioChunks: [],
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
  })
);
