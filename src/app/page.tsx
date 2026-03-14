export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)]">
      <main className="flex flex-col items-center gap-8 text-center px-6">
        <h1 className="text-5xl font-bold tracking-tight text-[var(--foreground)]">
          Contexta
        </h1>
        <p className="text-lg text-zinc-500 max-w-md">
          B2B 영업대표를 위한 실시간 AI 미팅 코파일럿
        </p>
        <div className="flex gap-4 mt-4">
          <a
            href="/dashboard"
            className="rounded-full bg-zinc-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
          >
            대시보드로 이동
          </a>
          <a
            href="/login"
            className="rounded-full border border-zinc-300 px-6 py-3 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100"
          >
            로그인
          </a>
        </div>
      </main>
    </div>
  );
}
