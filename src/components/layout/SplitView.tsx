"use client";

import { ReactNode } from "react";
import { SPLIT_VIEW_RATIO } from "@/constants/config";

interface SplitViewProps {
  leftPanel: ReactNode;
  rightPanel: ReactNode;
  isClientMode?: boolean;
}

export default function SplitView({
  leftPanel,
  rightPanel,
  isClientMode = false,
}: SplitViewProps) {
  if (isClientMode) return null;

  return (
    <div className="flex h-full w-full">
      <div
        className="h-full overflow-y-auto border-r border-zinc-200"
        style={{ width: `${SPLIT_VIEW_RATIO.LEFT}%` }}
      >
        {leftPanel}
      </div>
      <div
        className="h-full overflow-y-auto"
        style={{ width: `${SPLIT_VIEW_RATIO.RIGHT}%` }}
      >
        {rightPanel}
      </div>
    </div>
  );
}
