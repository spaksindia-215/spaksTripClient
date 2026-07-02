"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import Badge from "@/components/ui/Badge";
import { formatINR } from "@/lib/format";
import { useTaxiBookingStore } from "@/state/taxiBookingStore";

export default function AirportTransferConfirmationPage() {
  const booking = useTaxiBookingStore((s) => s.currentTransfer);
  const router = useRouter();

  useEffect(() => {
    if (!booking || booking.status !== "CONFIRMED") router.replace("/taxi-package");
  }, [booking, router]);

  if (!booking || booking.status !== "CONFIRMED") return null;

  const { offer, search, addOns, passenger, totalPrice, bookingReference } = booking;
  const airportDisplay = search.airport;

  return (
    <div className="min-h-screen bg-surface-muted">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        {/* Success banner */}
        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-6 text-center mb-6">
          <div className="flex items-center justify-center mb-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500">
              <svg viewBox="0 0 24 24" width={22} height={22} fill="none" stroke="white" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          </div>
          <h1 className="text-[22px] font-extrabold text-emerald-800 mb-1">Booking Confirmed!</h1>
          <p className="text-[13px] text-emerald-700">Your airport transfer has been successfully booked.</p>
          <p className="mt-2 font-mono text-[20px] font-extrabold text-emerald-900 tracking-wider">{bookingReference}</p>
        </div>

        {/* Booking details */}
        <div className="rounded-xl bg-white border border-border-soft p-5 mb-4">
          <h2 className="text-[15px] font-bold text-ink mb-4">Transfer Details</h2>
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-[13px]">
            <div>
              <p className="text-ink-muted">Airport</p>
              <p className="font-semibold text-ink">{airportDisplay}</p>
            </div>
            <div>
              <p className="text-ink-muted">Direction</p>
              <p className="font-semibold text-ink capitalize">{search.direction === "pickup" ? "Airport → Destination" : "Origin → Airport"}</p>
            </div>
            <div>
              <p className="text-ink-muted">Date & Time</p>
              <p className="font-semibold text-ink">{search.date} · {search.time}</p>
            </div>
            {search.flightNo && (
              <div>
                <p className="text-ink-muted">Flight</p>
                <p className="font-semibold text-ink">{search.flightNo}</p>
              </div>
            )}
            <div>
              <p className="text-ink-muted">Vehicle</p>
              <p className="font-semibold text-ink">{offer.vehicleName}</p>
            </div>
            <div>
              <p className="text-ink-muted">Driver</p>
              <p className="font-semibold text-ink">{offer.driverName} · {offer.driverPhone}</p>
            </div>
            <div>
              <p className="text-ink-muted">Vehicle No.</p>
              <p className="font-semibold text-ink font-mono">{offer.vehicleNumber}</p>
            </div>
            <div>
              <p className="text-ink-muted">Passengers</p>
              <p className="font-semibold text-ink">{search.pax}</p>
            </div>
          </div>

          {(addOns.meetGreet || addOns.childSeat || addOns.flightDelayProtection) && (
            <div className="mt-4 pt-4 border-t border-border-soft">
              <p className="text-[12px] font-semibold text-ink-muted mb-2">Add-ons included</p>
              <div className="flex flex-wrap gap-1.5">
                {addOns.meetGreet && <Badge tone="info" size="sm">Meet &amp; Greet</Badge>}
                {addOns.childSeat && <Badge tone="info" size="sm">Child Seat</Badge>}
                {addOns.flightDelayProtection && <Badge tone="success" size="sm">Delay Protection</Badge>}
              </div>
            </div>
          )}
        </div>

        {/* Passenger */}
        <div className="rounded-xl bg-white border border-border-soft p-5 mb-4">
          <h2 className="text-[15px] font-bold text-ink mb-3">Passenger</h2>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-[13px]">
            <div><p className="text-ink-muted">Name</p><p className="font-semibold text-ink">{passenger.name || "—"}</p></div>
            <div><p className="text-ink-muted">Phone</p><p className="font-semibold text-ink">{passenger.phone || "—"}</p></div>
            {passenger.address && <div className="col-span-2"><p className="text-ink-muted">Address</p><p className="font-semibold text-ink">{passenger.address}</p></div>}
          </div>
        </div>

        {/* Total */}
        <div className="rounded-xl bg-white border border-border-soft p-5 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-[15px] font-bold text-ink">Amount Paid</span>
            <span className="text-[20px] font-extrabold text-ink">{formatINR(totalPrice)}</span>
          </div>
        </div>

        {/* What's next */}
        <div className="rounded-xl bg-brand-50 border border-brand-100 p-5 mb-8">
          <h3 className="text-[14px] font-bold text-brand-800 mb-3">What&apos;s Next</h3>
          <ul className="space-y-2 text-[13px] text-brand-700">
            <li className="flex items-start gap-2">
              <span className="text-brand-500 font-bold shrink-0">1.</span>
              Your driver will call you {search.direction === "pickup" ? "after you land" : "30 min before pickup"}.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-brand-500 font-bold shrink-0">2.</span>
              Track your cab in real-time through the app or driver&apos;s WhatsApp.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-brand-500 font-bold shrink-0">3.</span>
              Save the booking reference <strong>{bookingReference}</strong> for quick support.
            </li>
          </ul>
        </div>

        <div className="flex gap-3">
          <Link href="/my-trips" className="flex-1 text-center rounded-xl bg-brand-600 py-3 text-[14px] font-bold text-white hover:bg-brand-700 transition-colors">
            View My Trips
          </Link>
          <Link href="/taxi-package" className="flex-1 text-center rounded-xl bg-white border border-border-soft py-3 text-[14px] font-semibold text-ink hover:bg-surface-muted transition-colors">
            Book Another
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
