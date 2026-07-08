"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import AirportTransferCard from "@/components/transport/AirportTransferCard";
import Chip from "@/components/ui/Chip";
import Skeleton from "@/components/ui/Skeleton";
import { searchAirportTransfers, searchAirportOptions } from "@/services/taxi";
import type { AirportTransferOffer, TransferType } from "@/lib/mock/taxi";
import InventoryUnavailable from "@/components/shared/InventoryUnavailable";

export default function AirportTransferResultsPage() {
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
      <main className="flex-1 max-w-4xl mx-auto w-full p-6 flex flex-col gap-3">
        {Array.from({ length: 5 }, (_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
      </main>
      <Footer />
    </div>
  );
}

const TYPE_FILTERS: { value: TransferType | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "mini", label: "Mini" },
  { value: "sedan", label: "Sedan" },
  { value: "suv", label: "SUV" },
  { value: "van", label: "Van" },
  { value: "luxury", label: "Luxury" },
];

type SortBy = "price" | "rating" | "time";

function Inner() {
  const sp = useSearchParams();
  const airport = sp.get("airport") ?? "DEL";
  const direction = (sp.get("direction") ?? "pickup") as "pickup" | "dropoff";
  const date = sp.get("date") ?? new Date().toISOString().slice(0, 10);
  const time = sp.get("time") ?? "10:00";
  const flightNo = sp.get("flightNo") ?? "";
  const pax = parseInt(sp.get("pax") ?? "1", 10);
  const address = sp.get("address") ?? "";

  return (
    <AirportTransferResultsContent
      key={`${airport}-${direction}-${date}-${time}-${flightNo}-${pax}-${address}`}
      airport={airport}
      direction={direction}
      date={date}
      time={time}
      flightNo={flightNo}
      pax={pax}
      address={address}
      searchQs={sp.toString()}
    />
  );
}

function AirportTransferResultsContent({
  airport,
  direction,
  date,
  time,
  flightNo,
  pax,
  address,
  searchQs,
}: {
  airport: string;
  direction: "pickup" | "dropoff";
  date: string;
  time: string;
  flightNo: string;
  pax: number;
  address: string;
  searchQs: string;
}) {

  const [offers, setOffers] = useState<AirportTransferOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<TransferType | "all">("all");
  const [sortBy, setSortBy] = useState<SortBy>("price");

  const airportInfo = searchAirportOptions(airport)[0];

  useEffect(() => {
    searchAirportTransfers({ airport, direction, date, time, flightNo, pax, address, luggage: 0 }).then((res) => {
      setOffers(res);
      setLoading(false);
    });
  }, [airport, direction, date, time, flightNo, pax, address]);

  const displayed = useMemo(() => {
    let list = typeFilter === "all" ? offers : offers.filter((o) => o.transferType === typeFilter);
    if (sortBy === "price") list = [...list].sort((a, b) => a.baseFare - b.baseFare);
    if (sortBy === "rating") list = [...list].sort((a, b) => b.rating - a.rating);
    if (sortBy === "time") list = [...list].sort((a, b) => a.estimatedMinutes - b.estimatedMinutes);
    return list;
  }, [offers, typeFilter, sortBy]);

  return (
    <div className="min-h-screen flex flex-col bg-surface-muted">
      <Header />

      <div className="bg-brand-900 text-white px-4 py-3">
        <div className="mx-auto max-w-4xl flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px]">
          <span className="font-extrabold text-[15px]">
            {direction === "pickup" ? `${airportInfo?.city ?? airport} Airport → Your Location` : `Your Location → ${airportInfo?.city ?? airport} Airport`}
          </span>
          <span className="text-white/70">{date} · {time}</span>
          {flightNo && <span className="rounded bg-white/15 px-2 py-0.5 font-semibold">{flightNo}</span>}
          <span className="rounded bg-white/10 px-2 py-0.5 text-white/80">{pax} pax</span>
        </div>
      </div>

      <main className="flex-1 mx-auto max-w-4xl w-full px-4 md:px-6 py-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div className="flex flex-wrap gap-2">
            {TYPE_FILTERS.map((f) => (
              <Chip key={f.value} active={typeFilter === f.value} onClick={() => setTypeFilter(f.value)}>
                {f.label}
              </Chip>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[12px] text-ink-muted font-semibold">Sort:</span>
            {(["price", "rating", "time"] as SortBy[]).map((s) => (
              <Chip key={s} active={sortBy === s} onClick={() => setSortBy(s)}>
                {s === "price" ? "Cheapest" : s === "rating" ? "Top Rated" : "Fastest"}
              </Chip>
            ))}
          </div>
        </div>

        {loading && (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 5 }, (_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
          </div>
        )}

        {!loading && (
          <div className="flex flex-col gap-3" aria-live="polite">
            {displayed.length === 0 ? (
              <div className="rounded-xl bg-white border border-border-soft">
                <InventoryUnavailable
                  title="Airport transfer inventory is currently unavailable"
                  subtitle="This flow no longer shows generated transfer offers. Connect a live provider to restore results."
                  href="/taxi-package"
                  ctaLabel="Back to Taxi Services"
                />
              </div>
            ) : (
              displayed.map((offer) => (
                <AirportTransferCard key={offer.id} offer={offer} searchQs={searchQs} />
              ))
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
