"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import BookingStepper from "@/components/flight/BookingStepper";
import ItinerarySummary from "@/components/flight/ItinerarySummary";
import Button from "@/components/ui/Button";
import { useBookingStore } from "@/state/bookingStore";
import { formatINR } from "@/lib/format";
import { formatDate as formatDateUi } from "@/components/ui/DateRangePicker";

export default function FlightConfirmationPage() {
  const router = useRouter();
  const { current, clearCurrent } = useBookingStore();

  useEffect(() => {
    if (!current || current.status !== "CONFIRMED") router.replace("/flight");
  }, [current, router]);

  if (!current || !current.bookingReference) return null;

  return (
    <div className="min-h-screen flex flex-col bg-surface-muted">
      <Header />
      <BookingStepper active="confirmation" />
      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-4 md:px-6 py-6">
          <div className="rounded-xl bg-gradient-to-r from-success-500 to-success-700 text-white p-6 flex flex-col md:flex-row md:items-center gap-4 shadow-[var(--shadow-md)]">
            <div className="h-14 w-14 grid place-items-center rounded-full bg-white/20 shrink-0">
              <svg viewBox="0 0 24 24" width={28} height={28} fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="text-[12px] font-semibold uppercase tracking-wide opacity-90">
                Booking confirmed
              </div>
              <h1 className="text-[24px] font-extrabold">Your trip is booked!</h1>
              <div className="text-[14px] opacity-90 mt-1">
                Confirmation sent to <span className="font-semibold">{current.contact.email}</span>
              </div>
            </div>
            <div className="bg-white/15 rounded-lg px-4 py-3 text-center">
              <div className="text-[11px] uppercase tracking-wide opacity-80">Booking reference</div>
              <div className="text-[22px] font-extrabold tracking-wider">
                {current.bookingReference}
              </div>
            </div>
          </div>

          <div className="mt-5 grid md:grid-cols-[1fr_300px] gap-5">
            <div className="flex flex-col gap-4">
              <ItinerarySummary offer={current.offer} />

              <section className="rounded-xl bg-white border border-border-soft p-5 shadow-[var(--shadow-xs)]">
                <h2 className="text-[15px] font-bold text-ink mb-3">Travellers</h2>
                <div className="flex flex-col gap-2">
                  {current.travelers.map((t) => (
                    <div key={t.id} className="flex items-center justify-between rounded-md bg-surface-muted px-3 py-2.5">
                      <div>
                        <div className="text-[14px] font-semibold text-ink">
                          {t.title} {t.firstName} {t.lastName}
                        </div>
                        <div className="text-[11px] text-ink-muted">
                          {t.type === "ADT" ? "Adult" : t.type === "CHD" ? "Child" : "Infant"}
                          {t.dob ? ` · DOB ${formatDateUi(new Date(t.dob))}` : ""}
                        </div>
                      </div>
                      <div className="text-[11px] font-semibold text-ink-muted">
                        E-ticket #{current.bookingReference}-{t.id.slice(-1)}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-xl bg-white border border-border-soft p-5 shadow-[var(--shadow-xs)]">
                <h2 className="text-[15px] font-bold text-ink mb-3">What's next</h2>
                <ul className="flex flex-col gap-2 text-[13px] text-ink-soft">
                  <NextStep>Web check-in opens 48 hours before departure.</NextStep>
                  <NextStep>Reach the airport at least 2 hours before departure.</NextStep>
                  <NextStep>Carry a government-issued photo ID matching the traveller names.</NextStep>
                  <NextStep>Cabin baggage: {current.offer.baggage.cabin} kg · Check-in: {current.offer.baggage.checkin} kg</NextStep>
                </ul>
              </section>
            </div>

            <aside className="flex flex-col gap-3">
              <div className="rounded-xl bg-white border border-border-soft p-5 shadow-[var(--shadow-xs)]">
                <div className="text-[11px] uppercase tracking-wide text-ink-muted">Amount paid</div>
                <div className="text-[26px] font-extrabold text-ink leading-none mt-0.5">
                  {formatINR(current.totalPrice)}
                </div>
                <div className="text-[11px] text-ink-muted mt-1">
                  Booked on {current.confirmedAt ? formatDateUi(new Date(current.confirmedAt)) : "—"}
                </div>
                <div className="my-4 h-px bg-border-soft" />
                <div className="flex flex-col gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    leading={
                      <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                    }
                    onClick={() => window.print()}
                  >
                    Download e-ticket
                  </Button>
                  <Button variant="ghost" size="sm">
                    Email itinerary
                  </Button>
                </div>
              </div>

              <Link href="/" onClick={() => clearCurrent()} className="block">
                <Button variant="accent" fullWidth>Book another trip</Button>
              </Link>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function NextStep({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden className="text-brand-600 mt-0.5 shrink-0">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
      <span>{children}</span>
    </li>
  );
}
