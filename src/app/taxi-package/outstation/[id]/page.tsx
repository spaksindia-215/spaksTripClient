"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import Badge from "@/components/ui/Badge";
import Skeleton from "@/components/ui/Skeleton";
import { formatINR } from "@/lib/format";
import { getOutstationOffer, searchCityOptions } from "@/services/taxi";
import { useTaxiBookingStore } from "@/state/taxiBookingStore";
import { sleep } from "@/services/delay";
import { useToast } from "@/components/ui/Toast";
import type { OutstationOffer, OutstationSearch, TripType } from "@/lib/mock/taxi";
import type { OutstationPassenger } from "@/state/taxiBookingStore";

export default function OutstationDetailPage() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Inner />
    </Suspense>
  );
}

function PageFallback() {
  return (
    <div className="min-h-screen flex flex-col bg-surface-muted">
      <Header />
      <main className="flex-1 max-w-5xl mx-auto w-full p-6">
        <Skeleton className="h-10 w-64 mb-6 rounded-lg" />
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-4">
            <Skeleton className="h-56 rounded-xl" />
            <Skeleton className="h-40 rounded-xl" />
          </div>
          <Skeleton className="h-72 rounded-xl" />
        </div>
      </main>
      <Footer />
    </div>
  );
}

const CANCEL_LABEL: Record<string, string> = {
  "free-24h": "Free cancellation (24h)",
  "partial-50": "50% refund on cancel",
  "no-refund": "Non-refundable",
};
const CANCEL_TONE: Record<string, "success" | "warn" | "danger"> = {
  "free-24h": "success", "partial-50": "warn", "no-refund": "danger",
};

