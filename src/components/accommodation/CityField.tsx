"use client";

import Combobox, { type ComboOption } from "@/components/ui/Combobox";
import { searchCityOptions } from "@/services/hotels";
import type { City } from "@/lib/mock/hotels";

type Props = {
  label?: string;
  value: City | null;
  onChange: (c: City | null) => void;
};

async function searchFn(q: string): Promise<ComboOption[]> {
  const cities = await searchCityOptions(q);
  return cities.map((c) => ({
    value: c.code,
    label: c.name,
    sublabel: c.country,
  }));
}

export default function CityField({ label = "Destination", value, onChange }: Props) {
  const option: ComboOption | null = value
    ? { value: value.code, label: value.name, sublabel: value.country }
    : null;

  return (
    <Combobox
      label={label}
      placeholder="Search city or destination"
      value={option}
      onChange={(o) => {
        if (!o) { onChange(null); return; }
        searchCityOptions(o.label).then((cities) => {
          const found = cities.find((c) => c.code === o.value);
          onChange(found ?? { code: o.value, name: o.label, country: o.sublabel ?? "" });
        });
      }}
      search={searchFn}
      minQuery={0}
      renderValue={(o) => (
        <span className="flex flex-col">
          <span className="text-[15px] font-bold text-ink leading-tight">{o.label}</span>
          <span className="text-[11px] text-ink-muted">{o.sublabel}</span>
        </span>
      )}
      renderOption={(o) => (
        <div className="flex flex-1 items-center justify-between gap-3">
          <div className="flex flex-col min-w-0">
            <span className="text-[13px] font-semibold text-ink">{o.label}</span>
            <span className="text-[11px] text-ink-muted">{o.sublabel}</span>
          </div>
          <span className="rounded bg-surface-sunken px-1.5 py-0.5 text-[11px] font-bold text-ink-soft">
            {o.value}
          </span>
        </div>
      )}
    />
  );
}
