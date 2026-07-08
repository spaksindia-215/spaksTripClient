"use client";

import Link from "next/link";
import Badge from "@/components/ui/Badge";
import { formatINR } from "@/lib/format";
import type { OutstationOffer } from "@/lib/mock/taxi";

const CANCEL_TONE: Record<string, "success" | "warn" | "danger"> = {
  "free-24h": "success",
  "partial-50": "warn",
  "no-refund": "danger",
};
const CANCEL_LABEL: Record<string, string> = {
  "free-24h": "Free cancellation",
  "partial-50": "50% refund",
  "no-refund": "Non-refundable",
};
const TYPE_LABEL: Record<string, string> = {
  mini: "Mini", sedan: "Sedan", suv: "SUV", traveller: "Traveller",
};

type Props = {
  offer: OutstationOffer;
  searchQs: string;
};

export default function OutstationCard({ offer, searchQs }: Props) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 rounded-xl bg-white border border-border-soft p-5 shadow-(--shadow-xs) hover:shadow-(--shadow-sm) transition-shadow">
      {/* Vehicle icon */}
      <div
        className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl"
        style={{ background: `hsl(${offer.imageHue} 55% 92%)` }}
      >
        <svg viewBox="0 0 24 24" width={34} height={34} fill="none" stroke={`hsl(${offer.imageHue} 55% 35%)`} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M1 3h15l2 9H2z" /><path d="M1 12h17v4H1z" />
          <circle cx="5.5" cy="17.5" r="1.5" /><circle cx="14.5" cy="17.5" r="1.5" />
        </svg>
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1.5">
          <span className="text-[15px] font-bold text-ink">{offer.vehicleName}</span>
          <Badge tone="info" size="sm">{TYPE_LABEL[offer.vehicleType]}</Badge>
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-ink-muted mb-2">
          <span>{offer.seats} seats</span>
          <span>~{offer.estimatedDistanceKm} km</span>
          <span>{offer.estimatedTime}</span>
          <span>★ {offer.rating} ({offer.ratingCount})</span>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-2">
          {offer.features.map((f) => (
            <span key={f} className="rounded-full bg-surface-muted px-2 py-0.5 text-[11px] font-medium text-ink-muted">{f}</span>
          ))}
        </div>

        {/* Fare breakdown */}
        <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-[11px] text-ink-soft">
          <span>₹{offer.perKmRate}/km after {offer.includedKm} km</span>
          <span>Toll: ~{formatINR(offer.tollCharges)}</span>
          {offer.nightCharges > 0 && <span>Night: {formatINR(offer.nightCharges)}</span>}
          <span>Driver allow: {formatINR(offer.driverAllowance)}</span>
        </div>
      </div>

      {/* Price + CTA */}
      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3 sm:min-w-[130px]">
        <div className="text-right">
          <p className="text-[18px] font-extrabold text-ink">{formatINR(offer.estimatedFare)}</p>
          <p className="text-[11px] text-ink-muted">Estimated total</p>
          <Badge tone={CANCEL_TONE[offer.cancellation]} size="sm" className="mt-1">
            {CANCEL_LABEL[offer.cancellation]}
          </Badge>
        </div>
        <Link
          href={`/taxi-package/outstation/${encodeURIComponent(offer.id)}?${searchQs}`}
          className="inline-flex items-center rounded-lg bg-brand-600 px-4 py-2 text-[13px] font-bold text-white hover:bg-brand-700 transition-colors whitespace-nowrap"
        >
          Book Now
        </Link>
      </div>
    </div>
  );
}
