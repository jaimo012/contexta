interface GlossaryCardProps {
  term: string;
  definition: string;
}

export default function GlossaryCard({ term, definition }: GlossaryCardProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm px-4 py-3">
      <h3 className="text-sm font-bold text-gray-900">{term}</h3>
      <p className="mt-1 text-xs leading-relaxed text-gray-500">{definition}</p>
    </div>
  );
}
