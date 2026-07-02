"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import SightseeingCard from "@/components/transport/SightseeingCard";
import Chip from "@/components/ui/Chip";
import Skeleton from "@/components/ui/Skeleton";
import { searchSightseeingPackages, searchSightseeingCityOptions } from "@/services/taxi";
import type { SightseeingPackage, Theme, PackageDuration } from "@/lib/mock/taxi";
import InventoryUnavailable from "@/components/shared/InventoryUnavailable";

export default function SightseeingResultsPage() {
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
      <main className="flex-1 max-w-4xl mx-auto w-full p-6 flex flex-col gap-4">
        {Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
      </main>
      <Footer />
    </div>
  );
}

const THEMES: { value: Theme; label: string }[] = [
  { value: "heritage", label: "Heritage" },
  { value: "nature", label: "Nature" },
  { value: "adventure", label: "Adventure" },
  { value: "religious", label: "Religious" },
  { value: "food", label: "Food & Culture" },
];

const DURATION_FILTERS: { value: PackageDuration | "all"; label: string }[] = [
  { value: "all", label: "All Durations" },
  { value: "half-day", label: "Half Day" },
  { value: "full-day", label: "Full Day" },
  { value: "multi-day", label: "Multi-Day" },
];

function Inner() {
  const sp = useSearchParams();
  const city = sp.get("city") ?? "JAI";
  const date = sp.get("date") ?? new Date().toISOString().slice(0, 10);
  const pax = parseInt(sp.get("pax") ?? "2", 10);
  const themeParam = sp.get("themes");

  return (
    <SightseeingResultsContent
      key={`${city}-${date}-${pax}-${themeParam ?? ""}`}
      city={city}
      date={date}
      pax={pax}
      themeParam={themeParam}
    />
  );
}

function SightseeingResultsContent({
  city,
  date,
  pax,
  themeParam,
}: {
  city: string;
  date: string;
  pax: number;
  themeParam: string | null;
}) {
  const initThemes: Theme[] = themeParam ? (themeParam.split(",") as Theme[]) : [];

  const [packages, setPackages] = useState<SightseeingPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [themeFilter, setThemeFilter] = useState<Theme[]>(initThemes);
  const [durationFilter, setDurationFilter] = useState<PackageDuration | "all">("all");

  const searchQs = new URLSearchParams({ city, date, pax: String(pax) }).toString();
  const cityInfo = searchSightseeingCityOptions(city)[0];

  useEffect(() => {
    searchSightseeingPackages({ city, date, pax }).then((res) => {
      setPackages(res);
      setLoading(false);
    });
  }, [city, date, pax]);

  const displayed = useMemo(() => {
    let list = packages;
    if (themeFilter.length > 0) list = list.filter((p) => p.themes.some((t) => themeFilter.includes(t)));
    if (durationFilter !== "all") list = list.filter((p) => p.durationType === durationFilter);
    return list;
  }, [packages, themeFilter, durationFilter]);

  function toggleTheme(t: Theme) {
    setThemeFilter((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]);
  }

  return (
    <div className="min-h-screen flex flex-col bg-surface-muted">
      <Header />

      <div className="bg-brand-900 text-white px-4 py-3">
        <div className="mx-auto max-w-4xl flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px]">
          <span className="font-extrabold text-[15px]">{cityInfo?.name ?? city} Sightseeing</span>
          <span className="text-white/70">{date}</span>
          <span className="rounded bg-white/10 px-2 py-0.5 text-white/80">{pax} traveler{pax !== 1 ? "s" : ""}</span>
        </div>
      </div>

      <main className="flex-1 mx-auto max-w-4xl w-full px-4 md:px-6 py-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div className="flex flex-wrap gap-2">
            {THEMES.map((t) => (
              <Chip key={t.value} active={themeFilter.includes(t.value)} onClick={() => toggleTheme(t.value)}>
                {t.label}
              </Chip>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {DURATION_FILTERS.map((d) => (
              <Chip key={d.value} active={durationFilter === d.value} onClick={() => setDurationFilter(d.value)}>
                {d.label}
              </Chip>
            ))}
          </div>
        </div>

        {loading && (
          <div className="flex flex-col gap-4">
            {Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
          </div>
        )}

        {!loading && (
          <div className="flex flex-col gap-4" aria-live="polite">
            {displayed.length === 0 ? (
              <div className="rounded-xl bg-white border border-border-soft">
                <InventoryUnavailable
                  title="Sightseeing inventory is currently unavailable"
                  subtitle="This flow no longer shows generated tour packages. Connect a live provider to restore results."
                  href="/taxi-package"
                  ctaLabel="Back to Taxi Services"
                />
              </div>
            ) : (
              displayed.map((pkg) => (
                <SightseeingCard key={pkg.id} pkg={pkg} pax={pax} searchQs={searchQs} />
              ))
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
