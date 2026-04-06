import { NextRequest, NextResponse } from "next/server";

const MAX_ICAL_SIZE = 1_048_576; // 1MB
const LOOKAHEAD_DAYS = 14;

export interface IcalEventItem {
  id: string;
  title: string;
  datetime: string;
  endDatetime?: string;
  duration: string;
  location?: string;
  source: "ical";
}

function computeDuration(start: Date, end: Date): string {
  const ms = end.getTime() - start.getTime();
  const totalMin = Math.round(ms / 60_000);
  if (totalMin < 60) return `${totalMin}분`;
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return m > 0 ? `${h}시간 ${m}분` : `${h}시간`;
}

/**
 * Minimal iCal VEVENT parser — no external dependency needed.
 * Parses SUMMARY, DTSTART, DTEND, LOCATION, UID from each VEVENT block.
 */
function parseIcalEvents(icsText: string): IcalEventItem[] {
  const events: IcalEventItem[] = [];
  const now = new Date();
  const maxDate = new Date(now.getTime() + LOOKAHEAD_DAYS * 86_400_000);

  // Split into VEVENT blocks
  const veventBlocks = icsText.split("BEGIN:VEVENT");

  for (let i = 1; i < veventBlocks.length; i++) {
    const block = veventBlocks[i].split("END:VEVENT")[0];
    if (!block) continue;

    const getField = (name: string): string => {
      // Match both simple fields and those with parameters (e.g., DTSTART;VALUE=DATE:20260410)
      const regex = new RegExp(`^${name}[;:](.*)$`, "m");
      const match = block.match(regex);
      if (!match) return "";
      // For fields with parameters like DTSTART;TZID=...:20260410T100000
      const val = match[1];
      const colonIdx = val.indexOf(":");
      // If there's a colon, take the part after it (parameters before, value after)
      return colonIdx >= 0 ? val.substring(colonIdx + 1).trim() : val.trim();
    };

    const parseDate = (raw: string): Date | null => {
      if (!raw) return null;
      // Handle formats: 20260410T100000Z, 20260410T100000, 20260410
      const cleaned = raw.replace(/[^\dT]/g, "");
      if (cleaned.length >= 8) {
        const y = cleaned.slice(0, 4);
        const m = cleaned.slice(4, 6);
        const d = cleaned.slice(6, 8);
        if (cleaned.length >= 15) {
          const hh = cleaned.slice(9, 11);
          const mm = cleaned.slice(11, 13);
          const ss = cleaned.slice(13, 15);
          const isUtc = raw.endsWith("Z");
          const dateStr = `${y}-${m}-${d}T${hh}:${mm}:${ss}${isUtc ? "Z" : ""}`;
          return new Date(dateStr);
        }
        return new Date(`${y}-${m}-${d}T00:00:00`);
      }
      return null;
    };

    const uid = getField("UID") || `ical_${i}_${Date.now()}`;
    const summary = getField("SUMMARY") || "(제목 없음)";
    const location = getField("LOCATION") || undefined;
    const dtstart = parseDate(getField("DTSTART"));
    const dtend = parseDate(getField("DTEND"));

    if (!dtstart) continue;

    // Filter: only future events within lookahead window
    if (dtstart < now || dtstart > maxDate) continue;

    events.push({
      id: `ical_${uid}`,
      title: summary,
      datetime: dtstart.toISOString(),
      endDatetime: dtend?.toISOString(),
      duration: dtend ? computeDuration(dtstart, dtend) : "",
      location,
      source: "ical",
    });
  }

  return events.sort(
    (a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime()
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const url = body.url;

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "iCal URL이 필요합니다.", code: "MISSING_URL" },
        { status: 400 }
      );
    }

    // Basic URL validation
    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch {
      return NextResponse.json(
        { error: "올바른 URL 형식이 아닙니다.", code: "INVALID_URL" },
        { status: 400 }
      );
    }

    if (!["http:", "https:"].includes(parsed.protocol)) {
      return NextResponse.json(
        { error: "http 또는 https URL만 지원합니다.", code: "INVALID_PROTOCOL" },
        { status: 400 }
      );
    }

    // Fetch the ICS content server-side (avoids CORS)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10_000);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: "text/calendar, text/plain, */*" },
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      return NextResponse.json(
        { error: `iCal URL에서 응답을 받을 수 없습니다. (${res.status})`, code: "FETCH_FAILED" },
        { status: 502 }
      );
    }

    // Check content size
    const contentLength = res.headers.get("content-length");
    if (contentLength && parseInt(contentLength) > MAX_ICAL_SIZE) {
      return NextResponse.json(
        { error: "iCal 파일이 너무 큽니다. (최대 1MB)", code: "TOO_LARGE" },
        { status: 413 }
      );
    }

    const text = await res.text();
    if (text.length > MAX_ICAL_SIZE) {
      return NextResponse.json(
        { error: "iCal 파일이 너무 큽니다. (최대 1MB)", code: "TOO_LARGE" },
        { status: 413 }
      );
    }

    if (!text.includes("BEGIN:VCALENDAR")) {
      return NextResponse.json(
        { error: "유효한 iCal 파일이 아닙니다. VCALENDAR 데이터가 필요합니다.", code: "INVALID_ICAL" },
        { status: 400 }
      );
    }

    const events = parseIcalEvents(text);

    return NextResponse.json({ events, total: events.length });
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      return NextResponse.json(
        { error: "iCal URL 요청이 타임아웃되었습니다. (10초)", code: "TIMEOUT" },
        { status: 504 }
      );
    }
    console.error("[ICAL] 오류:", err);
    return NextResponse.json(
      { error: "iCal 처리 중 오류가 발생했습니다.", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
