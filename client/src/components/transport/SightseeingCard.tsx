"use client";

import Link from "next/link";
import Badge from "@/components/ui/Badge";
import { formatINR } from "@/lib/format";
import type { SightseeingPackage } from "@/lib/mock/taxi";

const THEME_COLORS: Record<string, string> = {
  heritage: "bg-amber-50 text-amber-700",
  nature: "bg-emerald-50 text-emerald-700",
  adventure: "bg-orange-50 text-orange-700",
  religious: "bg-purple-50 text-purple-700",
  food: "bg-red-50 text-red-700",
  culture: "bg-blue-50 text-blue-700",
  shopping: "bg-pink-50 text-pink-700",
};

const DURATION_LABEL: Record<string, string> = {
  "half-day": "Half Day",
  "full-day": "Full Day",
  "multi-day": "Multi-Day",
};

type Props = {
  pkg: SightseeingPackage;
  pax: number;
  searchQs: string;
};

export default function SightseeingCard({ pkg, pax, searchQs }: Props) {
  return (
    <div className="overflow-hidden rounded-xl bg-white border border-border-soft shadow-(--shadow-xs) hover:shadow-(--shadow-sm) transition-shadow flex flex-col sm:flex-row">
      {/* Image */}
      <div className="relative h-44 sm:h-auto sm:w-48 shrink-0 overflow-hidden">
        <img
          src={pkg.imageUrl}
          alt={pkg.title}
          className="h-full w-full object-cover"
          loading="lazy"
        />
        <div className="absolute top-2 left-2">
          <span className="rounded-full bg-black/60 px-2 py-0.5 text-[11px] font-semibold text-white">
            {DURATION_LABEL[pkg.durationType]} · {pkg.durationHours}h
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
          <div>
            <h3 className="text-[15px] font-bold text-ink">{pkg.title}</h3>
            <p className="text-[12px] text-ink-muted mt-0.5">{pkg.city} · {pkg.vehicleType}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[17px] font-extrabold text-ink">{formatINR(pkg.pricePerPerson * pax)}</p>
            <p className="text-[11px] text-ink-muted">{formatINR(pkg.pricePerPerson)}/person</p>
          </div>
        </div>

        {/* Themes */}
        <div className="flex flex-wrap gap-1.5 mb-2">
          {pkg.themes.map((t) => (
            <span key={t} className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${THEME_COLORS[t] ?? "bg-surface-muted text-ink-muted"}`}>
              {t}
            </span>
          ))}
        </div>

        {/* Stops */}
        <p className="text-[12px] text-ink-muted mb-2 line-clamp-1">
          📍 {pkg.stops.slice(0, 4).join(" → ")}{pkg.stops.length > 4 ? " →…" : ""}
        </p>

        {/* Highlights */}
        <ul className="mb-3 space-y-0.5">
          {pkg.highlights.slice(0, 2).map((h) => (
            <li key={h} className="flex items-center gap-1.5 text-[12px] text-ink-muted">
              <svg viewBox="0 0 24 24" width={12} height={12} fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="text-brand-500 shrink-0" aria-hidden>
                <polyline points="20 6 9 17 4 12" />
              </svg>
              {h}
            </li>
          ))}
        </ul>

        <div className="flex items-center justify-between gap-3 mt-auto">
          <div className="flex items-center gap-1.5 text-[12px] text-ink-muted">
            <span className="text-amber-500">★</span>
            <span className="font-semibold text-ink">{pkg.rating}</span>
            <span>({pkg.ratingCount})</span>
            {pkg.guideIncluded && <span className="ml-1 text-emerald-600 font-medium">· Guide incl.</span>}
          </div>
          <Link
            href={`/taxi-package/sightseeing/${encodeURIComponent(pkg.id)}?${searchQs}&pax=${pax}`}
            className="inline-flex items-center rounded-lg bg-brand-600 px-4 py-2 text-[13px] font-bold text-white hover:bg-brand-700 transition-colors"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}
