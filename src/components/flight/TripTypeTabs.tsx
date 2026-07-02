"use client";

import { cn } from "@/lib/cn";
import type { TripType } from "@/state/flightSearchStore";

const ICON_PROPS = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

const PlaneIcon = ({ filled }: { filled: boolean }) => (
  <svg {...ICON_PROPS}>
    <path
      d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"
      fill={filled ? "currentColor" : "none"}
    />
  </svg>
);

const RoundIcon = () => (
  <svg {...ICON_PROPS}>
    <polyline points="17 1 21 5 17 9" />
    <path d="M3 11V9a4 4 0 0 1 4-4h14" />
    <polyline points="7 23 3 19 7 15" />
    <path d="M21 13v2a4 4 0 0 1-4 4H3" />
  </svg>
);

const CityIcon = () => (
  <svg {...ICON_PROPS}>
    <path d="M3 21h18" />
    <path d="M5 21V7l8-4v18" />
    <path d="M19 21V11l-6-4" />
    <line x1="9" y1="9" x2="9" y2="9.01" />
    <line x1="9" y1="12" x2="9" y2="12.01" />
    <line x1="9" y1="15" x2="9" y2="15.01" />
    <line x1="9" y1="18" x2="9" y2="18.01" />
  </svg>
);

type Item = { value: TripType; label: string; icon: (active: boolean) => React.ReactNode };

const ITEMS: Item[] = [
  { value: "ONEWAY", label: "One Way", icon: (active) => <PlaneIcon filled={active} /> },
  { value: "ROUND", label: "Round Trip", icon: () => <RoundIcon /> },
  { value: "MULTI", label: "Multi City", icon: () => <CityIcon /> },
];

export default function TripTypeTabs({
  value,
  onChange,
}: {
  value: TripType;
  onChange: (v: TripType) => void;
}) {
  return (
    <div role="tablist" className="inline-flex items-center gap-2">
      {ITEMS.map((it) => {
        const active = it.value === value;
        return (
          <button
            key={it.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(it.value)}
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-4 h-10 text-[14px] font-semibold transition-colors",
              active
                ? "bg-brand-50 text-ink shadow-[var(--shadow-xs)]"
                : "text-ink-muted hover:text-ink",
            )}
          >
            <span className={active ? "text-brand-600" : "text-ink-muted"}>
              {it.icon(active)}
            </span>
            {it.label}
          </button>
        );
      })}
    </div>
  );
}
