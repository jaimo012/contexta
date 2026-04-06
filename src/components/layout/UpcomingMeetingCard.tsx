"use client";

import { MapPin, Users, X, Globe } from "lucide-react";

interface UpcomingMeetingCardProps {
  title: string;
  time: string;
  duration: string;
  location?: string;
  attendees?: number;
  isToday?: boolean;
  source?: "google" | "ical" | "manual";
  onDelete?: () => void;
}

export default function UpcomingMeetingCard({
  title,
  time,
  duration,
  location,
  attendees,
  isToday,
  source,
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
            <div className="flex items-center gap-1.5 min-w-0">
              <p className="text-sm font-medium text-dark truncate">{title}</p>
              {source === "google" && <GoogleCalIcon />}
              {source === "ical" && (
                <Globe className="h-3 w-3 text-notion-text-muted shrink-0" />
              )}
            </div>
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
            {time}
            {duration ? ` · ${duration}` : ""}
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

function GoogleCalIcon() {
  return (
    <svg className="h-3 w-3 shrink-0" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}
