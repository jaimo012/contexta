"use client";

import { useEffect } from "react";
import TopBar from "@/components/meeting/TopBar";
import SummaryBlock from "@/components/meeting/SummaryBlock";
import AiHint from "@/components/meeting/AiHint";
import LiveNotepad from "@/components/meeting/LiveNotepad";
import GlossaryCard from "@/components/meeting/GlossaryCard";
import ClientModeOverlay from "@/components/meeting/ClientModeOverlay";
import { useMeetingStore } from "@/store/useMeetingStore";

const DUMMY_SUMMARIES = [
  {
    time: "14:00 – 14:05",
    content: [
      "고객사 담당자가 현재 사내 ERP 시스템의 데이터 연동 지연 문제를 언급했습니다.",
      "기존 솔루션 대비 실시간 동기화 속도 개선이 이번 도입의 핵심 기대사항입니다.",
      "내부 보안 심사 일정이 4월 중으로 예정되어 있어, 그 전에 PoC 완료가 필요합니다.",
    ],
  },
  {
    time: "14:05 – 14:10",
    content: [
      "가격 모델에 대한 질문이 나왔습니다. 연간 계약 시 할인 여부를 확인해 달라는 요청입니다.",
      "경쟁사 B의 제안서를 이미 받은 상태이며, 우리 측 차별점을 구체적으로 비교해 줄 것을 요구했습니다.",
    ],
  },
  {
    time: "14:10 – 14:15",
    content: [
      "고객사 CTO가 온프레미스 배포 옵션에 대한 기술적 요구사항을 상세히 설명했습니다.",
      "AWS 기반 클라우드 배포와 온프레미스 하이브리드 구성이 가능한지 확인 요청을 받았습니다.",
      "SLA 99.9% 보장 조건과 장애 대응 프로세스에 대한 문서 공유를 요청받았습니다.",
    ],
  },
];

export default function MeetingPage() {
  const toggleClientMode = useMeetingStore((s) => s.toggleClientMode);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.code === "Space") {
        e.preventDefault();
        toggleClientMode();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleClientMode]);

  return (
    <div className="h-screen w-screen overflow-hidden bg-gray-50 flex flex-col">
      <ClientModeOverlay />
      <TopBar />
      <div className="flex-1 flex flex-row w-full h-[calc(100vh-4rem)]">
        {/* 좌측 메인 영역 (70%) */}
        <section className="w-[70%] h-full border-r bg-white p-6 overflow-y-auto">
          {DUMMY_SUMMARIES.map((block) => (
            <SummaryBlock
              key={block.time}
              time={block.time}
              content={block.content}
            />
          ))}
          <div className="pt-2">
            <AiHint message="비용 이야기가 나왔습니다. 도입 사례 12p의 ROI 절감 지표를 언급해 보세요." />
          </div>
        </section>

        {/* 우측 사이드 영역 (30%) */}
        <aside className="w-[30%] h-full bg-gray-50 p-6 flex flex-col gap-4">
          <LiveNotepad />
          <div className="flex flex-col gap-2 overflow-y-auto">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              용어 사전
            </h2>
            <GlossaryCard
              term="Kubernetes"
              definition="컨테이너화된 애플리케이션의 자동 디플로이, 스케일링을 제공하는 시스템"
            />
            <GlossaryCard
              term="SLA (Service Level Agreement)"
              definition="서비스 제공자가 고객에게 보장하는 서비스 품질 수준에 대한 계약"
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
