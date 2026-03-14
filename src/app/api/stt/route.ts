import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@deepgram/sdk";
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
  const supabase = buildSupabaseClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const cached = keywordCache.get(user.id);
  if (cached && Date.now() < cached.expiresAt) {
    return cached.keywords;
  }

  const { data } = await supabase
    .from("custom_words")
    .select("word");

  const keywords = (data ?? []).map(
    (row: { word: string }) => `${row.word}:${KEYWORD_BOOST}`
  );

  keywordCache.set(user.id, {
    keywords,
    expiresAt: Date.now() + KEYWORD_CACHE_TTL_MS,
  });

  return keywords;
}

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

    const [arrayBuffer, keywords] = await Promise.all([
      audioFile.arrayBuffer(),
      getUserKeywords(request),
    ]);

    const buffer = Buffer.from(arrayBuffer);
    const deepgram = createClient(apiKey);

    const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
      buffer,
      {
        model: "nova-2",
        language: "ko",
        smart_format: true,
        keywords,
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
