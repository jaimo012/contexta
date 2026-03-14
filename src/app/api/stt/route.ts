import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@deepgram/sdk";

export async function POST(request: NextRequest) {
  const apiKey = process.env.DEEPGRAM_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "DEEPGRAM_API_KEY가 설정되지 않았습니다", code: "MISSING_API_KEY" },
      { status: 500 }
    );
  }

  try {
    const formData = await request.formData();
    const audioFile = formData.get("audio");

    if (!audioFile || !(audioFile instanceof Blob)) {
      return NextResponse.json(
        { error: "오디오 파일이 필요합니다", code: "MISSING_AUDIO" },
        { status: 400 }
      );
    }

    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const deepgram = createClient(apiKey);

    const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
      buffer,
      {
        model: "nova-2",
        language: "ko",
        smart_format: true,
      }
    );

    if (error) {
      console.error("Deepgram STT 에러:", error);
      return NextResponse.json(
        { error: "음성 변환에 실패했습니다", code: "STT_ERROR" },
        { status: 502 }
      );
    }

    const transcript =
      result?.results?.channels?.[0]?.alternatives?.[0]?.transcript ?? "";

    return NextResponse.json({ text: transcript });
  } catch (err) {
    console.error("STT API 처리 중 오류:", err);
    return NextResponse.json(
      { error: "서버 내부 오류가 발생했습니다", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
