import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    message: "Meeting API - Phase 1에서 구현 예정",
    meetings: [],
  });
}

export async function POST() {
  return NextResponse.json({
    message: "Meeting 생성 API - Phase 1에서 구현 예정",
  });
}
