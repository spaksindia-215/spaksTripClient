"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import Badge from "@/components/ui/Badge";
import { formatINR } from "@/lib/format";
import { useTaxiBookingStore } from "@/state/taxiBookingStore";

export default function SightseeingConfirmationPage() {
  const booking = useTaxiBookingStore((s) => s.currentSightseeing);
  const router = useRouter();

  useEffect(() => {
    if (!booking || booking.status !== "CONFIRMED") router.replace("/taxi-package");
  }, [booking, router]);

  if (!booking || booking.status !== "CONFIRMED") return null;

  const { pkg, search, travelers, contact, addOns, totalPrice, bookingReference } = booking;
  const DURATION_LABEL: Record<string, string> = { "half-day": "Half Day", "full-day": "Full Day", "multi-day": "Multi-Day" };

  return (
    <div className="min-h-screen bg-surface-muted">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-6 text-center mb-6">
          <div className="flex items-center justify-center mb-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500">
              <svg viewBox="0 0 24 24" width={22} height={22} fill="none" stroke="white" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden><polyline points="20 6 9 17 4 12" /></svg>
            </div>
          </div>
          <h1 className="text-[22px] font-extrabold text-emerald-800 mb-1">Tour Booked!</h1>
          <p className="text-[13px] text-emerald-700">Your sightseeing tour has been confirmed.</p>
          <p className="mt-2 font-mono text-[20px] font-extrabold text-emerald-900 tracking-wider">{bookingReference}</p>
        </div>

        {/* Tour details */}
        <div className="rounded-xl bg-white border border-border-soft overflow-hidden mb-4">
          <div className="relative h-40">
            <img src={pkg.imageUrl} alt={pkg.title} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-0 left-0 p-4">
              <p className="text-[17px] font-extrabold text-white">{pkg.title}</p>
              <p className="text-[12px] text-white/80">{DURATION_LABEL[pkg.durationType]} · {pkg.durationHours}h · {pkg.city}</p>
            </div>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-[13px]">
              <div><p className="text-ink-muted">Date</p><p className="font-semibold text-ink">{search.date}</p></div>
              <div><p className="text-ink-muted">Travelers</p><p className="font-semibold text-ink">{search.pax}</p></div>
              <div><p className="text-ink-muted">Vehicle</p><p className="font-semibold text-ink">{pkg.vehicleType}</p></div>
              <div><p className="text-ink-muted">Guide</p><p className="font-semibold text-ink">{pkg.guideIncluded || addOns.privateGuide ? "Included" : "Not included"}</p></div>
            </div>

            <div className="mt-4 pt-4 border-t border-border-soft">
              <p className="text-[12px] font-semibold text-ink-muted mb-2">Stops</p>
              <p className="text-[12px] text-ink">{pkg.stops.join(" → ")}</p>
            </div>
          </div>
        </div>

        {/* Travelers */}
        <div className="rounded-xl bg-white border border-border-soft p-5 mb-4">
          <h2 className="text-[15px] font-bold text-ink mb-3">Travelers</h2>
          <div className="space-y-1">
            {travelers.map((t, i) => (
              <div key={i} className="flex items-center gap-2 text-[13px]">
                <span className="text-ink-muted w-20">Traveler {i + 1}</span>
                <span className="font-semibold text-ink">{t.name || "—"}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-border-soft grid grid-cols-2 gap-x-6 gap-y-2 text-[13px]">
            <div><p className="text-ink-muted">Contact</p><p className="font-semibold text-ink">{contact.name}</p></div>
            <div><p className="text-ink-muted">Phone</p><p className="font-semibold text-ink">{contact.phone}</p></div>
          </div>
        </div>

        <div className="rounded-xl bg-white border border-border-soft p-5 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-[15px] font-bold text-ink">Amount Paid</span>
            <span className="text-[20px] font-extrabold text-ink">{formatINR(totalPrice)}</span>
          </div>
          {addOns.privateGuide && (
            <div className="mt-2"><Badge tone="success" size="sm">Private guide included</Badge></div>
          )}
        </div>

        <div className="rounded-xl bg-brand-50 border border-brand-100 p-5 mb-8">
          <h3 className="text-[14px] font-bold text-brand-800 mb-3">What&apos;s Next</h3>
          <ul className="space-y-2 text-[13px] text-brand-700">
            <li className="flex items-start gap-2"><span className="text-brand-500 font-bold shrink-0">1.</span>Your guide will reach the hotel lobby by {pkg.itinerary[0]?.time ?? "07:00"} on tour day.</li>
            <li className="flex items-start gap-2"><span className="text-brand-500 font-bold shrink-0">2.</span>Carry a printed/digital copy of this booking reference: <strong>{bookingReference}</strong>.</li>
            <li className="flex items-start gap-2"><span className="text-brand-500 font-bold shrink-0">3.</span>Entry tickets to monuments are not included — carry sufficient cash.</li>
          </ul>
        </div>

        <div className="flex gap-3">
          <Link href="/my-trips" className="flex-1 text-center rounded-xl bg-brand-600 py-3 text-[14px] font-bold text-white hover:bg-brand-700 transition-colors">View My Trips</Link>
          <Link href="/taxi-package" className="flex-1 text-center rounded-xl bg-white border border-border-soft py-3 text-[14px] font-semibold text-ink hover:bg-surface-muted transition-colors">Book Another</Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
