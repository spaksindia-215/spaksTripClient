"use client";

import { useState, useMemo } from "react";
import type { GroupTour } from "@/lib/mock/tourPackages";
import GroupTourCard from "./GroupTourCard";

type Props = {
  groupTours: GroupTour[];
  onJoinGroup: (tour: GroupTour) => void;
};

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const PRICE_OPTIONS = [
  { label: "Any Price", min: 0, max: Infinity },
  { label: "Under ₹15,000", min: 0, max: 15000 },
  { label: "₹15,000 – ₹25,000", min: 15000, max: 25000 },
  { label: "₹25,000 – ₹40,000", min: 25000, max: 40000 },
  { label: "Above ₹40,000", min: 40000, max: Infinity },
];

const SIZE_OPTIONS = [
  { label: "Any Size", min: 0, max: Infinity },
  { label: "Small (≤ 10)", min: 0, max: 10 },
  { label: "Medium (11–20)", min: 11, max: 20 },
  { label: "Large (21+)", min: 21, max: Infinity },
];

export default function GroupTourList({ groupTours, onJoinGroup }: Props) {
  const [monthFilter, setMonthFilter] = useState<number | null>(null); // 0-indexed
  const [priceIdx, setPriceIdx] = useState(0);
  const [sizeIdx, setSizeIdx] = useState(0);

  const filtered = useMemo(() => {
    const price = PRICE_OPTIONS[priceIdx];
    const size = SIZE_OPTIONS[sizeIdx];
    return groupTours.filter((t) => {
      if (monthFilter !== null) {
        const m = new Date(t.start_date + "T00:00:00").getMonth();
        if (m !== monthFilter) return false;
      }
      if (t.price < price.min || t.price > price.max) return false;
      if (t.group_size < size.min || t.group_size > size.max) return false;
      return true;
    });
  }, [groupTours, monthFilter, priceIdx, sizeIdx]);

  // derive which months are present in the data
  const availableMonths = useMemo(() => {
    const set = new Set<number>();
    groupTours.forEach((t) => set.add(new Date(t.start_date + "T00:00:00").getMonth()));
    return Array.from(set).sort((a, b) => a - b);
  }, [groupTours]);

  return (
    <div className="mt-6 flex flex-col gap-5">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center rounded-xl border border-border-soft bg-white p-4 shadow-sm">
        <span className="text-[13px] font-semibold text-ink shrink-0">Filter:</span>

        {/* Month */}
        <select
          value={monthFilter ?? ""}
          onChange={(e) => setMonthFilter(e.target.value === "" ? null : Number(e.target.value))}
          className="rounded-lg border border-border-soft bg-surface-muted px-3 py-1.5 text-[13px] text-ink focus:outline-none focus:ring-2 focus:ring-brand-400"
        >
          <option value="">All Months</option>
          {availableMonths.map((m) => (
            <option key={m} value={m}>{MONTHS[m]}</option>
          ))}
        </select>

        {/* Price */}
        <select
          value={priceIdx}
          onChange={(e) => setPriceIdx(Number(e.target.value))}
          className="rounded-lg border border-border-soft bg-surface-muted px-3 py-1.5 text-[13px] text-ink focus:outline-none focus:ring-2 focus:ring-brand-400"
        >
          {PRICE_OPTIONS.map((p, i) => (
            <option key={p.label} value={i}>{p.label}</option>
          ))}
        </select>

        {/* Group size */}
        <select
          value={sizeIdx}
          onChange={(e) => setSizeIdx(Number(e.target.value))}
          className="rounded-lg border border-border-soft bg-surface-muted px-3 py-1.5 text-[13px] text-ink focus:outline-none focus:ring-2 focus:ring-brand-400"
        >
          {SIZE_OPTIONS.map((s, i) => (
            <option key={s.label} value={i}>{s.label}</option>
          ))}
        </select>

        <span className="ml-auto text-[12px] text-ink-soft">
          {filtered.length} tour{filtered.length !== 1 ? "s" : ""} found
        </span>
      </div>

      {/* List */}
      {filtered.length > 0 ? (
        <div className="flex flex-col gap-4">
          {filtered.map((tour) => (
            <GroupTourCard key={tour.id} tour={tour} onJoin={onJoinGroup} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border-soft bg-surface-muted flex flex-col items-center justify-center gap-3 p-10 text-center">
          <svg viewBox="0 0 24 24" width={40} height={40} fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="text-ink-muted">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          <p className="text-[14px] font-semibold text-ink-soft">No group tours match your filters.</p>
          <p className="text-[13px] text-ink-muted">Try different dates, price range, or group size.</p>
        </div>
      )}
    </div>
  );
}
