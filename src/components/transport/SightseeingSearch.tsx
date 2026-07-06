"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Combobox, { type ComboOption } from "@/components/ui/Combobox";
import { searchSightseeingCityOptions } from "@/services/taxi";
import type { SightseeingCity, Theme } from "@/lib/mock/taxi";

const THEMES: { value: Theme; label: string }[] = [
  { value: "heritage", label: "Heritage" },
  { value: "nature", label: "Nature" },
  { value: "adventure", label: "Adventure" },
  { value: "religious", label: "Religious" },
  { value: "food", label: "Food" },
  { value: "culture", label: "Culture" },
  { value: "shopping", label: "Shopping" },
];

export default function SightseeingSearch() {
  const router = useRouter();
  const [city, setCity] = useState<SightseeingCity | null>(null);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [pax, setPax] = useState(2);
  const [themes, setThemes] = useState<Theme[]>([]);

  function cityToOption(c: SightseeingCity): ComboOption {
    return { value: c.code, label: c.name, sublabel: c.state };
  }

  function toggleTheme(t: Theme) {
    setThemes((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!city) return;
    const params = new URLSearchParams({ city: city.code, date, pax: String(pax) });
    if (themes.length) params.set("themes", themes.join(","));
    router.push(`/taxi-package/sightseeing/results?${params}`);
  }

  return (
    <form onSubmit={handleSearch} className="space-y-4">
      <Combobox
        label="Destination City"
        placeholder="Where do you want to explore?"
        value={city ? cityToOption(city) : null}
        onChange={(opt) => {
          if (!opt) { setCity(null); return; }
          const found = searchSightseeingCityOptions(opt.value)[0] ?? searchSightseeingCityOptions(opt.label)[0] ?? null;
          setCity(found);
        }}
        search={(q) => searchSightseeingCityOptions(q).map(cityToOption)}
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
          <label className="block text-[12px] font-semibold text-ink-muted mb-1.5">Travelers</label>
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setPax((v) => Math.max(1, v - 1))} disabled={pax <= 1}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border-soft text-ink hover:bg-surface-muted disabled:opacity-40">−</button>
            <span className="w-6 text-center text-[14px] font-semibold text-ink">{pax}</span>
            <button type="button" onClick={() => setPax((v) => Math.min(20, v + 1))}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border-soft text-ink hover:bg-surface-muted">+</button>
          </div>
        </div>
      </div>

      {/* Theme filters */}
      <div>
        <p className="text-[12px] font-semibold text-ink-muted mb-2">Interests (optional)</p>
        <div className="flex flex-wrap gap-2">
          {THEMES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => toggleTheme(t.value)}
              className={[
                "rounded-full border px-3 py-1 text-[12px] font-semibold transition-colors",
                themes.includes(t.value)
                  ? "border-brand-600 bg-brand-50 text-brand-700"
                  : "border-border-soft bg-white text-ink hover:border-brand-400",
              ].join(" ")}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={!city}
        className="w-full rounded-xl bg-brand-600 py-3 text-[14px] font-bold text-white hover:bg-brand-700 disabled:opacity-40 transition-colors"
      >
        Search Tours
      </button>
    </form>
  );
}
