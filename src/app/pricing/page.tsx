"use client";

import { Check, Sparkles, Zap, Crown, Gift, Target, User as UserIcon } from "lucide-react";
import AppShell from "@/components/layout/AppShell";

interface Plan {
  id: "free" | "basic" | "pro";
  name: string;
  tagline: string;
  icon: typeof Sparkles;
  price: number;
  priceNote?: string;
  hours: string;
  highlight?: boolean;
  ctaLabel: string;
  ctaDisabled?: boolean;
  features: string[];
  limits?: string;
}

const PLANS: Plan[] = [
  {
    id: "free",
    name: "무료",
    tagline: "Contexta를 가볍게 체험해보고 싶은 분께",
    icon: Sparkles,
    price: 0,
    hours: "월 1시간",
    ctaLabel: "현재 플랜",
    ctaDisabled: true,
    features: [
      "실시간 STT (Deepgram Nova-2, 한국어)",
      "Claude Haiku 실시간 AI 힌트",
      "회의 후 자동 회의록 생성",
      "나만의 용어 사전 (최대 50개)",
      "프로젝트 폴더 기본 제공",
      "TXT 내보내기 · 클립보드 복사",
    ],
    limits:
      "미션 달성 시 최대 3시간까지 무료 확장 (사전 50단어 등록 +1h, 프로필 완성 +1h)",
  },
  {
    id: "basic",
    name: "스타터",
    tagline: "미팅이 간헐적인 기획자·주니어 영업에게",
    icon: Zap,
    price: 19900,
    hours: "월 5시간",
    highlight: true,
    ctaLabel: "스타터 시작하기",
    features: [
      "무료 플랜의 모든 기능 포함",
      "월 5시간 실시간 녹음 · STT",
      "나만의 용어 사전 무제한 등록",
      "프로젝트 폴더 · 오토 라우팅",
      "캘린더 기반 고객사 자동 매칭",
      "모듈형 회의록 (B2B 프리셋 3종)",
      "AI 화자 프로필 추론 매핑",
      "마크다운 · PDF 내보내기",
    ],
  },
  {
    id: "pro",
    name: "프로",
    tagline: "매일 고객 미팅을 돌리는 세일즈·컨설턴트에게",
    icon: Crown,
    price: 49900,
    hours: "무제한",
    priceNote: "프리미엄 AI는 월 30시간까지",
    ctaLabel: "프로 시작하기",
    features: [
      "스타터 플랜의 모든 기능 포함",
      "무제한 실시간 녹음",
      "CLOVA 고정밀 한국어 STT (IT 용어 특화)",
      "Claude Sonnet 프리미엄 회의록",
      "프롬프트 기반 커스텀 회의록 모듈",
      "지식 베이스 연동 (PDF · PPTX · DOCX)",
      "영업 스타일 기반 AI 힌트 톤 조절",
      "Zero Data Retention 보안",
      "우선 기술 지원",
    ],
    limits:
      "월 30시간 초과 시 실시간 코칭(Deepgram + Haiku)은 그대로 제공되며, 사후 STT는 스탠다드 엔진으로 자동 전환됩니다.",
  },
];

function formatPrice(amount: number): string {
  if (amount === 0) return "0원";
  return `${amount.toLocaleString("ko-KR")}원`;
}

export default function PricingPage() {
  return (
    <AppShell title="플랜 업그레이드" showBackButton backHref="/dashboard">
      <PricingContent />
    </AppShell>
  );
}

