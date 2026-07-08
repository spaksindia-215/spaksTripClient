"use client";

import { formatINR } from "@/lib/format";
import type { HotelSortBy } from "@/services/hotels";
import type { Hotel } from "@/lib/mock/hotels";

type Props = {
  value: HotelSortBy;
  onChange: (v: HotelSortBy) => void;
  hotels: Hotel[];
  total: number;
};

export default function HotelSortBar({ value, onChange, hotels, total }: Props) {
  const minPrice = hotels.length ? Math.min(...hotels.map((h) => h.lowestPrice)) : 0;
  const maxRating = hotels.length ? Math.max(...hotels.map((h) => h.reviewScore)) : 0;

  const OPTIONS: Array<{ v: HotelSortBy; label: string; stat?: string }> = [
    { v: "price", label: "Cheapest", stat: minPrice ? `from ${formatINR(minPrice)}` : undefined },
    { v: "rating", label: "Top Rated", stat: maxRating ? `up to ${maxRating.toFixed(1)}★` : undefined },
    { v: "stars", label: "Stars (high→low)" },
    { v: "popularity", label: "Most Reviewed" },
  ];

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white border border-border-soft px-4 py-3 shadow-(--shadow-xs)">
      <p className="text-[13px] text-ink-muted">
        <span className="font-bold text-ink">{total}</span> properties found
      </p>
      <div className="flex flex-wrap gap-1.5">
        {OPTIONS.map((o) => (
          <button
            key={o.v}
            type="button"
            onClick={() => onChange(o.v)}
            className={
              "rounded-lg px-3 py-1.5 text-[13px] font-semibold transition-colors " +
              (o.v === value
                ? "bg-brand-600 text-white"
                : "bg-surface-muted text-ink-soft hover:bg-surface-sunken")
            }
          >
            {o.label}
            {o.stat && (
              <span className={`ml-1 text-[11px] ${o.v === value ? "text-white/80" : "text-ink-muted"}`}>
                · {o.stat}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
