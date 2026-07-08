"use client";

import { cloneElement, useState, type ReactElement } from "react";
import { cn } from "@/lib/cn";

type Props = {
  content: string;
  children: ReactElement<Record<string, unknown>>;
  side?: "top" | "bottom";
  className?: string;
};

export default function Tooltip({ content, children, side = "top", className }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-flex">
      {cloneElement(children, {
        onMouseEnter: () => setOpen(true),
        onMouseLeave: () => setOpen(false),
        onFocus: () => setOpen(true),
        onBlur: () => setOpen(false),
      })}
      {open && (
        <span
          role="tooltip"
          className={cn(
            "pointer-events-none absolute left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-md bg-ink text-white text-[12px] font-medium px-2 py-1 shadow-[var(--shadow-sm)] animate-fade-in",
            side === "top" ? "bottom-full mb-1.5" : "top-full mt-1.5",
            className,
          )}
        >
          {content}
        </span>
      )}
    </span>
  );
}
