"use client";

import { useState, useCallback } from "react";
import type { Meeting, MeetingSetup, SummaryBlock } from "@/types/meeting";

interface UseMeetingReturn {
  meeting: Meeting | null;
  summaryBlocks: SummaryBlock[];
  createMeeting: (setup: MeetingSetup) => Promise<void>;
  addSummaryBlock: (block: SummaryBlock) => void;
}

export function useMeeting(): UseMeetingReturn {
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [summaryBlocks, setSummaryBlocks] = useState<SummaryBlock[]>([]);

  const createMeeting = useCallback(async (setup: MeetingSetup) => {
    const newMeeting: Meeting = {
      id: crypto.randomUUID(),
      title: setup.title,
      clientName: setup.clientName,
      agenda: setup.agenda,
      status: "preparing",
      projectId: setup.projectId || null,
      startedAt: null,
      endedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setMeeting(newMeeting);
  }, []);

  const addSummaryBlock = useCallback((block: SummaryBlock) => {
    setSummaryBlocks((prev) => [...prev, block]);
  }, []);

  return { meeting, summaryBlocks, createMeeting, addSummaryBlock };
}
