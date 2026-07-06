"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import type { FlightOffer } from "@/lib/mock/flights";
import { formatINR } from "@/lib/format";
import { useBookingStore } from "@/state/bookingStore";
import { useFlightSearchStore } from "@/state/flightSearchStore";

export default function FareFamilyModal({
  open,
  onClose,
  offer,
  searchParams,
}: {
  open: boolean;
  onClose: () => void;
  offer: FlightOffer;
  searchParams: string;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState(offer.fareFamilies[0].id);
  const { pax } = useFlightSearchStore();
  const { startFlightBooking } = useBookingStore();

  const family = offer.fareFamilies.find((f) => f.id === selected) ?? offer.fareFamilies[0];
  const totalPerAdult = offer.basePrice + family.priceDelta;

  const onContinue = () => {
    startFlightBooking({ offer, fareFamily: family, pax });
    router.push(`/flight/${encodeURIComponent(offer.id)}/review?${searchParams}`);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Choose your fare"
      size="lg"
      footer={
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-[12px] text-ink-muted">Selected: {family.name}</div>
            <div className="text-xl font-extrabold text-ink">
              {formatINR(totalPerAdult)}
              <span className="text-[12px] font-medium text-ink-muted ml-1">/ adult</span>
            </div>
          </div>
          <Button variant="accent" size="lg" onClick={onContinue}>
            Continue
          </Button>
        </div>
      }
    >
      <div className="grid md:grid-cols-3 gap-3">
        {offer.fareFamilies.map((f) => {
          const active = f.id === selected;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => setSelected(f.id)}
              className={
                "text-left rounded-lg border-2 p-4 transition-all " +
                (active
                  ? "border-brand-600 bg-brand-50"
                  : "border-border-soft bg-white hover:border-border-strong")
              }
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
                    {f.seatSelection === "free" ? "Premium" : "Value"}
                  </div>
                  <div className="text-[17px] font-bold text-ink">{f.name}</div>
                </div>
                {active && (
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-brand-600 text-white">
                    <svg viewBox="0 0 24 24" width={12} height={12} fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                )}
              </div>
              <div className="mt-2 text-[20px] font-extrabold text-ink">
                {formatINR(offer.basePrice + f.priceDelta)}
              </div>
              <ul className="mt-3 flex flex-col gap-1.5 text-[13px] text-ink-soft">
                <FareLine ok>Cabin baggage {f.baggageCabin} kg</FareLine>
                <FareLine ok>Check-in baggage {f.baggageCheckin} kg</FareLine>
                <FareLine ok={f.mealIncluded}>
                  {f.mealIncluded ? "Meal included" : "Meal: chargeable"}
                </FareLine>
                <FareLine ok={f.refundable}>
                  {f.refundable ? "Refundable" : "Non-refundable"}
                </FareLine>
                <FareLine ok={f.changeable}>
                  {f.changeable ? "Date change allowed" : "No date change"}
                </FareLine>
                <FareLine ok={f.seatSelection !== "none"}>
                  {f.seatSelection === "free"
                    ? "Free seat selection"
                    : f.seatSelection === "paid"
                      ? "Paid seat selection"
                      : "No seat selection"}
                </FareLine>
              </ul>
            </button>
          );
        })}
      </div>
    </Modal>
  );
}

function FareLine({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      {ok ? (
        <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden className="text-success-600 mt-0.5 shrink-0">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" aria-hidden className="text-ink-subtle mt-0.5 shrink-0">
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      )}
      <span className={ok ? "text-ink-soft" : "text-ink-subtle"}>{children}</span>
    </li>
  );
}
