"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabaseClient";
import { useAuthStore } from "@/store/useAuthStore";
import {
  Mic,
  Building2,
  UserCircle,
  Target,
  ChevronRight,
  ChevronLeft,
  Check,
  Gift,
  SkipForward,
  Briefcase,
  Sparkles,
} from "lucide-react";
import {
  type ProfileData,
  INITIAL_PROFILE,
  INDUSTRIES,
  COMPANY_SIZES,
  ROLES,
  USE_CASES,
  MEETING_FREQUENCIES,
  CLIENT_TYPES,
  COACHING_STYLES,
} from "@/constants/profileOptions";

/* ===== Constants ===== */
const STEPS = [
  { key: "company", label: "회사 정보", icon: Building2 },
  { key: "person", label: "내 정보", icon: UserCircle },
  { key: "usage", label: "사용 목적", icon: Target },
] as const;

const BONUS_MINUTES = 60;

/* ===== Component ===== */
export default function OnboardingPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<ProfileData>(() => ({
    ...INITIAL_PROFILE,
    displayName: user?.user_metadata?.full_name || "",
  }));
  const [isSaving, setIsSaving] = useState(false);

  const update = useCallback(
    <K extends keyof ProfileData>(key: K, value: ProfileData[K]) => {
      setProfile((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const toggleArray = useCallback(
    (key: "useCases" | "clientTypes", value: string) => {
      setProfile((prev) => {
        const arr = prev[key];
        return {
          ...prev,
          [key]: arr.includes(value)
            ? arr.filter((v) => v !== value)
            : [...arr, value],
        };
      });
    },
    []
  );

  // Count filled fields for progress
  const filledCount = [
    profile.companyName,
    profile.industry,
    profile.companySize,
    profile.displayName,
    profile.department,
    profile.position,
    profile.role,
    profile.useCases.length > 0 ? "filled" : "",
    profile.meetingFrequency,
    profile.coachingStyle,
  ].filter(Boolean).length;
  const totalFields = 10;
  const progressPercent = Math.round((filledCount / totalFields) * 100);

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      // Update existing user row (created by auth trigger)
      const { error } = await supabase
        .from("users")
        .update({
          profile_data: profile,
          profile_completed: true,
          limit_seconds:
            filledCount >= 5
              ? 3600 + BONUS_MINUTES * 60 // base 1h + bonus 1h
              : 3600,
        })
        .eq("id", user.id);
      if (error) {
        console.error("[Onboarding] DB 저장 실패:", error.message);
      }
    } catch (e) {
      console.error("[Onboarding] DB 저장 중 오류:", e);
    }
    setIsSaving(false);
    router.push("/dashboard");
  };

  const handleSkip = () => {
    router.push("/dashboard");
  };

  const canProceed =
    step === 0
      ? !!profile.companyName || !!profile.industry
      : step === 1
        ? !!profile.displayName
        : profile.useCases.length > 0;

  return (
    <div className="h-dvh bg-notion-bg flex flex-col overflow-hidden">
      {/* Top bar */}
      <header className="flex items-center justify-between h-12 px-6 border-b border-notion-border shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex h-5 w-5 items-center justify-center rounded bg-mint">
            <Mic className="h-3 w-3 text-white" />
          </div>
          <span className="text-sm font-semibold text-dark">Contexta</span>
        </div>
        <button
          onClick={handleSkip}
          className="flex items-center gap-1 text-xs text-notion-text-muted hover:text-notion-text-secondary transition-colors"
        >
          <SkipForward className="h-3.5 w-3.5" />
          건너뛰기
        </button>
      </header>

      <div className="flex-1 flex flex-col items-center overflow-y-auto px-4 py-8">
        <div className="w-full max-w-lg">
          {/* Bonus banner */}
          <div className="flex items-center gap-3 rounded-lg border border-mint/20 bg-mint-light/50 px-4 py-3 mb-8">
            <Gift className="h-5 w-5 text-mint-dark shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-dark">
                프로필을 완성하면 <span className="text-mint-dark">+{BONUS_MINUTES}분</span> 사용 시간을 드려요
              </p>
              <p className="text-xs text-notion-text-secondary mt-0.5">
                입력한 정보로 AI가 더 정확한 힌트를 제공합니다
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-lg font-bold text-mint-dark">{progressPercent}%</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-1 w-full rounded-full bg-notion-surface mb-8 overflow-hidden">
            <div
              className="h-full rounded-full bg-mint transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-6">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const isActive = i === step;
              const isDone = i < step;
              return (
                <button
                  key={s.key}
                  onClick={() => i <= step && setStep(i)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    isActive
                      ? "bg-dark text-white"
                      : isDone
                        ? "bg-mint-light text-mint-dark cursor-pointer"
                        : "text-notion-text-muted"
                  }`}
                >
                  {isDone ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <Icon className="h-3.5 w-3.5" />
                  )}
                  {s.label}
                </button>
              );
            })}
          </div>

          {/* Step content */}
          <div className="animate-fade-in">
            {/* ===== Step 1: Company ===== */}
            {step === 0 && (
              <div className="flex flex-col gap-5">
                <div>
                  <h2 className="text-xl font-bold text-dark mb-1">회사에 대해 알려주세요</h2>
                  <p className="text-sm text-notion-text-secondary">
                    AI가 업계에 맞는 용어와 맥락을 이해하는 데 도움이 됩니다
                  </p>
                </div>

                <Field label="기업명">
                  <input
                    type="text"
                    value={profile.companyName}
                    onChange={(e) => update("companyName", e.target.value)}
                    placeholder="예) 삼성SDS, 네이버클라우드"
                    className="input-field"
                    autoFocus
                  />
                </Field>

                <Field label="업종">
                  <ChipSelect
                    options={INDUSTRIES}
                    selected={profile.industry}
                    onSelect={(v) => update("industry", v)}
                  />
                </Field>

                <Field label="매출 규모">
                  <ChipSelect
                    options={COMPANY_SIZES}
                    selected={profile.companySize}
                    onSelect={(v) => update("companySize", v)}
                  />
                </Field>
              </div>
            )}

            {/* ===== Step 2: Person ===== */}
            {step === 1 && (
              <div className="flex flex-col gap-5">
                <div>
                  <h2 className="text-xl font-bold text-dark mb-1">본인에 대해 알려주세요</h2>
                  <p className="text-sm text-notion-text-secondary">
                    직무에 맞는 AI 코칭을 제공하기 위해 필요합니다
                  </p>
                </div>

                <Field label="이름">
                  <input
                    type="text"
                    value={profile.displayName}
                    onChange={(e) => update("displayName", e.target.value)}
                    placeholder="예) 홍길동"
                    className="input-field"
                    autoFocus
                  />
                </Field>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="부서">
                    <input
                      type="text"
                      value={profile.department}
                      onChange={(e) => update("department", e.target.value)}
                      placeholder="예) 영업1팀"
                      className="input-field"
                    />
                  </Field>
                  <Field label="직급">
                    <input
                      type="text"
                      value={profile.position}
                      onChange={(e) => update("position", e.target.value)}
                      placeholder="예) 과장"
                      className="input-field"
                    />
                  </Field>
                </div>

                <Field label="직무">
                  <ChipSelect
                    options={ROLES}
                    selected={profile.role}
                    onSelect={(v) => update("role", v)}
                  />
                </Field>

                <Field label="세부 직무">
                  <input
                    type="text"
                    value={profile.roleDetail}
                    onChange={(e) => update("roleDetail", e.target.value)}
                    placeholder="예) 클라우드 솔루션 영업, SaaS 기술 컨설팅"
                    className="input-field"
                  />
                </Field>
              </div>
            )}

            {/* ===== Step 3: Usage ===== */}
            {step === 2 && (
              <div className="flex flex-col gap-5">
                <div>
                  <h2 className="text-xl font-bold text-dark mb-1">어떻게 사용하실 건가요?</h2>
                  <p className="text-sm text-notion-text-secondary">
                    사용 패턴에 맞게 AI를 최적화합니다
                  </p>
                </div>

                <Field label="주요 사용 용도" hint="복수 선택 가능">
                  <ChipMultiSelect
                    options={USE_CASES}
                    selected={profile.useCases}
                    onToggle={(v) => toggleArray("useCases", v)}
                  />
                </Field>

                <Field label="주간 미팅 빈도">
                  <ChipSelect
                    options={MEETING_FREQUENCIES}
                    selected={profile.meetingFrequency}
                    onSelect={(v) => update("meetingFrequency", v)}
                  />
                </Field>

                <Field label="주요 미팅 상대방" hint="복수 선택 가능">
                  <ChipMultiSelect
                    options={CLIENT_TYPES}
                    selected={profile.clientTypes}
                    onToggle={(v) => toggleArray("clientTypes", v)}
                  />
                </Field>

                <Field label="AI 코칭 스타일">
                  <div className="grid grid-cols-2 gap-2">
                    {COACHING_STYLES.map((cs) => (
                      <button
                        key={cs.value}
                        onClick={() => update("coachingStyle", cs.value)}
                        className={`flex flex-col items-start rounded-lg border px-3 py-2.5 text-left transition-colors ${
                          profile.coachingStyle === cs.value
                            ? "border-mint bg-mint-light/50"
                            : "border-notion-border hover:bg-notion-bg-hover"
                        }`}
                      >
                        <span
                          className={`text-sm font-medium ${
                            profile.coachingStyle === cs.value ? "text-mint-dark" : "text-dark"
                          }`}
                        >
                          {cs.label}
                        </span>
                        <span className="text-[11px] text-notion-text-muted mt-0.5">
                          {cs.desc}
                        </span>
                      </button>
                    ))}
                  </div>
                </Field>

                <Field label="주요 취급 제품·서비스" hint="선택 사항">
                  <input
                    type="text"
                    value={profile.mainProducts}
                    onChange={(e) => update("mainProducts", e.target.value)}
                    placeholder="예) 클라우드 인프라, ERP 구축, AI 솔루션"
                    className="input-field"
                  />
                </Field>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Navigation - fixed bottom */}
      <div className="shrink-0 border-t border-notion-border bg-notion-bg px-6 py-4">
        <div className="mx-auto max-w-lg flex items-center justify-between">
          {step > 0 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-notion-text-secondary rounded-lg hover:bg-notion-bg-hover transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              이전
            </button>
          ) : (
            <div />
          )}

          {step < 2 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed}
              className="flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium text-white bg-dark rounded-lg hover:bg-dark/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              다음
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={!canProceed || isSaving}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-mint rounded-lg hover:bg-mint-dark disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {isSaving ? (
                "저장 중..."
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  완료하고 +{BONUS_MINUTES}분 받기
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ===== Sub Components ===== */

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-baseline gap-2 mb-2">
        <label className="text-sm font-medium text-dark">{label}</label>
        {hint && <span className="text-[11px] text-notion-text-muted">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function ChipSelect({
  options,
  selected,
  onSelect,
}: {
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onSelect(opt === selected ? "" : opt)}
          className={`px-3 py-1.5 rounded-md text-sm border transition-colors ${
            selected === opt
              ? "border-mint bg-mint-light/50 text-mint-dark font-medium"
              : "border-notion-border text-notion-text-secondary hover:bg-notion-bg-hover"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

function ChipMultiSelect({
  options,
  selected,
  onToggle,
}: {
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const isSelected = selected.includes(opt);
        return (
          <button
            key={opt}
            onClick={() => onToggle(opt)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm border transition-colors ${
              isSelected
                ? "border-mint bg-mint-light/50 text-mint-dark font-medium"
                : "border-notion-border text-notion-text-secondary hover:bg-notion-bg-hover"
            }`}
          >
            {isSelected && <Check className="h-3 w-3" />}
            {opt}
          </button>
        );
      })}
    </div>
  );
}