function Inner() {
  const { id } = useParams<{ id: string }>();
  const sp = useSearchParams();
  const router = useRouter();
  const { push: toast } = useToast();

  const fromCity = sp.get("from") ?? "";
  const toCity = sp.get("to") ?? "";
  const date = sp.get("date") ?? "";
  const tripType = (sp.get("tripType") ?? "one-way") as TripType;
  const pax = parseInt(sp.get("pax") ?? "1", 10);
  const returnDate = sp.get("returnDate") ?? undefined;

  const [offer, setOffer] = useState<OutstationOffer | null>(null);
  const [loading, setLoading] = useState(true);
  const [passenger, setPassenger] = useState<OutstationPassenger>({ name: "", phone: "", email: "", pickupAddress: "" });
  const [paying, setPaying] = useState(false);

  const { startOutstationBooking, setOutstationPassenger, confirmOutstation } = useTaxiBookingStore();

  const fromInfo = searchCityOptions(fromCity)[0];
  const toInfo = searchCityOptions(toCity)[0];

  useEffect(() => {
    getOutstationOffer(decodeURIComponent(id)).then((o) => {
      setOffer(o);
      setLoading(false);
    });
  }, [id]);

  async function handleBook(e: React.FormEvent) {
    e.preventDefault();
    if (!offer) return;
    if (!passenger.name || !passenger.phone) {
      toast({ title: "Please fill in your name and phone number.", tone: "danger" });
      return;
    }
    const search: OutstationSearch = { fromCity, toCity, date, tripType, pax, returnDate };
    startOutstationBooking(offer, search);
    setOutstationPassenger(passenger);

    setPaying(true);
    await sleep(1400);
    const ref = `OS-${date.replaceAll("-", "").slice(-6)}-${id.replace(/[^a-z0-9]/gi, "").slice(0, 4).toUpperCase()}`;
    confirmOutstation(ref);
    router.push(`/taxi-package/outstation/${encodeURIComponent(id)}/confirmation`);
  }

  if (loading) return <PageFallback />;
  if (!offer) return (
    <div className="min-h-screen flex flex-col bg-surface-muted">
      <Header />
      <main className="flex-1 flex items-center justify-center">
        <p className="text-ink-muted">Outstation cab booking is currently unavailable.</p>
      </main>
      <Footer />
    </div>
  );

  const TYPE_LABEL: Record<string, string> = { mini: "Mini", sedan: "Sedan", suv: "SUV", traveller: "Traveller" };
  const taxes = Math.round(offer.estimatedFare * 0.05);
  const total = offer.estimatedFare + taxes;

  return (
    <div className="min-h-screen bg-surface-muted">
      <Header />

      <div className="bg-brand-900 text-white px-4 py-3">
        <div className="mx-auto max-w-5xl flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px]">
          <span className="font-extrabold text-[15px]">{fromInfo?.name ?? fromCity} → {toInfo?.name ?? toCity}</span>
          <span className="text-white/70">{date}</span>
          <span className="rounded bg-white/15 px-2 py-0.5 font-semibold capitalize">{tripType.replace("-", " ")}</span>
          <span className="rounded bg-white/10 px-2 py-0.5 text-white/80">{pax} pax</span>
        </div>
      </div>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <form onSubmit={handleBook}>
          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            {/* Left */}
            <div className="space-y-5">
              {/* Vehicle details */}
              <div className="rounded-xl bg-white border border-border-soft p-5">
                <div className="flex items-start gap-4 mb-4">
                  <div
                    className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl"
                    style={{ background: `hsl(${offer.imageHue} 55% 92%)` }}
                  >
                    <svg viewBox="0 0 24 24" width={28} height={28} fill="none" stroke={`hsl(${offer.imageHue} 55% 35%)`} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M1 3h15l2 9H2z" /><path d="M1 12h17v4H1z" />
                      <circle cx="5.5" cy="17.5" r="1.5" /><circle cx="14.5" cy="17.5" r="1.5" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h1 className="text-[18px] font-bold text-ink">{offer.vehicleName}</h1>
                      <Badge tone="info" size="sm">{TYPE_LABEL[offer.vehicleType]}</Badge>
                    </div>
                    <p className="text-[13px] text-ink-muted mb-2">{offer.operator} · ★ {offer.rating} ({offer.ratingCount})</p>
                    <div className="flex flex-wrap gap-1.5">
                      {offer.features.map((f) => (
                        <span key={f} className="rounded-full bg-surface-muted px-2 py-0.5 text-[11px] font-medium text-ink-muted">{f}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[12px] pt-4 border-t border-border-soft">
                  <div className="rounded-lg bg-surface-muted p-3 text-center">
                    <p className="font-extrabold text-ink text-[16px]">{offer.estimatedDistanceKm} km</p>
                    <p className="text-ink-muted mt-0.5">Distance</p>
                  </div>
                  <div className="rounded-lg bg-surface-muted p-3 text-center">
                    <p className="font-extrabold text-ink text-[16px]">{offer.estimatedTime}</p>
                    <p className="text-ink-muted mt-0.5">Est. time</p>
                  </div>
                  <div className="rounded-lg bg-surface-muted p-3 text-center">
                    <p className="font-extrabold text-ink text-[16px]">₹{offer.perKmRate}/km</p>
                    <p className="text-ink-muted mt-0.5">After {offer.includedKm} km</p>
                  </div>
                  <div className="rounded-lg bg-surface-muted p-3 text-center">
                    <p className="font-extrabold text-ink text-[16px]">{offer.seats} seats</p>
                    <p className="text-ink-muted mt-0.5">Capacity</p>
                  </div>
                </div>
              </div>

              {/* Inclusions / Exclusions */}
              <div className="rounded-xl bg-white border border-border-soft p-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-[13px] font-bold text-ink mb-2">Inclusions</h3>
                    <ul className="space-y-1.5">
                      {offer.inclusions.map((item) => (
                        <li key={item} className="flex items-center gap-1.5 text-[12px] text-ink-muted">
                          <svg viewBox="0 0 24 24" width={12} height={12} fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500 shrink-0" aria-hidden><polyline points="20 6 9 17 4 12" /></svg>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-[13px] font-bold text-ink mb-2">Exclusions</h3>
                    <ul className="space-y-1.5">
                      {offer.exclusions.map((item) => (
                        <li key={item} className="flex items-center gap-1.5 text-[12px] text-ink-muted">
                          <svg viewBox="0 0 24 24" width={12} height={12} fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="text-red-400 shrink-0" aria-hidden><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Passenger details */}
              <div className="rounded-xl bg-white border border-border-soft p-5">
                <h2 className="text-[15px] font-bold text-ink mb-4">Passenger Details</h2>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-[12px] font-semibold text-ink-muted mb-1.5">Full Name *</label>
                    <input required value={passenger.name} onChange={(e) => setPassenger((p) => ({ ...p, name: e.target.value }))}
                      placeholder="Primary traveler name"
                      className="w-full rounded-lg border border-border-soft px-3 py-2.5 text-[14px] text-ink focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200" />
                  </div>
                  <div>
                    <label className="block text-[12px] font-semibold text-ink-muted mb-1.5">Phone *</label>
                    <input required type="tel" value={passenger.phone} onChange={(e) => setPassenger((p) => ({ ...p, phone: e.target.value }))}
                      placeholder="+91 98765 43210"
                      className="w-full rounded-lg border border-border-soft px-3 py-2.5 text-[14px] text-ink focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200" />
                  </div>
                  <div>
                    <label className="block text-[12px] font-semibold text-ink-muted mb-1.5">Email</label>
                    <input type="email" value={passenger.email} onChange={(e) => setPassenger((p) => ({ ...p, email: e.target.value }))}
                      placeholder="for voucher delivery"
                      className="w-full rounded-lg border border-border-soft px-3 py-2.5 text-[14px] text-ink focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200" />
                  </div>
                  <div>
                    <label className="block text-[12px] font-semibold text-ink-muted mb-1.5">Pickup Address</label>
                    <input value={passenger.pickupAddress} onChange={(e) => setPassenger((p) => ({ ...p, pickupAddress: e.target.value }))}
                      placeholder="Hotel name or full address"
                      className="w-full rounded-lg border border-border-soft px-3 py-2.5 text-[14px] text-ink focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200" />
                  </div>
                </div>
              </div>
            </div>

            {/* Fare summary */}
            <div>
              <div className="rounded-xl bg-white border border-border-soft p-5 sticky top-24">
                <h2 className="text-[15px] font-bold text-ink mb-4">Fare Breakdown</h2>
                <div className="space-y-2 text-[13px]">
                  <div className="flex justify-between text-ink">
                    <span>Base fare ({tripType.replace("-", " ")})</span>
                    <span>{formatINR(offer.baseFare)}</span>
                  </div>
                  <div className="flex justify-between text-ink-muted">
                    <span>Toll charges</span><span>~{formatINR(offer.tollCharges)}</span>
                  </div>
                  {offer.nightCharges > 0 && (
                    <div className="flex justify-between text-ink-muted">
                      <span>Night charges</span><span>{formatINR(offer.nightCharges)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-ink-muted">
                    <span>Driver allowance</span><span>{formatINR(offer.driverAllowance)}</span>
                  </div>
                  <div className="flex justify-between text-ink-muted">
                    <span>GST (5%)</span><span>{formatINR(taxes)}</span>
                  </div>
                  <div className="border-t border-border-soft pt-2 flex justify-between font-extrabold text-ink text-[16px]">
                    <span>Total</span><span>{formatINR(total)}</span>
                  </div>
                </div>

                <div className="mt-3 text-[11px] text-ink-soft">
                  <Badge tone={CANCEL_TONE[offer.cancellation]} size="sm">{CANCEL_LABEL[offer.cancellation]}</Badge>
                </div>

                <button type="submit" disabled={paying}
                  className="mt-5 w-full rounded-xl bg-brand-600 py-3 text-[14px] font-bold text-white hover:bg-brand-700 disabled:opacity-60 transition-colors">
                  {paying ? "Processing…" : `Pay ${formatINR(total)}`}
                </button>
                <p className="mt-2 text-center text-[11px] text-ink-soft">Secure payment · Instant confirmation</p>
              </div>
            </div>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  );
}
