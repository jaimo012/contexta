export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="flex h-14 items-center justify-between border-b border-zinc-200 bg-white px-6">
        <span className="text-lg font-bold tracking-tight text-zinc-900">
          Contexta
        </span>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-zinc-900">대시보드</h1>
          <a
            href="/meeting/new"
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 transition-colors"
          >
            + 새 미팅 시작
          </a>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-12 text-center">
          <p className="text-zinc-400">
            아직 미팅 기록이 없습니다. 새 미팅을 시작해 보세요.
          </p>
        </div>
      </main>
    </div>
  );
}
