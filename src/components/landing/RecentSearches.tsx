"use client";

import Link from "next/link";
import { useFlightSearchStore } from "@/state/flightSearchStore";

export default function RecentSearches() {
  const recent = useFlightSearchStore((s) => s.recent);

  if (recent.length === 0) return null;

  const remove = (id: string) => {
    useFlightSearchStore.setState((s) => ({
      recent: s.recent.filter((r) => r.id !== id),
    }));
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4">
      <p className="text-[12px] font-semibold text-ink-muted mb-2 uppercase tracking-wide">Recent Searches</p>
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {recent.map((r) => (
          <div
            key={r.id}
            className="flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-white pl-3.5 pr-2 py-1.5 text-[12px] font-semibold text-ink shadow-(--shadow-xs) hover:border-brand-400 transition-colors"
          >
            <Link
              href={`/flight/results?from=${r.from}&to=${r.to}&depart=${r.date}`}
              className="flex items-center gap-1.5 hover:text-brand-700"
            >
              <svg viewBox="0 0 24 24" width={12} height={12} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden className="text-ink-muted">
                <path d="M17.8 19.2L16 11l3.5-3.5C21 6 21 4 19.5 2.5S18 2 16.5 3.5L13 7 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
              </svg>
              {r.from} → {r.to}
              <span className="text-ink-muted font-normal">· {r.date}</span>
            </Link>
            <button
              type="button"
              onClick={() => remove(r.id)}
              aria-label={`Remove ${r.label}`}
              className="ml-0.5 grid h-4 w-4 place-items-center rounded-full text-ink-muted hover:bg-surface-sunken hover:text-ink transition-colors"
            >
              <svg viewBox="0 0 24 24" width={10} height={10} fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" aria-hidden>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
