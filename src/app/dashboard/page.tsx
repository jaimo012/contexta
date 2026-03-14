"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabaseClient";
import { useAuthStore } from "@/store/useAuthStore";

const RECENT_MEETINGS = [
  {
    id: "1",
    title: "A사 클라우드 마이그레이션 1차 미팅",
    date: "2026-03-14",
    preview:
      "기존 온프레미스 인프라의 AWS 전환 일정과 예상 비용에 대해 논의. 고객사 CTO가 보안 인증(ISMS) 관련 우려를 표명함.",
  },
  {
    id: "2",
    title: "B사 SaaS 도입 검토 킥오프",
    date: "2026-03-12",
    preview:
      "현재 사용 중인 레거시 ERP 시스템 대체 방안 브리핑. 월 라이선스 비용 대비 ROI 시뮬레이션 요청 접수.",
  },
  {
    id: "3",
    title: "C사 데이터 분석 플랫폼 PoC 리뷰",
    date: "2026-03-10",
    preview:
      "2주간 진행한 PoC 결과 공유. 대시보드 커스터마이징과 실시간 알림 기능에 대한 긍정적 피드백 확인.",
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);

  const displayName =
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "사용자";

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 rounded-full border-4 border-gray-200 border-t-gray-800 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6 md:px-10">
        <span className="text-lg font-bold tracking-tight text-gray-900">
          Contexta
        </span>
        <div className="flex items-center gap-4">
          <span className="hidden sm:inline text-sm text-gray-500">
            환영합니다, <strong className="text-gray-900">{displayName}</strong>님
          </span>
          <button
            onClick={handleLogout}
            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            로그아웃
          </button>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="mx-auto max-w-4xl px-6 py-10">
        {/* 새 미팅 CTA */}
        <div className="flex flex-col items-center gap-2 mb-12">
          <h1 className="text-2xl font-bold text-gray-900">
            환영합니다, {displayName}님
          </h1>
          <p className="text-sm text-gray-500 mb-4">
            새로운 미팅을 시작하거나, 이전 회의록을 확인하세요.
          </p>
          <Link
            href="/meeting"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-blue-200 hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-200 transition-all"
          >
            🚀 새 미팅 시작하기
          </Link>
        </div>

        {/* 최근 미팅 내역 */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            최근 미팅 내역
          </h2>
          <div className="flex flex-col gap-3">
            {RECENT_MEETINGS.map((meeting) => (
              <div
                key={meeting.id}
                className="rounded-xl border border-gray-200 bg-white p-5 hover:shadow-md hover:border-gray-300 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-gray-900">
                    {meeting.title}
                  </h3>
                  <time className="text-xs text-gray-400 shrink-0 ml-4">
                    {meeting.date}
                  </time>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">
                  {meeting.preview}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