function PricingContent() {
  return (
    <div className="min-h-full bg-notion-bg">
      <div className="mx-auto max-w-6xl px-6 py-12 md:py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-mint-light px-3 py-1 mb-4">
            <Sparkles className="h-3.5 w-3.5 text-mint-dark" />
            <span className="text-xs font-medium text-mint-dark">
              Contexta 요금제
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-notion-text mb-3">
            미팅 시간 기반의 단순한 요금제
          </h1>
          <p className="text-sm md:text-base text-notion-text-secondary max-w-2xl mx-auto">
            월 녹음 시간을 기준으로 과금하는 구독형 플랜입니다.
            <br className="hidden md:block" />
            필요한 만큼만 쓰고, 업무량에 맞춰 언제든 조정할 수 있습니다.
          </p>
        </div>

        {/* Plans grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {PLANS.map((plan) => {
            const Icon = plan.icon;

            return (
              <div
                key={plan.id}
                className={`relative flex flex-col rounded-xl border bg-notion-bg p-6 transition-all ${
                  plan.highlight
                    ? "border-mint shadow-lg shadow-mint/10 md:scale-[1.02]"
                    : "border-notion-border hover:border-notion-text-muted"
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-mint px-3 py-1 text-[11px] font-semibold text-white shadow-sm">
                      <Sparkles className="h-3 w-3" />첫 결제 추천
                    </span>
                  </div>
                )}

                {/* Header */}
                <div className="mb-5">
                  <div
                    className={`inline-flex h-10 w-10 items-center justify-center rounded-lg mb-3 ${
                      plan.highlight
                        ? "bg-mint text-white"
                        : "bg-mint-light text-mint-dark"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-xl font-bold text-notion-text">
                    {plan.name}
                  </h3>
                  <p className="text-xs text-notion-text-secondary mt-1 leading-relaxed">
                    {plan.tagline}
                  </p>
                </div>

                {/* Price */}
                <div className="mb-5">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-notion-text">
                      {formatPrice(plan.price)}
                    </span>
                    {plan.price > 0 && (
                      <span className="text-sm text-notion-text-secondary">
                        /월
                      </span>
                    )}
                  </div>
                  <div className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-notion-bg-sub px-2 py-1">
                    <span className="text-[11px] font-semibold text-notion-text">
                      {plan.hours}
                    </span>
                    {plan.priceNote && (
                      <span className="text-[10px] text-notion-text-muted">
                        · {plan.priceNote}
                      </span>
                    )}
                  </div>
                </div>

                {/* CTA */}
                <button
                  disabled={plan.ctaDisabled}
                  className={`w-full rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors mb-6 ${
                    plan.ctaDisabled
                      ? "bg-notion-bg-sub text-notion-text-muted cursor-not-allowed"
                      : plan.highlight
                      ? "bg-mint text-white hover:bg-mint-dark"
                      : "bg-notion-text text-white hover:bg-notion-text/90"
                  }`}
                >
                  {plan.ctaLabel}
                </button>

                {/* Features */}
                <ul className="space-y-2.5 flex-1">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2 text-sm text-notion-text"
                    >
                      <Check
                        className={`h-4 w-4 shrink-0 mt-0.5 ${
                          plan.highlight ? "text-mint" : "text-notion-text-muted"
                        }`}
                      />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Limits / FUP notice */}
                {plan.limits && (
                  <div className="mt-5 pt-4 border-t border-notion-border">
                    <p className="text-[11px] text-notion-text-muted leading-relaxed">
                      {plan.limits}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Free 미션 섹션 */}
        <div className="mt-12 rounded-xl border border-mint/30 bg-mint-light/40 p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-mint text-white">
              <Gift className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-notion-text mb-1">
                무료 플랜 미션 — 최대 3시간까지 확장
              </h3>
              <p className="text-xs text-notion-text-secondary mb-4">
                Contexta를 제대로 써보고 싶은 분을 위해, 간단한 설정만으로 무료
                사용 시간을 늘려드립니다.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-start gap-2 rounded-lg bg-notion-bg border border-notion-border p-3">
                  <Target className="h-4 w-4 text-mint-dark shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-notion-text">
                      나만의 사전에 50단어 등록
                    </p>
                    <p className="text-[11px] text-mint-dark font-medium mt-0.5">
                      +1시간 추가
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2 rounded-lg bg-notion-bg border border-notion-border p-3">
                  <UserIcon className="h-4 w-4 text-mint-dark shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-notion-text">
                      내 프로필 100% 완성
                    </p>
                    <p className="text-[11px] text-mint-dark font-medium mt-0.5">
                      +1시간 추가
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-8 rounded-xl border border-notion-border bg-notion-bg-sub p-6">
          <h3 className="text-sm font-semibold text-notion-text mb-3">
            자주 묻는 질문
          </h3>
          <div className="space-y-3 text-xs text-notion-text-secondary">
            <div>
              <p className="font-semibold text-notion-text">
                Q. &quot;월 5시간&quot;은 어떻게 계산되나요?
              </p>
              <p className="mt-1">
                실제 녹음 버튼이 켜져 있는 시간을 기준으로 합산됩니다. 무음·침묵
                구간은 Silero VAD로 약 35% 자동 제거되어 체감 시간은 더 길게
                느껴집니다.
              </p>
            </div>
            <div>
              <p className="font-semibold text-notion-text">
                Q. 프로 플랜은 정말 무제한인가요?
              </p>
              <p className="mt-1">
                네. 녹음과 실시간 AI 코칭(Deepgram + Claude Haiku)은 월 시간
                제한이 없습니다. 다만 CLOVA 고정밀 STT + Claude Sonnet으로
                구성되는 <strong>프리미엄 AI 파이프라인</strong>은 월 30시간까지
                제공되며, 초과분은 스탠다드 엔진으로 자동 전환됩니다.
              </p>
            </div>
            <div>
              <p className="font-semibold text-notion-text">
                Q. 플랜은 언제든 변경할 수 있나요?
              </p>
              <p className="mt-1">
                네, 언제든 업그레이드·다운그레이드가 가능하며 결제 금액은 일할
                계산됩니다.
              </p>
            </div>
            <div>
              <p className="font-semibold text-notion-text">
                Q. 내 회의 데이터는 안전한가요?
              </p>
              <p className="mt-1">
                모든 회의 데이터는 사용자 계정에 격리 저장되며, 타 사용자는
                접근할 수 없습니다. 프로 플랜은 Anthropic·Deepgram에 대해
                <strong> Zero Data Retention</strong> 옵션이 적용되어 외부 AI
                모델 학습에 사용되지 않습니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
