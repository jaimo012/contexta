interface GlossaryCardProps {
  term: string;
  definition: string;
}

export default function GlossaryCard({ term, definition }: GlossaryCardProps) {
  return (
    <div className="rounded-md border border-notion-border bg-notion-bg px-3 py-2.5 hover:bg-notion-bg-hover transition-colors">
      <h3 className="text-sm font-medium text-dark">{term}</h3>
      <p className="mt-0.5 text-xs leading-relaxed text-notion-text-secondary">{definition}</p>
    </div>
  );
}
