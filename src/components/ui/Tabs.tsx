"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type TabItem<T extends string> = {
  value: T;
  label: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
};

type Props<T extends string> = {
  value: T;
  onChange: (v: T) => void;
  items: TabItem<T>[];
  variant?: "pills" | "underline" | "segmented";
  className?: string;
};

export default function Tabs<T extends string>({
  value,
  onChange,
  items,
  variant = "pills",
  className,
}: Props<T>) {
  if (variant === "segmented") {
    return (
      <div
        role="tablist"
        className={cn(
          "inline-flex rounded-lg bg-surface-sunken p-1 gap-1",
          className,
        )}
      >
        {items.map((it) => {
          const active = it.value === value;
          return (
            <button
              key={it.value}
              role="tab"
              aria-selected={active}
              disabled={it.disabled}
              onClick={() => onChange(it.value)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md px-3 h-8 text-[13px] font-semibold transition-colors",
                active
                  ? "bg-white text-ink shadow-[var(--shadow-xs)]"
                  : "text-ink-muted hover:text-ink",
                it.disabled && "opacity-50 cursor-not-allowed",
              )}
            >
              {it.icon}
              {it.label}
            </button>
          );
        })}
      </div>
    );
  }

  if (variant === "underline") {
    return (
      <div
        role="tablist"
        className={cn("flex items-center gap-6 border-b border-border-soft", className)}
      >
        {items.map((it) => {
          const active = it.value === value;
          return (
            <button
              key={it.value}
              role="tab"
              aria-selected={active}
              disabled={it.disabled}
              onClick={() => onChange(it.value)}
              className={cn(
                "relative inline-flex items-center gap-1.5 py-3 text-[14px] font-semibold transition-colors",
                active ? "text-brand-700" : "text-ink-muted hover:text-ink",
                it.disabled && "opacity-50 cursor-not-allowed",
              )}
            >
              {it.icon}
              {it.label}
              {active && (
                <span className="absolute inset-x-0 -bottom-px h-0.5 bg-brand-600 rounded-t-full" />
              )}
            </button>
          );
        })}
      </div>
    );
  }

  // pills
  return (
    <div
      role="tablist"
      className={cn("inline-flex items-center gap-2 flex-wrap", className)}
    >
      {items.map((it) => {
        const active = it.value === value;
        return (
          <button
            key={it.value}
            role="tab"
            aria-selected={active}
            disabled={it.disabled}
            onClick={() => onChange(it.value)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3.5 h-8 text-[13px] font-semibold transition-colors border",
              active
                ? "bg-brand-600 text-white border-brand-600"
                : "bg-white text-ink-soft border-border hover:bg-surface-muted",
              it.disabled && "opacity-50 cursor-not-allowed",
            )}
          >
            {it.icon}
            {it.label}
          </button>
        );
      })}
    </div>
  );
}
