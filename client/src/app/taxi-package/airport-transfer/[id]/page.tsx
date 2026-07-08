"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import Badge from "@/components/ui/Badge";
import Skeleton from "@/components/ui/Skeleton";
import { formatINR } from "@/lib/format";
import { getAirportTransfer, searchAirportOptions } from "@/services/taxi";
import { useTaxiBookingStore } from "@/state/taxiBookingStore";
import { sleep } from "@/services/delay";
import { useToast } from "@/components/ui/Toast";
import type { AirportTransferOffer, AirportTransferSearch } from "@/lib/mock/taxi";
import type { TransferAddOns, TransferPassenger } from "@/state/taxiBookingStore";

export default function AirportTransferDetailPage() {
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
        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <div className="space-y-4">
            <Skeleton className="h-56 rounded-xl" />
            <Skeleton className="h-40 rounded-xl" />
          </div>
          <Skeleton className="h-80 rounded-xl" />
        </div>
      </main>
      <Footer />
    </div>
  );
}

const CANCEL_LABEL: Record<string, string> = {
  "free-24h": "Free cancellation up to 24h before pickup",
  "partial-50": "50% refund on cancellation",
  "no-refund": "Non-refundable",
};
const CANCEL_TONE: Record<string, "success" | "warn" | "danger"> = {
  "free-24h": "success",
  "partial-50": "warn",
  "no-refund": "danger",
};

