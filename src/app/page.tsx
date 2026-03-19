import { Mic, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-notion-bg">
      <main className="flex flex-col items-center gap-6 text-center px-6">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-mint">
            <Mic className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-dark">
            Contexta
          </h1>
        </div>

        <p className="text-base text-notion-text-secondary max-w-md leading-relaxed">
          B2B 영업대표를 위한 실시간 AI 미팅 코파일럿.
          <br />
          회의 중 실시간 코칭과 자동 회의록을 경험하세요.
        </p>

        <div className="flex gap-3 mt-4">
          <a
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-lg bg-dark px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-dark/90"
          >
            대시보드로 이동
            <ArrowRight className="h-4 w-4" />
          </a>
          <a
            href="/login"
            className="inline-flex items-center gap-2 rounded-lg border border-notion-border px-6 py-2.5 text-sm font-medium text-notion-text transition-colors hover:bg-notion-bg-hover"
          >
            로그인
          </a>
        </div>
      </main>
    </div>
  );
}
