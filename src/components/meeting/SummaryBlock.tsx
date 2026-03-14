interface SummaryBlockProps {
  time: string;
  content: string[];
}

export default function SummaryBlock({ time, content }: SummaryBlockProps) {
  return (
    <div className="py-4 border-b border-gray-100 last:border-b-0">
      <span className="text-xs font-medium text-gray-400 tracking-wide">
        {time}
      </span>
      <div className="mt-2 flex flex-col gap-1.5">
        {content.map((line, i) => (
          <p key={i} className="text-sm leading-relaxed text-gray-800">
            {line}
          </p>
        ))}
      </div>
    </div>
  );
}
