"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

type Item = { value: string; title: ReactNode; content: ReactNode };

export default function Accordion({
  items,
  defaultOpen,
  className,
}: {
  items: Item[];
  defaultOpen?: string[];
  className?: string;
}) {
  const [open, setOpen] = useState<Set<string>>(new Set(defaultOpen ?? []));

  const toggle = (v: string) => {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(v)) next.delete(v);
      else next.add(v);
      return next;
    });
  };

  return (
    <div className={cn("flex flex-col divide-y divide-border-soft", className)}>
      {items.map((it,i) => {
        const isOpen = open.has(it.value);
        return (
          <div key={i}>
            <button
              type="button"
              onClick={() => toggle(it.value)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between py-3 text-left text-[14px] font-semibold text-ink hover:text-brand-700"
            >
              {it.title}
              <svg
                viewBox="0 0 24 24"
                width={16}
                height={16}
                fill="none"
                stroke="currentColor"
                strokeWidth={2.2}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
                className={cn("transition-transform duration-150", isOpen && "rotate-180")}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            {isOpen ? <div className="pb-4 text-[14px] text-ink-soft">{it.content}</div> : null}
          </div>
        );
      })}
    </div>
  );
}
