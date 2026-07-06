"use client";

import { Suspense } from "react";
import Link from "next/link";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import HotelBookingStepper from "@/components/accommodation/HotelBookingStepper";
import Button from "@/components/ui/Button";
import { formatINR } from "@/lib/format";
import { useHotelBookingStore } from "@/state/hotelBookingStore";

export default function HotelConfirmationPage() {
  return (
    <Suspense fallback={null}>
      <ConfirmationInner />
    </Suspense>
  );
}

function ConfirmationInner() {
  const { current } = useHotelBookingStore();

  if (!current || current.status !== "CONFIRMED") {
    return (
      <div className="min-h-screen flex flex-col bg-surface-muted">
        <Header />
        <main className="flex-1 grid place-items-center p-8">
          <div className="text-center">
            <p className="text-[16px] font-semibold text-ink">No confirmed booking found.</p>
            <Link href="/hotel" className="mt-4 inline-block text-brand-600 hover:underline text-[14px] font-semibold">
              Search Hotels
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const { hotel, room, checkIn, checkOut, nights, rooms, guests, contact, addOns, totalPrice, bookingReference, confirmedAt } = current;

  return (
    <div className="min-h-screen flex flex-col bg-surface-muted">
      <Header />
      <HotelBookingStepper active="confirmation" />

      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 md:px-6 py-8">
          {/* Success header */}
          <div className="rounded-xl bg-success-50 border border-success-500/30 p-6 text-center mb-6">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-success-500">
              <svg viewBox="0 0 24 24" width={28} height={28} fill="none" stroke="white" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h1 className="text-[22px] font-extrabold text-success-700">Booking Confirmed!</h1>
            <p className="text-[14px] text-success-600 mt-1">
              A confirmation has been sent to {contact.email}
            </p>
            <div className="mt-4 inline-flex flex-col items-center">
              <span className="text-[11px] font-semibold text-success-600 uppercase tracking-wide">Booking Reference</span>
              <span className="text-[28px] font-black text-success-700 tracking-widest">{bookingReference}</span>
            </div>
          </div>

          {/* Hotel details */}
          <div className="rounded-xl bg-white border border-border-soft p-5 shadow-(--shadow-xs) mb-4">
            <h2 className="text-[15px] font-bold text-ink mb-3">Hotel Details</h2>
            <div className="flex gap-4">
              <img src={hotel.images[0]} alt={hotel.name} className="h-20 w-28 shrink-0 rounded-lg object-cover" />
              <div className="flex flex-col gap-1">
                <p className="text-[16px] font-bold text-ink">{hotel.name}</p>
                {hotel.chain && <p className="text-[12px] text-ink-muted">{hotel.chain}</p>}
                <p className="text-[12px] text-ink-muted">{hotel.address}</p>
                <p className="text-[12px] font-semibold text-ink mt-1">
                  {room.name} · {rooms} room{rooms !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
            <div className="mt-4 grid sm:grid-cols-3 gap-3 pt-4 border-t border-border-soft">
              <div>
                <p className="text-[11px] text-ink-muted uppercase tracking-wide">Check-in</p>
                <p className="text-[14px] font-bold text-ink">{checkIn}</p>
              </div>
              <div>
                <p className="text-[11px] text-ink-muted uppercase tracking-wide">Check-out</p>
                <p className="text-[14px] font-bold text-ink">{checkOut}</p>
              </div>
              <div>
                <p className="text-[11px] text-ink-muted uppercase tracking-wide">Duration</p>
                <p className="text-[14px] font-bold text-ink">{nights} night{nights !== 1 ? "s" : ""}</p>
              </div>
            </div>
          </div>

          {/* Guests */}
          <div className="rounded-xl bg-white border border-border-soft p-5 shadow-(--shadow-xs) mb-4">
            <h2 className="text-[15px] font-bold text-ink mb-3">Guests</h2>
            <div className="flex flex-col gap-2">
              {guests.map((g, i) => (
                <div key={i} className="flex items-center justify-between text-[13px]">
                  <span className="text-ink-soft">Room {i + 1}</span>
                  <span className="font-semibold text-ink">{g.firstName} {g.lastName}</span>
                </div>
              ))}
              <div className="flex items-center justify-between text-[13px] pt-2 border-t border-border-soft mt-1">
                <span className="text-ink-soft">Contact</span>
                <span className="font-semibold text-ink">{contact.email} · {contact.phone}</span>
              </div>
            </div>
          </div>

          {/* Price */}
          <div className="rounded-xl bg-white border border-border-soft p-5 shadow-(--shadow-xs) mb-6">
            <h2 className="text-[15px] font-bold text-ink mb-3">Payment Summary</h2>
            <div className="flex flex-col gap-1.5 text-[13px]">
              {addOns.breakfast && <div className="flex justify-between"><span className="text-ink-soft">Breakfast included</span><span className="font-semibold text-success-600">✓</span></div>}
              {addOns.insurance && <div className="flex justify-between"><span className="text-ink-soft">Travel insurance</span><span className="font-semibold text-success-600">✓</span></div>}
              <div className="flex justify-between border-t border-border-soft pt-2 mt-1">
                <span className="font-bold text-ink">Total Paid</span>
                <span className="font-extrabold text-[16px] text-ink">{formatINR(totalPrice)}</span>
              </div>
              {confirmedAt && (
                <p className="text-[11px] text-ink-muted mt-1">
                  Confirmed on {new Date(confirmedAt).toLocaleString("en-IN")}
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" size="lg" onClick={() => window.print()} leading={
              <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                <rect x="6" y="14" width="12" height="8" />
              </svg>
            }>
              Print Voucher
            </Button>
            <Link href="/hotel">
              <Button variant="primary" size="lg" fullWidth>Search More Hotels</Button>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
