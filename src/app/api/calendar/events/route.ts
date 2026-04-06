import { NextRequest, NextResponse } from "next/server";
import { getProviderToken } from "@/utils/supabaseServer";

const GOOGLE_CALENDAR_EVENTS_BASE =
  "https://www.googleapis.com/calendar/v3/calendars";

const DEFAULT_LOOKAHEAD_DAYS = 14;
const MAX_RESULTS_PER_CALENDAR = 50;

export interface CalendarEventItem {
  id: string;
  title: string;
  datetime: string;
  endDatetime?: string;
  duration: string;
  location?: string;
  attendees?: number;
  source: "google";
  calendarId: string;
}

function computeDuration(start: string, end: string): string {
  const ms = new Date(end).getTime() - new Date(start).getTime();
  const totalMin = Math.round(ms / 60_000);
  if (totalMin < 60) return `${totalMin}분`;
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return m > 0 ? `${h}시간 ${m}분` : `${h}시간`;
}

export async function GET(request: NextRequest) {
  const token = await getProviderToken(request);
  if (!token) {
    return NextResponse.json(
      { error: "Google 인증이 필요합니다.", code: "NO_TOKEN" },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const calendarIdsParam = searchParams.get("calendarIds");
  const calendarIds = calendarIdsParam
    ? calendarIdsParam.split(",").filter(Boolean)
    : ["primary"];

  const now = new Date();
  const timeMin =
    searchParams.get("timeMin") ?? now.toISOString();
  const timeMax =
    searchParams.get("timeMax") ??
    new Date(now.getTime() + DEFAULT_LOOKAHEAD_DAYS * 86_400_000).toISOString();

  try {
    const allEvents: CalendarEventItem[] = [];

    // Fetch events from each calendar in parallel
    const results = await Promise.allSettled(
      calendarIds.map(async (calId) => {
        const url = new URL(
          `${GOOGLE_CALENDAR_EVENTS_BASE}/${encodeURIComponent(calId)}/events`
        );
        url.searchParams.set("timeMin", timeMin);
        url.searchParams.set("timeMax", timeMax);
        url.searchParams.set("singleEvents", "true");
        url.searchParams.set("orderBy", "startTime");
        url.searchParams.set("maxResults", String(MAX_RESULTS_PER_CALENDAR));

        const res = await fetch(url.toString(), {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 401) {
          throw new Error("TOKEN_EXPIRED");
        }
        if (!res.ok) {
          console.warn(`[CALENDAR EVENTS] ${calId} 오류:`, res.status);
          return [];
        }

        const data = await res.json();
        return (data.items ?? []).map(
          (ev: {
            id: string;
            summary?: string;
            start: { dateTime?: string; date?: string };
            end: { dateTime?: string; date?: string };
            location?: string;
            attendees?: { email: string }[];
          }) => {
            const startStr = ev.start.dateTime ?? ev.start.date ?? "";
            const endStr = ev.end.dateTime ?? ev.end.date ?? "";
            return {
              id: `google_${ev.id}`,
              title: ev.summary ?? "(제목 없음)",
              datetime: startStr,
              endDatetime: endStr,
              duration: startStr && endStr ? computeDuration(startStr, endStr) : "",
              location: ev.location,
              attendees: ev.attendees?.length,
              source: "google" as const,
              calendarId: calId,
            };
          }
        );
      })
    );

    let tokenExpired = false;
    for (const result of results) {
      if (result.status === "fulfilled") {
        allEvents.push(...result.value);
      } else if (result.reason?.message === "TOKEN_EXPIRED") {
        tokenExpired = true;
      }
    }

    if (tokenExpired && allEvents.length === 0) {
      return NextResponse.json(
        { error: "Google 토큰이 만료되었습니다.", code: "TOKEN_EXPIRED" },
        { status: 401 }
      );
    }

    // Deduplicate by id and sort by datetime
    const unique = Array.from(
      new Map(allEvents.map((e) => [e.id, e])).values()
    ).sort(
      (a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime()
    );

    return NextResponse.json({ events: unique });
  } catch (err) {
    console.error("[CALENDAR EVENTS] 오류:", err);
    return NextResponse.json(
      { error: "캘린더 이벤트 조회 중 오류가 발생했습니다.", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
