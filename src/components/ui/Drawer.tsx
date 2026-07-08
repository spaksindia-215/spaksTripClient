"use client";

import { useEffect, type ReactNode } from "react";
import { cn } from "@/lib/cn";

type Props = {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  side?: "right" | "left" | "bottom";
  width?: string;
  footer?: ReactNode;
};

export default function Drawer({
  open,
  onClose,
  title,
  children,
  side = "right",
  width = "420px",
  footer,
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

  const isHorizontal = side === "right" || side === "left";
  const positioning =
    side === "right"
      ? "right-0 top-0 h-full animate-slide-up [animation-name:none]"
      : side === "left"
        ? "left-0 top-0 h-full"
        : "left-0 right-0 bottom-0 max-h-[80vh] animate-slide-up";

  return (
    <div className="fixed inset-0 z-[100] animate-fade-in" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-ink/50" onClick={onClose} aria-hidden />
      <div
        className={cn(
          "absolute bg-white shadow-[var(--shadow-lg)] flex flex-col",
          positioning,
        )}
        style={isHorizontal ? { width } : undefined}
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
        <div className="flex-1 overflow-y-auto scrollbar-thin">{children}</div>
        {footer ? <div className="border-t border-border-soft p-4">{footer}</div> : null}
      </div>
    </div>
  );
}
