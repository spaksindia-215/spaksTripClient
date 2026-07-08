"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Props = {
  active?: boolean;
  onClick?: () => void;
  leading?: ReactNode;
  trailing?: ReactNode;
  children: ReactNode;
  disabled?: boolean;
  className?: string;
};

export default function Chip({
  active,
  onClick,
  leading,
  trailing,
  children,
  disabled,
  className,
}: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 h-8 text-[13px] font-semibold transition-colors",
        "border",
        active
          ? "bg-brand-600 text-white border-brand-600 hover:bg-brand-700"
          : "bg-white text-ink-soft border-border hover:bg-surface-muted",
        disabled && "opacity-50 cursor-not-allowed",
        className,
      )}
    >
      {leading}
      {children}
      {trailing}
    </button>
  );
}
