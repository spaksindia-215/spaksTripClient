"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import Skeleton from "@/components/ui/Skeleton";
import { formatINR } from "@/lib/format";
import { getSightseeingPackage } from "@/services/taxi";
import { useTaxiBookingStore } from "@/state/taxiBookingStore";
import { sleep } from "@/services/delay";
import { useToast } from "@/components/ui/Toast";
import type { SightseeingPackage, SightseeingSearch } from "@/lib/mock/taxi";
import type { SightseeingContact, SightseeingTraveler } from "@/state/taxiBookingStore";

export default function SightseeingDetailPage() {
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
          <div className="space-y-4"><Skeleton className="h-64 rounded-xl" /><Skeleton className="h-48 rounded-xl" /></div>
          <Skeleton className="h-80 rounded-xl" />
        </div>
      </main>
      <Footer />
    </div>
  );
}

const THEME_COLORS: Record<string, string> = {
  heritage: "bg-amber-50 text-amber-700",
  nature: "bg-emerald-50 text-emerald-700",
  adventure: "bg-orange-50 text-orange-700",
  religious: "bg-purple-50 text-purple-700",
  food: "bg-red-50 text-red-700",
  culture: "bg-blue-50 text-blue-700",
  shopping: "bg-pink-50 text-pink-700",
};

