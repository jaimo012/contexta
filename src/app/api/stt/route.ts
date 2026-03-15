import { NextRequest, NextResponse } from "next/server";
import { DeepgramClient } from "@deepgram/sdk";
import { createServerClient } from "@supabase/ssr";

const KEYWORD_BOOST = 2;
const KEYWORD_CACHE_TTL_MS = 60_000;

interface CacheEntry {
  keywords: string[];
  expiresAt: number;
}

const keywordCache = new Map<string, CacheEntry>();

function buildSupabaseClient(request: NextRequest) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll() {},
      },
    }
  );
}

async function getUserKeywords(
  request: NextRequest
): Promise<string[]> {
  try {
    const supabase = buildSupabaseClient(request);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return [];

    const cached = keywordCache.get(user.id);
    if (cached && Date.now() < cached.expiresAt) {
      return cached.keywords;
    }

    const { data, error } = await supabase
      .from("custom_words")
      .select("word");

    if (error) {
      console.warn("[STT] custom_words 조회 실패 (DB 미설정 가능):", error.message);
      return [];
    }

    const keywords = (data ?? []).map(
      (row: { word: string }) => `${row.word}:${KEYWORD_BOOST}`
    );

    keywordCache.set(user.id, {
      keywords,
      expiresAt: Date.now() + KEYWORD_CACHE_TTL_MS,
    });

    return keywords;
  } catch (err) {
    console.warn("[STT] 커스텀 키워드 조회 중 예외:", err);
    return [];
  }
}

export async function POST(request: NextRequest) {
  if (!process.env.DEEPGRAM_API_KEY) {
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

    const [arrayBuffer, keywords] = await Promise.all([
      audioFile.arrayBuffer(),
      getUserKeywords(request),
    ]);

    const buffer = Buffer.from(arrayBuffer);
    const deepgram = new DeepgramClient();

    const response = await deepgram.listen.v1.media.transcribeFile(
      buffer,
      {
        model: "nova-2",
        language: "ko",
        smart_format: true,
        keywords,
      }
    );

    const transcript =
      "results" in response
        ? response.results?.channels?.[0]?.alternatives?.[0]?.transcript ?? ""
        : "";

    return NextResponse.json({ text: transcript });
  } catch (err) {
    console.error("STT API 처리 중 오류:", err);
    return NextResponse.json(
      { error: "서버 내부 오류가 발생했습니다", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
