export interface HintResponse {
  summary: string;
  hint: string;
  topicSuggestion: string | null;
}

export interface TermDefinition {
  term: string;
  definition: string;
  category: string;
}

export interface MeetingReport {
  id: string;
  meetingId: string;
  modules: ReportModule[];
  createdAt: string;
}

export interface ReportModule {
  title: string;
  content: string;
  order: number;
}

export interface ReportPreset {
  id: string;
  name: string;
  description: string;
  modules: { title: string; prompt: string }[];
}
