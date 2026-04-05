"use client";

interface MiniCalendarProps {
  meetings: Array<{ created_at: string }>;
  scheduled?: Array<{ datetime: string }>;
}

export default function MiniCalendar({ meetings, scheduled = [] }: MiniCalendarProps) {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const todayDate = today.getDate();

  const monthNames = [
    "1월", "2월", "3월", "4월", "5월", "6월",
    "7월", "8월", "9월", "10월", "11월", "12월",
  ];
  const dayNames = ["일", "월", "화", "수", "목", "금", "토"];

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const pastMeetingDays = new Set(
    meetings
      .map((m) => {
        const d = new Date(m.created_at);
        if (d.getFullYear() === year && d.getMonth() === month) {
          return d.getDate();
        }
        return null;
      })
      .filter((d): d is number => d !== null)
  );

  const scheduledDays = new Set(
    scheduled
      .map((m) => {
        const d = new Date(m.datetime);
        if (d.getFullYear() === year && d.getMonth() === month) {
          return d.getDate();
        }
        return null;
      })
      .filter((d): d is number => d !== null)
  );

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="rounded-lg border border-notion-border bg-notion-bg p-3">
      <div className="text-xs font-medium text-dark text-center mb-2">
        {year}년 {monthNames[month]}
      </div>
      <div className="grid grid-cols-7 gap-0.5 text-center">
        {dayNames.map((d) => (
          <div
            key={d}
            className="text-[10px] font-medium text-notion-text-muted py-1"
          >
            {d}
          </div>
        ))}
        {cells.map((day, i) => {
          const isToday = day === todayDate;
          const hasPast = day !== null && pastMeetingDays.has(day);
          const hasScheduled = day !== null && scheduledDays.has(day);
          return (
            <div key={i} className="relative flex flex-col items-center">
              <button
                className={`w-7 h-7 rounded-md text-xs transition-colors ${
                  day === null
                    ? ""
                    : isToday
                      ? "bg-mint text-white font-medium"
                      : "text-notion-text hover:bg-notion-bg-hover"
                }`}
                disabled={day === null}
              >
                {day}
              </button>
              {day && !isToday && (hasPast || hasScheduled) && (
                <span
                  className={`absolute bottom-0 h-1 w-1 rounded-full ${
                    hasScheduled ? "bg-mint-dark" : "bg-mint"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
