"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Combobox, { type ComboOption } from "@/components/ui/Combobox";
import { searchAirportOptions } from "@/services/taxi";
import type { AirportCode } from "@/lib/mock/taxi";

export default function AirportTransferSearch() {
  const router = useRouter();

  const [airport, setAirport] = useState<AirportCode | null>(null);
  const [direction, setDirection] = useState<"pickup" | "dropoff">("pickup");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState("10:00");
  const [flightNo, setFlightNo] = useState("");
  const [pax, setPax] = useState(1);
  const [address, setAddress] = useState("");

  function airportToOption(a: AirportCode): ComboOption {
    return { value: a.code, label: a.city, sublabel: a.name, badge: a.code };
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!airport) return;
    const params = new URLSearchParams({
      airport: airport.code,
      direction,
      date,
      time,
      flightNo,
      pax: String(pax),
      address,
    });
    router.push(`/taxi-package/airport-transfer/results?${params}`);
  }

  return (
    <form onSubmit={handleSearch} className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="col-span-full">
          <Combobox
            label="Airport"
            placeholder="Search airport or city…"
            value={airport ? airportToOption(airport) : null}
            onChange={(opt) => {
              if (!opt) { setAirport(null); return; }
              const found = searchAirportOptions(opt.value).find((a) => a.code === opt.value) ??
                searchAirportOptions(opt.label)[0] ?? null;
              setAirport(found);
            }}
            search={(q) => searchAirportOptions(q).map(airportToOption)}
          />
        </div>

        {/* Direction toggle */}
        <div className="col-span-full flex rounded-lg border border-border-soft overflow-hidden text-[13px] font-semibold">
          {(["pickup", "dropoff"] as const).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDirection(d)}
              className={[
                "flex-1 py-2.5 transition-colors",
                direction === d
                  ? "bg-brand-600 text-white"
                  : "bg-white text-ink hover:bg-surface-muted",
              ].join(" ")}
            >
              {d === "pickup" ? "Airport → Your Location" : "Your Location → Airport"}
            </button>
          ))}
        </div>

        <div>
          <label className="block text-[12px] font-semibold text-ink-muted mb-1.5">Date</label>
          <input
            type="date"
            value={date}
            min={new Date().toISOString().slice(0, 10)}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-lg border border-border-soft bg-white px-3 py-2.5 text-[14px] text-ink focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
          />
        </div>

        <div>
          <label className="block text-[12px] font-semibold text-ink-muted mb-1.5">Pickup Time</label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full rounded-lg border border-border-soft bg-white px-3 py-2.5 text-[14px] text-ink focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
          />
        </div>

        <div>
          <label className="block text-[12px] font-semibold text-ink-muted mb-1.5">Flight Number</label>
          <input
            type="text"
            value={flightNo}
            onChange={(e) => setFlightNo(e.target.value.toUpperCase())}
            placeholder="e.g. AI 302"
            className="w-full rounded-lg border border-border-soft bg-white px-3 py-2.5 text-[14px] text-ink placeholder:text-ink-soft focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
          />
        </div>

        <div>
          <label className="block text-[12px] font-semibold text-ink-muted mb-1.5">Passengers</label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setPax((v) => Math.max(1, v - 1))}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border-soft text-ink hover:bg-surface-muted disabled:opacity-40"
              disabled={pax <= 1}
            >−</button>
            <span className="w-6 text-center text-[14px] font-semibold text-ink">{pax}</span>
            <button
              type="button"
              onClick={() => setPax((v) => Math.min(14, v + 1))}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border-soft text-ink hover:bg-surface-muted"
            >+</button>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-[12px] font-semibold text-ink-muted mb-1.5">
          {direction === "pickup" ? "Drop-off Address" : "Pickup Address"}
        </label>
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Enter full address…"
          className="w-full rounded-lg border border-border-soft bg-white px-3 py-2.5 text-[14px] text-ink placeholder:text-ink-soft focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
        />
      </div>

      <button
        type="submit"
        disabled={!airport}
        className="w-full rounded-xl bg-brand-600 py-3 text-[14px] font-bold text-white hover:bg-brand-700 disabled:opacity-40 transition-colors"
      >
        Search Airport Transfers
      </button>
    </form>
  );
}
