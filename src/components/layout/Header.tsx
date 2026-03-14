"use client";

import { APP_NAME } from "@/constants/config";

interface HeaderProps {
  showBackButton?: boolean;
  rightSlot?: React.ReactNode;
}

export default function Header({ showBackButton, rightSlot }: HeaderProps) {
  return (
    <header className="flex h-14 items-center justify-between border-b border-zinc-200 bg-white px-6">
      <div className="flex items-center gap-3">
        {showBackButton && (
          <button
            onClick={() => window.history.back()}
            className="text-zinc-500 hover:text-zinc-800 transition-colors"
            aria-label="뒤로가기"
          >
            ←
          </button>
        )}
        <span className="text-lg font-bold tracking-tight text-zinc-900">
          {APP_NAME}
        </span>
      </div>
      {rightSlot && <div>{rightSlot}</div>}
    </header>
  );
}
