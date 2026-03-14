export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50">
      <div className="w-full max-w-sm rounded-xl bg-white p-8 shadow-sm border border-zinc-200">
        <h1 className="text-2xl font-bold text-zinc-900 text-center mb-2">
          Contexta
        </h1>
        <p className="text-sm text-zinc-500 text-center mb-8">
          로그인하여 미팅을 시작하세요
        </p>
        {/* Phase 1에서 소셜 로그인 구현 예정 */}
        <div className="text-center text-sm text-zinc-400">
          로그인 기능은 다음 Phase에서 구현됩니다.
        </div>
      </div>
    </div>
  );
}
