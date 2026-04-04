"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabaseClient";
import { useAuthStore } from "@/store/useAuthStore";
import {
  ArrowLeft,
  Sparkles,
  Keyboard,
  Clock,
  BookOpen,
  Shield,
  ChevronRight,
  Save,
  Check,
} from "lucide-react";

interface UserSettings {
  hintInterval: number; // minutes
  hintAutoEnabled: boolean;
  clientModeShortcut: string;
  sttLanguage: string;
}

const DEFAULT_SETTINGS: UserSettings = {
  hintInterval: 5,
  hintAutoEnabled: true,
  clientModeShortcut: "Ctrl+Space",
  sttLanguage: "ko",
};

const HINT_INTERVALS = [
  { value: 3, label: "3분" },
  { value: 5, label: "5분 (기본)" },
  { value: 10, label: "10분" },
  { value: 15, label: "15분" },
];

const STT_LANGUAGES = [
  { value: "ko", label: "한국어" },
  { value: "en", label: "영어" },
  { value: "ja", label: "일본어" },
  { value: "zh", label: "중국어" },
];

export default function SettingsPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load settings from localStorage (later can migrate to DB)
  useEffect(() => {
    const stored = localStorage.getItem("contexta_settings");
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as Partial<UserSettings>;
        setSettings((prev) => ({ ...prev, ...parsed }));
      } catch {
        // ignore parse errors
      }
    }
  }, []);

  const handleSave = useCallback(() => {
    setIsSaving(true);
    localStorage.setItem("contexta_settings", JSON.stringify(settings));
    setTimeout(() => {
      setIsSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }, 300);
  }, [settings]);

  const handleDeleteAccount = async () => {
    if (!confirm("정말로 계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) return;
    if (!confirm("모든 미팅 기록과 데이터가 영구적으로 삭제됩니다. 계속하시겠습니까?")) return;

    if (user) {
      // Delete user data
      await supabase.from("custom_words").delete().eq("user_id", user.id);
      await supabase.from("meetings").delete().eq("user_id", user.id);
      await supabase.from("projects").delete().eq("user_id", user.id);
      await supabase.from("users").delete().eq("id", user.id);
    }
    await supabase.auth.signOut();
    localStorage.removeItem("contexta_settings");
    router.push("/login");
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-notion-bg flex flex-col">
      {/* Header */}
      <header className="flex items-center h-11 px-4 border-b border-notion-border shrink-0">
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 text-sm text-notion-text-secondary hover:text-dark transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          대시보드
        </Link>
        <span className="mx-3 text-notion-border">|</span>
        <span className="text-sm font-medium text-dark">설정</span>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-[640px] mx-auto px-6 md:px-12 py-8">
          {/* AI Hint Settings */}
          <SettingsSection
            icon={Sparkles}
            title="AI 힌트"
            description="실시간 AI 코칭 힌트 관련 설정"
          >
            <SettingsRow label="자동 힌트" description="대화 분석 후 자동으로 AI 힌트를 생성합니다">
              <ToggleSwitch
                checked={settings.hintAutoEnabled}
                onChange={(v) => setSettings((s) => ({ ...s, hintAutoEnabled: v }))}
              />
            </SettingsRow>
            <SettingsRow label="힌트 주기" description="자동 힌트가 생성되는 최소 간격">
              <select
                value={settings.hintInterval}
                onChange={(e) => setSettings((s) => ({ ...s, hintInterval: Number(e.target.value) }))}
                disabled={!settings.hintAutoEnabled}
                className="appearance-none text-sm border border-notion-border rounded-md px-3 py-1.5 bg-notion-bg text-dark outline-none focus:border-mint disabled:opacity-50 transition-colors cursor-pointer"
              >
                {HINT_INTERVALS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </SettingsRow>
          </SettingsSection>

          {/* Recording Settings */}
          <SettingsSection
            icon={Clock}
            title="녹음"
            description="음성 인식 및 녹음 관련 설정"
          >
            <SettingsRow label="STT 언어" description="음성 인식의 기본 언어를 설정합니다">
              <select
                value={settings.sttLanguage}
                onChange={(e) => setSettings((s) => ({ ...s, sttLanguage: e.target.value }))}
                className="appearance-none text-sm border border-notion-border rounded-md px-3 py-1.5 bg-notion-bg text-dark outline-none focus:border-mint transition-colors cursor-pointer"
              >
                {STT_LANGUAGES.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </SettingsRow>
          </SettingsSection>

          {/* Shortcut Settings */}
          <SettingsSection
            icon={Keyboard}
            title="단축키"
            description="키보드 단축키 설정"
          >
            <SettingsRow label="클라이언트 모드 전환" description="고객 앞에서 메모장으로 위장하는 화면 전환">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-notion-bg-hover text-sm font-mono text-dark border border-notion-border">
                {settings.clientModeShortcut}
              </span>
            </SettingsRow>
          </SettingsSection>

          {/* Quick Links */}
          <SettingsSection
            icon={BookOpen}
            title="데이터 관리"
            description="나만의 사전 및 데이터 관리"
          >
            <Link
              href="/settings/dictionary"
              className="flex items-center justify-between px-4 py-3 rounded-lg hover:bg-notion-bg-hover transition-colors group"
            >
              <div>
                <p className="text-sm font-medium text-dark">나만의 용어 사전</p>
                <p className="text-xs text-notion-text-muted mt-0.5">
                  STT 인식률을 높이는 커스텀 단어를 관리합니다
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-notion-text-muted group-hover:text-dark transition-colors" />
            </Link>
            <Link
              href="/onboarding"
              className="flex items-center justify-between px-4 py-3 rounded-lg hover:bg-notion-bg-hover transition-colors group"
            >
              <div>
                <p className="text-sm font-medium text-dark">프로필 수정</p>
                <p className="text-xs text-notion-text-muted mt-0.5">
                  AI가 더 정확한 힌트를 제공하기 위해 사용되는 정보입니다
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-notion-text-muted group-hover:text-dark transition-colors" />
            </Link>
          </SettingsSection>

          {/* Danger Zone */}
          <SettingsSection
            icon={Shield}
            title="계정"
            description="계정 및 보안 관련 설정"
            danger
          >
            <SettingsRow
              label="계정 삭제"
              description="모든 데이터가 영구적으로 삭제됩니다"
            >
              <button
                onClick={handleDeleteAccount}
                className="px-3 py-1.5 text-sm font-medium text-pink border border-pink/30 rounded-md hover:bg-pink/5 transition-colors"
              >
                계정 삭제
              </button>
            </SettingsRow>
          </SettingsSection>

          {/* Save button */}
          <div className="flex justify-end mt-6 mb-12">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium text-white bg-dark rounded-lg hover:bg-dark/90 disabled:opacity-60 transition-colors"
            >
              {saved ? (
                <>
                  <Check className="h-4 w-4" />
                  저장 완료
                </>
              ) : isSaving ? (
                "저장 중..."
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  설정 저장
                </>
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

/* ===== Reusable Settings Components ===== */

function SettingsSection({
  icon: Icon,
  title,
  description,
  danger,
  children,
}: {
  icon: typeof Sparkles;
  title: string;
  description: string;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-6">
      <div className="flex items-center gap-2 mb-1">
        <Icon className={`h-4 w-4 ${danger ? "text-pink" : "text-mint-dark"}`} />
        <h2 className="text-sm font-semibold text-dark">{title}</h2>
      </div>
      <p className="text-xs text-notion-text-muted mb-3 ml-6">{description}</p>
      <div className={`rounded-lg border ${danger ? "border-pink/20" : "border-notion-border"} bg-white divide-y divide-notion-border`}>
        {children}
      </div>
    </section>
  );
}

function SettingsRow({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div className="min-w-0 mr-4">
        <p className="text-sm font-medium text-dark">{label}</p>
        {description && (
          <p className="text-xs text-notion-text-muted mt-0.5">{description}</p>
        )}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function ToggleSwitch({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        checked ? "bg-mint" : "bg-notion-border"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}