function Inner() {
  const { id } = useParams<{ id: string }>();
  const sp = useSearchParams();
  const router = useRouter();
  const { push: toast } = useToast();

  const city = sp.get("city") ?? "";
  const date = sp.get("date") ?? "";
  const pax = parseInt(sp.get("pax") ?? "2", 10);

  const [pkg, setPkg] = useState<SightseeingPackage | null>(null);
  const [loading, setLoading] = useState(true);
  const [travelers, setTravelers] = useState<SightseeingTraveler[]>(Array.from({ length: pax }, () => ({ name: "" })));
  const [contact, setContact] = useState<SightseeingContact>({ name: "", phone: "", email: "" });
  const [privateGuide, setPrivateGuide] = useState(false);
  const [paying, setPaying] = useState(false);

  const { startSightseeingBooking, setSightseeingTravelers, setSightseeingContact, setSightseeingAddOns, confirmSightseeing } = useTaxiBookingStore();

  useEffect(() => {
    getSightseeingPackage(decodeURIComponent(id)).then((p) => {
      setPkg(p);
      setLoading(false);
    });
  }, [id]);

  function updateTraveler(idx: number, name: string) {
    setTravelers((prev) => prev.map((t, i) => i === idx ? { name } : t));
  }

  async function handleBook(e: React.FormEvent) {
    e.preventDefault();
    if (!pkg) return;
    if (!contact.name || !contact.phone) {
      toast({ title: "Please fill in contact name and phone.", tone: "danger" });
      return;
    }

    const search: SightseeingSearch = { city, date, pax };
    startSightseeingBooking(pkg, search);
    setSightseeingTravelers(travelers);
    setSightseeingContact(contact);
    setSightseeingAddOns({ privateGuide });

    setPaying(true);
    await sleep(1400);
    const ref = `SG${Date.now().toString().slice(-8)}`;
    confirmSightseeing(ref);
    router.push(`/taxi-package/sightseeing/${encodeURIComponent(id)}/confirmation`);
  }

  if (loading) return <PageFallback />;
  if (!pkg) return (
    <div className="min-h-screen flex flex-col bg-surface-muted">
      <Header />
      <main className="flex-1 flex items-center justify-center"><p className="text-ink-muted">Sightseeing booking is currently unavailable.</p></main>
      <Footer />
    </div>
  );

  const base = pkg.pricePerPerson * pax;
  const guideFee = privateGuide ? 800 : 0;
  const taxes = Math.round((base + guideFee) * 0.05);
  const total = base + guideFee + taxes;
  const DURATION_LABEL: Record<string, string> = { "half-day": "Half Day", "full-day": "Full Day", "multi-day": "Multi-Day" };

  return (
    <div className="min-h-screen bg-surface-muted">
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <form onSubmit={handleBook}>
          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            {/* Left */}
            <div className="space-y-5">
              {/* Hero + overview */}
              <div className="overflow-hidden rounded-xl bg-white border border-border-soft">
                <div className="relative h-52 sm:h-64">
                  <img src={pkg.imageUrl} alt={pkg.title} className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-5">
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {pkg.themes.map((t) => (
                        <span key={t} className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${THEME_COLORS[t] ?? "bg-white/20 text-white"}`}>{t}</span>
                      ))}
                    </div>
                    <h1 className="text-[20px] font-extrabold text-white">{pkg.title}</h1>
                    <p className="text-[13px] text-white/80 mt-0.5">{DURATION_LABEL[pkg.durationType]} · {pkg.durationHours}h · {pkg.city}</p>
                  </div>
                </div>
                <div className="p-5">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[12px] mb-4">
                    <div className="rounded-lg bg-surface-muted p-3 text-center">
                      <p className="font-extrabold text-ink text-[15px]">★ {pkg.rating}</p>
                      <p className="text-ink-muted mt-0.5">{pkg.ratingCount} reviews</p>
                    </div>
                    <div className="rounded-lg bg-surface-muted p-3 text-center">
                      <p className="font-extrabold text-ink text-[15px]">{pkg.stops.length}</p>
                      <p className="text-ink-muted mt-0.5">Stops</p>
                    </div>
                    <div className="rounded-lg bg-surface-muted p-3 text-center">
                      <p className="font-extrabold text-ink text-[15px]">{pkg.vehicleType}</p>
                      <p className="text-ink-muted mt-0.5">Vehicle</p>
                    </div>
                    <div className="rounded-lg bg-surface-muted p-3 text-center">
                      <p className="font-extrabold text-ink text-[15px]">{pkg.guideIncluded ? "Yes" : "No"}</p>
                      <p className="text-ink-muted mt-0.5">Guide incl.</p>
                    </div>
                  </div>

                  {/* Highlights */}
                  <h3 className="text-[13px] font-bold text-ink mb-2">Highlights</h3>
                  <ul className="space-y-1.5 mb-4">
                    {pkg.highlights.map((h) => (
                      <li key={h} className="flex items-center gap-1.5 text-[12px] text-ink-muted">
                        <svg viewBox="0 0 24 24" width={12} height={12} fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="text-brand-500 shrink-0" aria-hidden><polyline points="20 6 9 17 4 12" /></svg>
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Itinerary */}
              <div className="rounded-xl bg-white border border-border-soft p-5">
                <h2 className="text-[15px] font-bold text-ink mb-4">Itinerary</h2>
                <div className="space-y-0">
                  {pkg.itinerary.map((stop, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${i === 0 ? "bg-brand-600 text-white" : i === pkg.itinerary.length - 1 ? "bg-emerald-500 text-white" : "bg-surface-muted text-ink-muted"}`}>{i + 1}</div>
                        {i < pkg.itinerary.length - 1 && <div className="w-0.5 h-8 bg-border-soft" />}
                      </div>
                      <div className="pb-4 flex-1">
                        <p className="text-[13px] font-semibold text-ink">{stop.place}</p>
                        <p className="text-[11px] text-ink-muted">{stop.time} · {stop.duration}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Inclusions */}
              <div className="rounded-xl bg-white border border-border-soft p-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-[13px] font-bold text-ink mb-2">Inclusions</h3>
                    <ul className="space-y-1.5">
                      {pkg.inclusions.map((item) => (
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
                      {pkg.exclusions.map((item) => (
                        <li key={item} className="flex items-center gap-1.5 text-[12px] text-ink-muted">
                          <svg viewBox="0 0 24 24" width={12} height={12} fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="text-red-400 shrink-0" aria-hidden><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Private guide add-on */}
              {!pkg.guideIncluded && (
                <div className="rounded-xl bg-white border border-border-soft p-5">
                  <h2 className="text-[15px] font-bold text-ink mb-3">Add-on</h2>
                  <label className="flex items-center gap-3 cursor-pointer rounded-lg border border-border-soft p-3.5 hover:border-brand-400 transition-colors">
                    <input
                      type="checkbox"
                      checked={privateGuide}
                      onChange={(e) => setPrivateGuide(e.target.checked)}
                      className="h-4 w-4 rounded border-border-soft accent-brand-600"
                    />
                    <div className="flex-1">
                      <p className="text-[13px] font-semibold text-ink">Private English-Speaking Guide</p>
                      <p className="text-[11px] text-ink-muted mt-0.5">Dedicated guide for your group only</p>
                    </div>
                    <span className="text-[13px] font-bold text-ink shrink-0">+{formatINR(800)}</span>
                  </label>
                </div>
              )}

              {/* Traveler details */}
              <div className="rounded-xl bg-white border border-border-soft p-5">
                <h2 className="text-[15px] font-bold text-ink mb-4">Traveler Names</h2>
                <div className="space-y-2.5">
                  {travelers.map((t, i) => (
                    <div key={i}>
                      <label className="block text-[12px] font-semibold text-ink-muted mb-1">Traveler {i + 1}</label>
                      <input
                        value={t.name}
                        onChange={(e) => updateTraveler(i, e.target.value)}
                        placeholder={`Full name of traveler ${i + 1}`}
                        className="w-full rounded-lg border border-border-soft px-3 py-2.5 text-[14px] text-ink focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact */}
              <div className="rounded-xl bg-white border border-border-soft p-5">
                <h2 className="text-[15px] font-bold text-ink mb-4">Contact Details</h2>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-[12px] font-semibold text-ink-muted mb-1.5">Full Name *</label>
                    <input required value={contact.name} onChange={(e) => setContact((c) => ({ ...c, name: e.target.value }))}
                      placeholder="Primary contact name"
                      className="w-full rounded-lg border border-border-soft px-3 py-2.5 text-[14px] text-ink focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200" />
                  </div>
                  <div>
                    <label className="block text-[12px] font-semibold text-ink-muted mb-1.5">Phone *</label>
                    <input required type="tel" value={contact.phone} onChange={(e) => setContact((c) => ({ ...c, phone: e.target.value }))}
                      placeholder="+91 98765 43210"
                      className="w-full rounded-lg border border-border-soft px-3 py-2.5 text-[14px] text-ink focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[12px] font-semibold text-ink-muted mb-1.5">Email</label>
                    <input type="email" value={contact.email} onChange={(e) => setContact((c) => ({ ...c, email: e.target.value }))}
                      placeholder="for voucher & updates"
                      className="w-full rounded-lg border border-border-soft px-3 py-2.5 text-[14px] text-ink focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200" />
                  </div>
                </div>
              </div>
            </div>

            {/* Fare summary */}
            <div>
              <div className="rounded-xl bg-white border border-border-soft p-5 sticky top-24">
                <h2 className="text-[15px] font-bold text-ink mb-4">Price Summary</h2>
                <div className="space-y-2 text-[13px]">
                  <div className="flex justify-between text-ink">
                    <span>{formatINR(pkg.pricePerPerson)} × {pax} traveler{pax !== 1 ? "s" : ""}</span>
                    <span>{formatINR(base)}</span>
                  </div>
                  {privateGuide && (
                    <div className="flex justify-between text-ink-muted">
                      <span>Private guide</span><span>{formatINR(800)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-ink-muted">
                    <span>GST (5%)</span><span>{formatINR(taxes)}</span>
                  </div>
                  <div className="border-t border-border-soft pt-2 flex justify-between font-extrabold text-ink text-[16px]">
                    <span>Total</span><span>{formatINR(total)}</span>
                  </div>
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
