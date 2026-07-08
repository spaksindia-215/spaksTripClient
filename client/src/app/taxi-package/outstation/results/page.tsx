"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import OutstationCard from "@/components/transport/OutstationCard";
import Chip from "@/components/ui/Chip";
import Skeleton from "@/components/ui/Skeleton";
import { searchOutstationOffers, searchCityOptions } from "@/services/taxi";
import type { OutstationOffer, OutstationVehicle, TripType } from "@/lib/mock/taxi";
import InventoryUnavailable from "@/components/shared/InventoryUnavailable";

export default function OutstationResultsPage() {
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
        {Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-36 rounded-xl" />)}
      </main>
      <Footer />
    </div>
  );
}

const VEHICLE_FILTERS: { value: OutstationVehicle | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "mini", label: "Mini" },
  { value: "sedan", label: "Sedan" },
  { value: "suv", label: "SUV" },
  { value: "traveller", label: "Traveller" },
];

type SortBy = "price" | "rating" | "time";

function Inner() {
  const sp = useSearchParams();
  const fromCity = sp.get("from") ?? "DEL";
  const toCity = sp.get("to") ?? "AGR";
  const date = sp.get("date") ?? new Date().toISOString().slice(0, 10);
  const tripType = (sp.get("tripType") ?? "one-way") as TripType;
  const pax = parseInt(sp.get("pax") ?? "1", 10);
  const returnDate = sp.get("returnDate") ?? undefined;

  return (
    <OutstationResultsContent
      key={`${fromCity}-${toCity}-${date}-${tripType}-${pax}-${returnDate ?? ""}`}
      fromCity={fromCity}
      toCity={toCity}
      date={date}
      tripType={tripType}
      pax={pax}
      returnDate={returnDate}
      searchQs={sp.toString()}
    />
  );
}

function OutstationResultsContent({
  fromCity,
  toCity,
  date,
  tripType,
  pax,
  returnDate,
  searchQs,
}: {
  fromCity: string;
  toCity: string;
  date: string;
  tripType: TripType;
  pax: number;
  returnDate?: string;
  searchQs: string;
}) {

  const [offers, setOffers] = useState<OutstationOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [vehicleFilter, setVehicleFilter] = useState<OutstationVehicle | "all">("all");
  const [sortBy, setSortBy] = useState<SortBy>("price");

  const fromInfo = searchCityOptions(fromCity)[0];
  const toInfo = searchCityOptions(toCity)[0];

  useEffect(() => {
    searchOutstationOffers({ fromCity, toCity, date, tripType, pax, returnDate }).then((res) => {
      setOffers(res);
      setLoading(false);
    });
  }, [fromCity, toCity, date, tripType, pax, returnDate]);

  const displayed = useMemo(() => {
    let list = vehicleFilter === "all" ? offers : offers.filter((o) => o.vehicleType === vehicleFilter);
    if (sortBy === "price") list = [...list].sort((a, b) => a.estimatedFare - b.estimatedFare);
    if (sortBy === "rating") list = [...list].sort((a, b) => b.rating - a.rating);
    if (sortBy === "time") {
      list = [...list].sort((a, b) => {
        const parseH = (s: string) => parseInt(s) * 60 + parseInt(s.split("h")[1] ?? "0");
        return parseH(a.estimatedTime) - parseH(b.estimatedTime);
      });
    }
    return list;
  }, [offers, vehicleFilter, sortBy]);

  return (
    <div className="min-h-screen flex flex-col bg-surface-muted">
      <Header />

      <div className="bg-brand-900 text-white px-4 py-3">
        <div className="mx-auto max-w-4xl flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px]">
          <span className="font-extrabold text-[15px]">
            {fromInfo?.name ?? fromCity} → {toInfo?.name ?? toCity}
          </span>
          <span className="text-white/70">{date}</span>
          <span className="rounded bg-white/15 px-2 py-0.5 font-semibold capitalize">{tripType.replace("-", " ")}</span>
          <span className="rounded bg-white/10 px-2 py-0.5 text-white/80">{pax} pax</span>
        </div>
      </div>

      <main className="flex-1 mx-auto max-w-4xl w-full px-4 md:px-6 py-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div className="flex flex-wrap gap-2">
            {VEHICLE_FILTERS.map((f) => (
              <Chip key={f.value} active={vehicleFilter === f.value} onClick={() => setVehicleFilter(f.value)}>
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
            {Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-36 rounded-xl" />)}
          </div>
        )}

        {!loading && (
          <div className="flex flex-col gap-3" aria-live="polite">
            {displayed.length === 0 ? (
              <div className="rounded-xl bg-white border border-border-soft">
                <InventoryUnavailable
                  title="Outstation cab inventory is currently unavailable"
                  subtitle="This flow no longer shows generated outstation vehicles. Connect a live provider to restore results."
                  href="/taxi-package"
                  ctaLabel="Back to Taxi Services"
                />
              </div>
            ) : (
              displayed.map((offer) => (
                <OutstationCard key={offer.id} offer={offer} searchQs={searchQs} />
              ))
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
