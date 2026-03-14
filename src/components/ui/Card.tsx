import { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: "sm" | "md" | "lg";
}

const PADDING_STYLES = {
  sm: "p-3",
  md: "p-4",
  lg: "p-6",
} as const;

export default function Card({
  padding = "md",
  className = "",
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={`bg-white rounded-xl border border-zinc-200 shadow-sm ${PADDING_STYLES[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
