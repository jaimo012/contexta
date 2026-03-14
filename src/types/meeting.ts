export interface Meeting {
  id: string;
  title: string;
  clientName: string;
  agenda: string;
  status: MeetingStatus;
  projectId: string | null;
  startedAt: string | null;
  endedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type MeetingStatus = "preparing" | "recording" | "processing" | "completed";

export interface MeetingSetup {
  title: string;
  clientName: string;
  agenda: string;
  projectId?: string;
}

export interface SummaryBlock {
  id: string;
  meetingId: string;
  content: string;
  hint: string | null;
  timestamp: number;
  createdAt: string;
}

export interface TranscriptSegment {
  id: string;
  meetingId: string;
  speakerId: string | null;
  text: string;
  startTime: number;
  endTime: number;
}

export interface SpeakerProfile {
  id: string;
  label: string;
  role: "me" | "client" | "unknown";
}
