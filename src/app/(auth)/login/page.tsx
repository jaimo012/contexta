"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/utils/supabaseClient";
import { useAuthStore } from "@/store/useAuthStore";
import { Mic } from "lucide-react";

const DEFAULT_REDIRECT = "/dashboard";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);

  useEffect(() => {
    if (isLoading) return;
    if (!user) return;

    const redirectTo = searchParams.get("redirectTo") || DEFAULT_REDIRECT;

    // Check if the user has completed onboarding
    (async () => {
      try {
        const { data } = await supabase
          .from("users")
          .select("profile_completed")
          .eq("id", user.id)
          .single();

        if (!data || !data.profile_completed) {
          router.replace("/onboarding");
          return;
        }
      } catch {
        // DB not set up or query failed — skip onboarding check
      }
      router.replace(redirectTo);
    })();
  }, [user, isLoading, router, searchParams]);

  const handleGoogleLogin = async () => {
    const next = searchParams.get("redirectTo") || DEFAULT_REDIRECT;

    const callbackUrl = new URL("/login", window.location.origin);
    callbackUrl.searchParams.set("redirectTo", next);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: callbackUrl.toString(),
      },
    });

    if (error) {
      console.error("[AUTH] 구글 로그인 실패:", error.message);
      alert("로그인에 실패했습니다. 다시 시도해 주세요.");
    }
  };

  if (isLoading || user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-notion-bg">
        <div className="text-sm text-notion-text-muted">
          {user ? "이동 중..." : "로딩 중..."}
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-notion-bg">
      <div className="w-full max-w-sm rounded-xl bg-white p-10 border border-notion-border">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3 mb-10">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-mint">
            <Mic className="h-6 w-6 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-bold text-dark">Contexta</h1>
            <p className="text-sm text-notion-text-secondary mt-1">
              실시간 AI 미팅 코파일럿
            </p>
          </div>
        </div>

        <button
          onClick={handleGoogleLogin}
          className="flex w-full items-center justify-center gap-3 rounded-lg border border-notion-border bg-white px-4 py-3 text-sm font-medium text-notion-text hover:bg-notion-bg-hover transition-colors"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          구글 계정으로 시작하기
        </button>

        <p className="mt-8 text-center text-xs text-notion-text-muted">
          로그인 시 서비스 이용약관에 동의하는 것으로 간주합니다.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-notion-bg">
          <div className="text-sm text-notion-text-muted">로딩 중...</div>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
