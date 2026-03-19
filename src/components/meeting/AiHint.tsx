import { Sparkles } from "lucide-react";

interface AiHintProps {
  message: string;
}

export default function AiHint({ message }: AiHintProps) {
  return (
    <div className="flex items-start gap-2.5 rounded-md bg-mint-light border-l-4 border-l-mint px-4 py-3">
      <Sparkles className="h-4 w-4 text-mint-dark shrink-0 mt-0.5" />
      <p className="text-sm leading-relaxed text-dark">{message}</p>
    </div>
  );
}
