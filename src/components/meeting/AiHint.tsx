interface AiHintProps {
  message: string;
}

export default function AiHint({ message }: AiHintProps) {
  return (
    <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 flex items-start gap-2.5">
      <span className="text-base leading-none shrink-0 mt-0.5">💡</span>
      <p className="text-sm leading-relaxed text-blue-800">{message}</p>
    </div>
  );
}
