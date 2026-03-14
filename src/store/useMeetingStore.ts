import { create } from "zustand";

interface MeetingState {
  isRecording: boolean;
  isClientMode: boolean;
  meetingTime: number;
}

interface MeetingActions {
  setIsRecording: (value: boolean) => void;
  setIsClientMode: (value: boolean) => void;
  setMeetingTime: (value: number) => void;
  toggleClientMode: () => void;
  resetMeeting: () => void;
}

const INITIAL_STATE: MeetingState = {
  isRecording: false,
  isClientMode: false,
  meetingTime: 0,
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
  })
);