function Inner() {
  const { id } = useParams<{ id: string }>();
  const sp = useSearchParams();
  const router = useRouter();
  const { push: toast } = useToast();

  const airport = sp.get("airport") ?? "";
  const direction = (sp.get("direction") ?? "pickup") as "pickup" | "dropoff";
  const date = sp.get("date") ?? "";
  const time = sp.get("time") ?? "";
  const flightNo = sp.get("flightNo") ?? "";
  const pax = parseInt(sp.get("pax") ?? "1", 10);
  const address = sp.get("address") ?? "";

  const [offer, setOffer] = useState<AirportTransferOffer | null>(null);
  const [loading, setLoading] = useState(true);

  const [addOns, setAddOns] = useState<TransferAddOns>({ meetGreet: false, childSeat: false, flightDelayProtection: false });
  const [passenger, setPassenger] = useState<TransferPassenger>({ name: "", phone: "", email: "", address });
  const [paying, setPaying] = useState(false);

  const { startTransferBooking, setTransferAddOns, setTransferPassenger, confirmTransfer } = useTaxiBookingStore();

  const airportInfo = searchAirportOptions(airport)[0];

  useEffect(() => {
    getAirportTransfer(decodeURIComponent(id)).then((o) => {
      setOffer(o);
      setLoading(false);
    });
  }, [id]);

  function calcTotal() {
    if (!offer) return 0;
    const extra =
      (addOns.meetGreet ? offer.meetGreetFee : 0) +
      (addOns.childSeat ? offer.childSeatFee : 0) +
      (addOns.flightDelayProtection ? offer.flightDelayProtection : 0);
    const subtotal = offer.baseFare + extra;
    return subtotal + Math.round(subtotal * 0.05);
  }

  async function handleBook(e: React.FormEvent) {
    e.preventDefault();
    if (!offer) return;
    if (!passenger.name || !passenger.phone) {
      toast({ title: "Please fill in your name and phone number.", tone: "danger" });
      return;
    }

    const search: AirportTransferSearch = { airport, direction, date, time, flightNo, pax, address, luggage: 0 };
    startTransferBooking(offer, search);
    setTransferAddOns(addOns);
    setTransferPassenger(passenger);

    setPaying(true);
    await sleep(1400);
    const ref = `AT${Date.now().toString().slice(-8)}`;
    confirmTransfer(ref);
    router.push(`/taxi-package/airport-transfer/${encodeURIComponent(id)}/confirmation`);
  }

  if (loading) return <PageFallback />;
  if (!offer) return (
    <div className="min-h-screen flex flex-col bg-surface-muted">
      <Header />
      <main className="flex-1 flex items-center justify-center">
        <p className="text-ink-muted">Airport transfer booking is currently unavailable.</p>
      </main>
      <Footer />
    </div>
  );

  const TYPE_LABEL: Record<string, string> = { mini: "Mini", sedan: "Sedan", suv: "SUV", van: "Van/Traveller", luxury: "Luxury" };
  const total = calcTotal();
  const extra =
    (addOns.meetGreet ? offer.meetGreetFee : 0) +
    (addOns.childSeat ? offer.childSeatFee : 0) +
    (addOns.flightDelayProtection ? offer.flightDelayProtection : 0);
  const taxes = Math.round((offer.baseFare + extra) * 0.05);

  return (
    <div className="min-h-screen bg-surface-muted">
      <Header />

      <div className="bg-brand-900 text-white px-4 py-3">
        <div className="mx-auto max-w-5xl flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px]">
          <span className="font-extrabold text-[15px]">
            {direction === "pickup" ? `${airportInfo?.city ?? airport} Airport → Destination` : `Origin → ${airportInfo?.city ?? airport} Airport`}
          </span>
          <span className="text-white/70">{date} · {time}</span>
          {flightNo && <span className="rounded bg-white/15 px-2 py-0.5 font-semibold">{flightNo}</span>}
        </div>
      </div>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <form onSubmit={handleBook}>
          <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
            {/* Left column */}
            <div className="space-y-5">
              {/* Vehicle card */}
              <div className="rounded-xl bg-white border border-border-soft p-5">
                <div className="flex items-start gap-4">
                  <div
                    className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl"
                    style={{ background: `hsl(${offer.imageHue} 60% 92%)` }}
                  >
                    <svg viewBox="0 0 24 24" width={28} height={28} fill="none" stroke={`hsl(${offer.imageHue} 60% 35%)`} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v10a2 2 0 0 1-2 2h-2" />
                      <circle cx="7" cy="17" r="2" /><circle cx="17" cy="17" r="2" />
                      <path d="M9 17H15" /><path d="M14 3v4h4" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h1 className="text-[18px] font-bold text-ink">{offer.vehicleName}</h1>
                      <Badge tone="info" size="sm">{TYPE_LABEL[offer.transferType]}</Badge>
                    </div>
                    <p className="text-[13px] text-ink-muted mb-1">{offer.operator}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-ink-muted">
                      <span>{offer.seats} seats · {offer.maxLuggage} bags</span>
                      <span>~{offer.estimatedMinutes} min</span>
                      <span>★ {offer.driverRating} driver</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {offer.features.map((f) => (
                        <span key={f} className="rounded-full bg-surface-muted px-2 py-0.5 text-[11px] font-medium text-ink-muted">{f}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-border-soft">
                  <div className="flex items-center gap-3 text-[13px]">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-muted text-ink-muted text-[11px] font-bold">
                      {offer.driverName.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div>
                      <p className="font-semibold text-ink">{offer.driverName}</p>
                      <p className="text-[11px] text-ink-muted">{offer.driverPhone} · {offer.vehicleNumber}</p>
                    </div>
                    <Badge tone={CANCEL_TONE[offer.cancellation]} size="sm" className="ml-auto">
                      {CANCEL_LABEL[offer.cancellation]}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Add-ons */}
              <div className="rounded-xl bg-white border border-border-soft p-5">
                <h2 className="text-[15px] font-bold text-ink mb-4">Add-ons</h2>
                <div className="space-y-3">
                  {offer.meetGreetFee > 0 && (
                    <AddOnRow
                      checked={addOns.meetGreet}
                      onChange={(v) => setAddOns((a) => ({ ...a, meetGreet: v }))}
                      title="Meet & Greet"
                      desc="Driver will wait at arrival gate with name board"
                      price={offer.meetGreetFee}
                    />
                  )}
                  <AddOnRow
                    checked={addOns.childSeat}
                    onChange={(v) => setAddOns((a) => ({ ...a, childSeat: v }))}
                    title="Child Seat"
                    desc="Compliant child safety seat for ages 0–12"
                    price={offer.childSeatFee}
                  />
                  <AddOnRow
                    checked={addOns.flightDelayProtection}
                    onChange={(v) => setAddOns((a) => ({ ...a, flightDelayProtection: v }))}
                    title="Flight Delay Protection"
                    desc="No extra charge if flight is delayed (up to 4h)"
                    price={offer.flightDelayProtection}
                  />
                </div>
              </div>

              {/* Passenger details */}
              <div className="rounded-xl bg-white border border-border-soft p-5">
                <h2 className="text-[15px] font-bold text-ink mb-4">Passenger Details</h2>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-[12px] font-semibold text-ink-muted mb-1.5">Full Name *</label>
                    <input
                      required
                      value={passenger.name}
                      onChange={(e) => setPassenger((p) => ({ ...p, name: e.target.value }))}
                      placeholder="As on government ID"
                      className="w-full rounded-lg border border-border-soft px-3 py-2.5 text-[14px] text-ink focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-semibold text-ink-muted mb-1.5">Phone *</label>
                    <input
                      required
                      type="tel"
                      value={passenger.phone}
                      onChange={(e) => setPassenger((p) => ({ ...p, phone: e.target.value }))}
                      placeholder="+91 98765 43210"
                      className="w-full rounded-lg border border-border-soft px-3 py-2.5 text-[14px] text-ink focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[12px] font-semibold text-ink-muted mb-1.5">Email</label>
                    <input
                      type="email"
                      value={passenger.email}
                      onChange={(e) => setPassenger((p) => ({ ...p, email: e.target.value }))}
                      placeholder="voucher will be sent here"
                      className="w-full rounded-lg border border-border-soft px-3 py-2.5 text-[14px] text-ink focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[12px] font-semibold text-ink-muted mb-1.5">
                      {direction === "pickup" ? "Drop-off Address" : "Pickup Address"}
                    </label>
                    <input
                      value={passenger.address}
                      onChange={(e) => setPassenger((p) => ({ ...p, address: e.target.value }))}
                      placeholder="Full address…"
                      className="w-full rounded-lg border border-border-soft px-3 py-2.5 text-[14px] text-ink focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Fare summary */}
            <div className="space-y-4">
              <div className="rounded-xl bg-white border border-border-soft p-5 sticky top-24">
                <h2 className="text-[15px] font-bold text-ink mb-4">Fare Summary</h2>
                <div className="space-y-2 text-[13px]">
                  <div className="flex justify-between text-ink">
                    <span>Base fare</span>
                    <span>{formatINR(offer.baseFare)}</span>
                  </div>
                  {addOns.meetGreet && (
                    <div className="flex justify-between text-ink-muted">
                      <span>Meet & Greet</span><span>{formatINR(offer.meetGreetFee)}</span>
                    </div>
                  )}
                  {addOns.childSeat && (
                    <div className="flex justify-between text-ink-muted">
                      <span>Child Seat</span><span>{formatINR(offer.childSeatFee)}</span>
                    </div>
                  )}
                  {addOns.flightDelayProtection && (
                    <div className="flex justify-between text-ink-muted">
                      <span>Delay Protection</span><span>{formatINR(offer.flightDelayProtection)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-ink-muted">
                    <span>GST (5%)</span><span>{formatINR(taxes)}</span>
                  </div>
                  <div className="border-t border-border-soft pt-2 flex justify-between font-extrabold text-ink text-[16px]">
                    <span>Total</span><span>{formatINR(total)}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={paying}
                  className="mt-5 w-full rounded-xl bg-brand-600 py-3 text-[14px] font-bold text-white hover:bg-brand-700 disabled:opacity-60 transition-colors"
                >
                  {paying ? "Processing…" : `Pay ${formatINR(total)}`}
                </button>
                <p className="mt-2 text-center text-[11px] text-ink-soft">
                  Secure payment · Instant confirmation
                </p>
              </div>
            </div>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  );
}

function AddOnRow({
  checked, onChange, title, desc, price,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  title: string;
  desc: string;
  price: number;
}) {
  return (
    <label className="flex items-center gap-3 cursor-pointer rounded-lg border border-border-soft p-3.5 hover:border-brand-400 transition-colors">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-border-soft accent-brand-600"
      />
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-ink">{title}</p>
        <p className="text-[11px] text-ink-muted mt-0.5">{desc}</p>
      </div>
      <span className="text-[13px] font-bold text-ink shrink-0">+{formatINR(price)}</span>
    </label>
  );
}
