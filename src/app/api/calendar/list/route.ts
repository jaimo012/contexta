import { NextRequest, NextResponse } from "next/server";
import { getProviderToken } from "@/utils/supabaseServer";

const GOOGLE_CALENDAR_LIST_URL =
  "https://www.googleapis.com/calendar/v3/users/me/calendarList";

export interface GoogleCalendarItem {
  id: string;
  summary: string;
  backgroundColor?: string;
  primary?: boolean;
}

export async function GET(request: NextRequest) {
  const token = await getProviderToken(request);
  if (!token) {
    return NextResponse.json(
      { error: "Google 인증이 필요합니다. 캘린더를 다시 연동해 주세요.", code: "NO_TOKEN" },
      { status: 401 }
    );
  }

  try {
    const res = await fetch(GOOGLE_CALENDAR_LIST_URL, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.status === 401) {
      return NextResponse.json(
        { error: "Google 토큰이 만료되었습니다. 캘린더를 다시 연동해 주세요.", code: "TOKEN_EXPIRED" },
        { status: 401 }
      );
    }

    if (!res.ok) {
      const body = await res.text();
      console.error("[CALENDAR LIST] Google API 오류:", res.status, body);
      return NextResponse.json(
        { error: "캘린더 목록을 가져올 수 없습니다.", code: "GOOGLE_API_ERROR" },
        { status: 502 }
      );
    }

    const data = await res.json();
    const calendars: GoogleCalendarItem[] = (data.items ?? []).map(
      (item: { id: string; summary: string; backgroundColor?: string; primary?: boolean }) => ({
        id: item.id,
        summary: item.summary,
        backgroundColor: item.backgroundColor,
        primary: item.primary ?? false,
      })
    );

    return NextResponse.json({ calendars });
  } catch (err) {
    console.error("[CALENDAR LIST] 오류:", err);
    return NextResponse.json(
      { error: "캘린더 목록 조회 중 오류가 발생했습니다.", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
