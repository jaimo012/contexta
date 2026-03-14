export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="flex h-14 items-center border-b border-zinc-200 bg-white px-6">
        <a href="/dashboard" className="text-zinc-400 hover:text-zinc-700 text-sm mr-4">
          ← 대시보드
        </a>
        <span className="text-lg font-bold tracking-tight text-zinc-900">
          설정
        </span>
      </header>
      <main className="mx-auto max-w-2xl px-6 py-8">
        <div className="rounded-xl border border-zinc-200 bg-white p-12 text-center">
          <p className="text-zinc-400">
            설정 기능은 다음 Phase에서 구현됩니다.
          </p>
        </div>
      </main>
    </div>
  );
}
