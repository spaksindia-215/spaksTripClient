"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Combobox, { type ComboOption } from "@/components/ui/Combobox";
import { searchCityOptions } from "@/services/taxi";
import type { CityOption, TripType } from "@/lib/mock/taxi";

export default function OutstationSearch() {
  const router = useRouter();
  const [from, setFrom] = useState<CityOption | null>(null);
  const [to, setTo] = useState<CityOption | null>(null);
  const [tripType, setTripType] = useState<TripType>("one-way");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [returnDate, setReturnDate] = useState("");
  const [pax, setPax] = useState(1);

  function cityToOption(c: CityOption): ComboOption {
    return { value: c.code, label: c.name, sublabel: c.state };
  }

  function swap() {
    setFrom(to);
    setTo(from);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!from || !to) return;
    const params = new URLSearchParams({
      from: from.code,
      to: to.code,
      tripType,
      date,
      pax: String(pax),
    });
    if (tripType === "round" && returnDate) params.set("returnDate", returnDate);
    router.push(`/taxi-package/outstation/results?${params}`);
  }

  return (
    <form onSubmit={handleSearch} className="space-y-4">
      {/* Trip type */}
      <div className="flex rounded-lg border border-border-soft overflow-hidden text-[13px] font-semibold">
        {([["one-way", "One Way"], ["round", "Round Trip"]] as const).map(([val, label]) => (
          <button
            key={val}
            type="button"
            onClick={() => setTripType(val)}
            className={[
              "flex-1 py-2.5 transition-colors",
              tripType === val ? "bg-brand-600 text-white" : "bg-white text-ink hover:bg-surface-muted",
            ].join(" ")}
          >
            {label}
          </button>
        ))}
      </div>

      {/* From / Swap / To */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto_1fr]">
        <Combobox
          label="From City"
          placeholder="Pickup city…"
          value={from ? cityToOption(from) : null}
          onChange={(opt) => {
            if (!opt) { setFrom(null); return; }
            const found = searchCityOptions(opt.value)[0] ?? searchCityOptions(opt.label)[0] ?? null;
            setFrom(found);
          }}
          search={(q) => searchCityOptions(q).map(cityToOption)}
        />
        <button
          type="button"
          onClick={swap}
          className="self-end mb-0.5 flex h-10 w-10 items-center justify-center rounded-lg border border-border-soft bg-white text-ink hover:bg-surface-muted transition-colors"
          aria-label="Swap cities"
        >
          <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
          </svg>
        </button>
        <Combobox
          label="To City"
          placeholder="Destination city…"
          value={to ? cityToOption(to) : null}
          onChange={(opt) => {
            if (!opt) { setTo(null); return; }
            const found = searchCityOptions(opt.value)[0] ?? searchCityOptions(opt.label)[0] ?? null;
            setTo(found);
          }}
          search={(q) => searchCityOptions(q).map(cityToOption)}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="block text-[12px] font-semibold text-ink-muted mb-1.5">Departure Date</label>
          <input
            type="date"
            value={date}
            min={new Date().toISOString().slice(0, 10)}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-lg border border-border-soft bg-white px-3 py-2.5 text-[14px] text-ink focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
          />
        </div>
        {tripType === "round" && (
          <div>
            <label className="block text-[12px] font-semibold text-ink-muted mb-1.5">Return Date</label>
            <input
              type="date"
              value={returnDate}
              min={date}
              onChange={(e) => setReturnDate(e.target.value)}
              className="w-full rounded-lg border border-border-soft bg-white px-3 py-2.5 text-[14px] text-ink focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
            />
          </div>
        )}

        <div>
          <label className="block text-[12px] font-semibold text-ink-muted mb-1.5">Passengers</label>
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setPax((v) => Math.max(1, v - 1))} disabled={pax <= 1}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border-soft text-ink hover:bg-surface-muted disabled:opacity-40">−</button>
            <span className="w-6 text-center text-[14px] font-semibold text-ink">{pax}</span>
            <button type="button" onClick={() => setPax((v) => Math.min(12, v + 1))}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border-soft text-ink hover:bg-surface-muted">+</button>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={!from || !to}
        className="w-full rounded-xl bg-brand-600 py-3 text-[14px] font-bold text-white hover:bg-brand-700 disabled:opacity-40 transition-colors"
      >
        Search Cabs
      </button>
    </form>
  );
}
