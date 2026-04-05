"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Building2, Target, User, Pencil, Calendar as CalendarIcon, Check, Plus } from "lucide-react";
import { supabase } from "@/utils/supabaseClient";
import { useAuthStore } from "@/store/useAuthStore";
import AppShell from "@/components/layout/AppShell";
import CalendarIntegrationModal from "@/components/layout/CalendarIntegrationModal";
import { useCalendarConnection } from "@/hooks/useCalendarConnection";
import {
  type ProfileData,
  COACHING_STYLES,
} from "@/constants/profileOptions";

export default function ProfilePage() {
  return (
    <AppShell title="내 정보" showBackButton backHref="/dashboard">
      <ProfileContent />
    </AppShell>
  );
}

function ProfileContent() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [profileCompleted, setProfileCompleted] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const { connection, isConnected: isCalendarConnected } = useCalendarConnection();

  const displayName =
    user?.user_metadata?.full_name || user?.email?.split("@")[0] || "사용자";
  const userEmail = user?.email || "";

  const fetchProfile = useCallback(async () => {
    if (!user) return;
    setFetching(true);
    const { data, error } = await supabase
      .from("users")
      .select("profile_data, profile_completed")
      .eq("id", user.id)
      .single();
    if (!error && data) {
      setProfileData((data.profile_data as ProfileData | null) ?? null);
      setProfileCompleted(!!data.profile_completed);
    }
    setFetching(false);
  }, [user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Redirect to onboarding if profile is empty
  useEffect(() => {
    if (!fetching && !profileCompleted && user) {
      router.replace("/onboarding");
    }
  }, [fetching, profileCompleted, user, router]);

  if (isLoading || fetching) {
    return (
      <div className="flex min-h-full items-center justify-center">
        <div className="h-6 w-6 rounded-full border-2 border-notion-border border-t-dark animate-spin" />
      </div>
    );
  }

  const coachingLabel = COACHING_STYLES.find(
    (cs) => cs.value === profileData?.coachingStyle
  );

  const sections = [
    {
      title: "회사 정보",
      icon: Building2,
      items: [
        { label: "기업명", value: profileData?.companyName },
        { label: "업종", value: profileData?.industry },
        { label: "매출 규모", value: profileData?.companySize },
      ],
    },
    {
      title: "내 정보",
      icon: User,
      items: [
        { label: "이름", value: profileData?.displayName || displayName },
        { label: "이메일", value: userEmail },
        { label: "부서", value: profileData?.department },
        { label: "직급", value: profileData?.position },
        { label: "직무", value: profileData?.role },
        { label: "세부 직무", value: profileData?.roleDetail },
      ],
    },
    {
      title: "사용 목적",
      icon: Target,
      items: [
        {
          label: "주요 사용 용도",
          value:
            profileData?.useCases && profileData.useCases.length > 0
              ? profileData.useCases.join(", ")
              : undefined,
          chips: profileData?.useCases,
        },
        { label: "주간 미팅 빈도", value: profileData?.meetingFrequency },
        {
          label: "주요 미팅 상대방",
          value:
            profileData?.clientTypes && profileData.clientTypes.length > 0
              ? profileData.clientTypes.join(", ")
              : undefined,
          chips: profileData?.clientTypes,
        },
        {
          label: "AI 코칭 스타일",
          value: coachingLabel
            ? `${coachingLabel.label} — ${coachingLabel.desc}`
            : undefined,
        },
        { label: "주요 취급 제품·서비스", value: profileData?.mainProducts },
      ],
    },
  ];

  return (
    <div className="max-w-[720px] mx-auto px-6 md:px-12 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-dark">내 프로필</h1>
          <p className="text-notion-text-secondary mt-1">
            AI가 미팅 중 더 정확한 힌트를 제공하기 위해 사용됩니다
          </p>
        </div>
        <button
          onClick={() => router.push("/onboarding")}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-mint rounded-lg hover:bg-mint-dark transition-colors"
        >
          <Pencil className="h-3.5 w-3.5" />
          수정하기
        </button>
      </div>

      {/* Calendar integration */}
      <div className="mb-6 rounded-lg border border-notion-border bg-white p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-lg shrink-0 ${
                isCalendarConnected ? "bg-mint-light" : "bg-notion-bg-sub"
              }`}
            >
              <CalendarIcon
                className={`h-5 w-5 ${
                  isCalendarConnected ? "text-mint-dark" : "text-notion-text-secondary"
                }`}
              />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-dark">캘린더 연동</h2>
              {isCalendarConnected && connection ? (
                <p className="text-xs text-notion-text-secondary mt-0.5">
                  {connection.provider === "google" ? "Google 캘린더" : "Outlook 캘린더"}
                  {connection.email ? ` · ${connection.email}` : ""} 연동됨
                </p>
              ) : (
                <p className="text-xs text-notion-text-secondary mt-0.5">
                  외부 캘린더 일정을 Contexta에서 바로 확인하고 녹음하세요
                </p>
              )}
            </div>
          </div>
          <button
            onClick={() => setIsCalendarModalOpen(true)}
            className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg transition-colors shrink-0 ${
              isCalendarConnected
                ? "text-mint-dark bg-mint-light/60 hover:bg-mint-light border border-mint/30"
                : "text-white bg-mint hover:bg-mint-dark"
            }`}
          >
            {isCalendarConnected ? (
              <>
                <Check className="h-3.5 w-3.5" />
                연동 관리
              </>
            ) : (
              <>
                <Plus className="h-3.5 w-3.5" />
                캘린더 연동하기
              </>
            )}
          </button>
        </div>
      </div>

      <CalendarIntegrationModal
        open={isCalendarModalOpen}
        onClose={() => setIsCalendarModalOpen(false)}
      />

      {/* Profile sections */}
      <div className="flex flex-col gap-6">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <div
              key={section.title}
              className="rounded-lg border border-notion-border bg-white p-5"
            >
              <div className="flex items-center gap-2 mb-4">
                <Icon className="h-4 w-4 text-mint-dark" />
                <h2 className="text-sm font-semibold text-dark">
                  {section.title}
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
                {section.items.map((item) => (
                  <div key={item.label}>
                    <dt className="text-xs text-notion-text-muted mb-0.5">
                      {item.label}
                    </dt>
                    {"chips" in item && item.chips && item.chips.length > 0 ? (
                      <dd className="flex flex-wrap gap-1.5">
                        {item.chips.map((chip) => (
                          <span
                            key={chip}
                            className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border border-mint/30 bg-mint-light/50 text-mint-dark"
                          >
                            {chip}
                          </span>
                        ))}
                      </dd>
                    ) : (
                      <dd className="text-sm text-dark">
                        {item.value || (
                          <span className="text-notion-text-muted">미입력</span>
                        )}
                      </dd>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
