"use client";

import { MapPin, Users, X } from "lucide-react";

interface UpcomingMeetingCardProps {
  title: string;
  time: string;
  duration: string;
  location?: string;
  attendees?: number;
  isToday?: boolean;
  onDelete?: () => void;
}

export default function UpcomingMeetingCard({
  title,
  time,
  duration,
  location,
  attendees,
  isToday,
  onDelete,
}: UpcomingMeetingCardProps) {
  return (
    <div
      className={`group rounded-lg border p-3 hover:bg-notion-bg-hover transition-colors ${
        isToday
          ? "border-mint/30 bg-mint-light/50"
          : "border-notion-border bg-notion-bg"
      }`}
    >
      <div className="flex items-start gap-2">
        <div
          className={`w-0.5 h-full min-h-[36px] rounded-full shrink-0 mt-0.5 ${
            isToday ? "bg-mint" : "bg-notion-border"
          }`}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-1">
            <p className="text-sm font-medium text-dark truncate">{title}</p>
            {onDelete && (
              <button
                onClick={onDelete}
                className="rounded p-0.5 text-notion-text-muted opacity-0 group-hover:opacity-100 hover:text-pink transition-all shrink-0"
                title="삭제"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
          <p
            className={`text-xs mt-0.5 ${
              isToday
                ? "text-mint-dark font-medium"
                : "text-notion-text-secondary"
            }`}
          >
            {time} · {duration}
          </p>
          <div className="flex items-center gap-3 mt-1.5">
            {location && (
              <span className="inline-flex items-center gap-1 text-[11px] text-notion-text-muted">
                <MapPin className="h-3 w-3" />
                {location}
              </span>
            )}
            {attendees !== undefined && attendees > 0 && (
              <span className="inline-flex items-center gap-1 text-[11px] text-notion-text-muted">
                <Users className="h-3 w-3" />
                {attendees}명
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
