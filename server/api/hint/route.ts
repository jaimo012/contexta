import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const SYSTEM_PROMPT =
  "너는 B2B IT 솔루션 영업대표를 돕는 뛰어난 AI 코파일럿이야. " +
  "주어진 대화 내역을 보고, 현재 상황에 맞는 아주 짧고 강력한 화제 전환 또는 대응 힌트를 1문장으로 제시해.";

export async function POST(request: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY가 설정되지 않았습니다", code: "MISSING_API_KEY" },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { transcripts } = body as { transcripts: string };

    if (!transcripts || transcripts.trim() === "") {
      return NextResponse.json(
        { error: "대화 텍스트가 필요합니다", code: "MISSING_TRANSCRIPTS" },
        { status: 400 }
      );
    }

    const client = new Anthropic({ apiKey });

    const message = await client.messages.create({
      model: "claude-3-5-haiku-20241022",
      max_tokens: 256,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `다음은 현재 진행 중인 B2B 미팅의 실시간 대화 내용입니다:\n\n${transcripts}`,
        },
      ],
    });

    const block = message.content[0];
    const hint = block.type === "text" ? block.text : "";

    return NextResponse.json({ hint });
  } catch (err) {
    console.error("Hint API 처리 중 오류:", err);
    return NextResponse.json(
      { error: "힌트 생성에 실패했습니다", code: "HINT_ERROR" },
      { status: 500 }
    );
  }
}
