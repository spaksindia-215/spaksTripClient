"use client";

import Link from "next/link";
import Badge from "@/components/ui/Badge";
import { formatINR } from "@/lib/format";
import type { AirportTransferOffer } from "@/lib/mock/taxi";

const CANCEL_TONE: Record<string, "success" | "warn" | "danger"> = {
  "free-24h": "success",
  "partial-50": "warn",
  "no-refund": "danger",
};
const CANCEL_LABEL: Record<string, string> = {
  "free-24h": "Free cancellation 24h",
  "partial-50": "50% refund on cancel",
  "no-refund": "Non-refundable",
};

const TYPE_LABEL: Record<string, string> = {
  mini: "Mini", sedan: "Sedan", suv: "SUV", van: "Van/Traveller", luxury: "Luxury",
};

type Props = {
  offer: AirportTransferOffer;
  searchQs: string;
};

export default function AirportTransferCard({ offer, searchQs }: Props) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 rounded-xl bg-white border border-border-soft p-5 shadow-(--shadow-xs) hover:shadow-(--shadow-sm) transition-shadow">
      {/* Vehicle icon */}
      <div
        className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl"
        style={{ background: `hsl(${offer.imageHue} 60% 92%)` }}
      >
        <svg viewBox="0 0 24 24" width={34} height={34} fill="none" stroke={`hsl(${offer.imageHue} 60% 35%)`} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v10a2 2 0 0 1-2 2h-2" />
          <circle cx="7" cy="17" r="2" /><circle cx="17" cy="17" r="2" />
          <path d="M9 17H15" /><path d="M14 3v4h4" />
        </svg>
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1.5">
          <span className="text-[15px] font-bold text-ink">{offer.vehicleName}</span>
          <Badge tone="info" size="sm">{TYPE_LABEL[offer.transferType]}</Badge>
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-ink-muted mb-2">
          <span>{offer.seats} seats</span>
          <span>{offer.maxLuggage} bags max</span>
          <span>~{offer.estimatedMinutes} min ride</span>
          <span>★ {offer.driverRating} driver</span>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-2">
          {offer.features.slice(0, 4).map((f) => (
            <span key={f} className="rounded-full bg-surface-muted px-2 py-0.5 text-[11px] font-medium text-ink-muted">{f}</span>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={CANCEL_TONE[offer.cancellation]} size="sm">
            {CANCEL_LABEL[offer.cancellation]}
          </Badge>
          <span className="text-[11px] text-ink-soft">{offer.operator}</span>
        </div>
      </div>

      {/* Price + CTA */}
      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3 sm:min-w-[120px]">
        <div className="text-right">
          <p className="text-[18px] font-extrabold text-ink">{formatINR(offer.baseFare)}</p>
          <p className="text-[11px] text-ink-muted">+ GST 5%</p>
        </div>
        <Link
          href={`/taxi-package/airport-transfer/${encodeURIComponent(offer.id)}?${searchQs}`}
          className="inline-flex items-center rounded-lg bg-brand-600 px-4 py-2 text-[13px] font-bold text-white hover:bg-brand-700 transition-colors whitespace-nowrap"
        >
          Book Now
        </Link>
      </div>
    </div>
  );
}
