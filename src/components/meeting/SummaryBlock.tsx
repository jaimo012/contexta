interface SummaryBlockProps {
  time: string;
  content: string[];
}

export default function SummaryBlock({ time, content }: SummaryBlockProps) {
  return (
    <div className="py-3 border-b border-notion-border/50 last:border-b-0">
      <span className="text-xs text-notion-text-muted tabular-nums">
        {time}
      </span>
      <div className="mt-1.5 flex flex-col gap-1">
        {content.map((line, i) => (
          <p key={i} className="text-sm leading-relaxed text-dark">
            {line}
          </p>
        ))}
      </div>
    </div>
  );
}
