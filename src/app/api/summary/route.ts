import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const SYSTEM_PROMPT = `너는 B2B IT 솔루션 전문 컨설턴트야. 주어진 전체 회의 스크립트를 분석하여 다음 4가지 모듈로 구성된 완벽한 마크다운(Markdown) 회의록을 작성해.
1. 🎯 회의 개요 (일시, 핵심 주제 1줄)
2. 📝 핵심 요약 (3~4개의 불릿 포인트)
3. 💬 주요 논의 사항 (고객의 페인포인트와 우리의 제안)
4. 🚀 Next Action Item (누가, 언제까지, 무엇을 할 것인지 명확히)`;

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
    const { fullTranscript } = body as { fullTranscript: string };

    if (!fullTranscript || fullTranscript.trim() === "") {
      return NextResponse.json(
        { error: "회의 스크립트가 필요합니다", code: "MISSING_TRANSCRIPT" },
        { status: 400 }
      );
    }

    const client = new Anthropic({ apiKey });

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `다음은 방금 종료된 B2B 미팅의 전체 대화 스크립트입니다. 위 형식에 맞춰 회의록을 작성해 줘.\n\n${fullTranscript}`,
        },
      ],
    });

    const block = message.content[0];
    const minutes = block.type === "text" ? block.text : "";

    return NextResponse.json({ minutes });
  } catch (err) {
    console.error("Summary API 처리 중 오류:", err);
    return NextResponse.json(
      { error: "회의록 생성에 실패했습니다", code: "SUMMARY_ERROR" },
      { status: 500 }
    );
  }
}
