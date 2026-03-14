export default function ReviewPage() {
  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="flex h-14 items-center border-b border-zinc-200 bg-white px-6">
        <a href="/dashboard" className="text-zinc-400 hover:text-zinc-700 text-sm mr-4">
          ← 대시보드
        </a>
        <span className="text-lg font-bold tracking-tight text-zinc-900">
          미팅 리뷰
        </span>
      </header>
      <main className="mx-auto max-w-4xl px-6 py-8">
        <div className="rounded-xl border border-zinc-200 bg-white p-12 text-center">
          <p className="text-zinc-400">
            미팅 리뷰 기능은 다음 Phase에서 구현됩니다.
          </p>
        </div>
      </main>
    </div>
  );
}
