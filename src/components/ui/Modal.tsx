"use client";

import { useEffect, type ReactNode } from "react";
import { cn } from "@/lib/cn";

type Props = {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
};

const SIZES = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-3xl",
  xl: "max-w-5xl",
};

export default function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size = "md",
  className,
}: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 bg-ink/50 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden
      />
      <div
        className={cn(
          "relative w-full rounded-xl bg-white shadow-[var(--shadow-lg)] animate-pop-in flex flex-col max-h-[90vh]",
          SIZES[size],
          className,
        )}
      >
        {title !== undefined ? (
          <div className="flex items-center justify-between border-b border-border-soft px-5 py-4">
            <div className="text-[16px] font-semibold text-ink">{title}</div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="grid h-8 w-8 place-items-center rounded-full text-ink-muted hover:bg-surface-muted"
            >
              <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" aria-hidden>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        ) : null}
        <div className="overflow-y-auto px-5 py-4 scrollbar-thin">{children}</div>
        {footer ? (
          <div className="border-t border-border-soft px-5 py-4 bg-surface-muted rounded-b-xl">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
