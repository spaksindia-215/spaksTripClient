import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Tone = "neutral" | "brand" | "accent" | "success" | "warn" | "danger" | "info";
type Size = "sm" | "md";

const TONES: Record<Tone, string> = {
  neutral: "bg-surface-sunken text-ink-soft",
  brand:   "bg-brand-50 text-brand-700",
  accent:  "bg-accent-50 text-accent-700",
  success: "bg-success-50 text-success-700",
  warn:    "bg-warn-50 text-warn-600",
  danger:  "bg-danger-50 text-danger-600",
  info:    "bg-info-50 text-info-500",
};

const SIZES: Record<Size, string> = {
  sm: "px-2 py-0.5 text-[11px]",
  md: "px-2.5 py-1 text-[12px]",
};

export default function Badge({
  tone = "neutral",
  size = "md",
  children,
  className,
}: {
  tone?: Tone;
  size?: Size;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-semibold",
        TONES[tone],
        SIZES[size],
        className,
      )}
    >
      {children}
    </span>
  );
}
