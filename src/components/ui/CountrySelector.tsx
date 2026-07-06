"use client";

import { COUNTRY_LOCALES } from "@/lib/localeConfig";
import { getCountryFlagUrl } from "@/lib/countryFlags";
import { useLocaleStore, useCountryLocale } from "@/state/localeStore";

const SORTED_COUNTRIES = Object.keys(COUNTRY_LOCALES).sort();

export default function CountrySelector({ className }: { className?: string }) {
  const country = useLocaleStore((s) => s.country);
  const setCountry = useLocaleStore((s) => s.setCountry);
  const { currency, symbol } = useCountryLocale();
  const flagUrl = getCountryFlagUrl(country);

  return (
    <div className={`flex items-center gap-2 ${className ?? ""}`}>
      <label htmlFor="country-selector" className="sr-only">
        Country
      </label>
      <span className="relative inline-flex items-center">
        {flagUrl ? (
          <img
            src={flagUrl}
            alt={`${country} flag`}
            width={18}
            height={14}
            className="pointer-events-none absolute left-2 h-3.5 w-[18px] rounded-[2px] object-cover"
          />
        ) : null}
        <select
          id="country-selector"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="rounded border border-border-soft bg-white py-1.5 pl-8 pr-2 text-[13px] text-ink focus:outline-none focus:ring-1 focus:ring-brand-500"
        >
          {SORTED_COUNTRIES.map((c) => (
            <option key={c} value={c}>
              {c} ({COUNTRY_LOCALES[c].currency})
            </option>
          ))}
        </select>
      </span>
      <span className="text-[13px] font-medium text-ink-soft" aria-label={`Currency: ${currency}`}>
        {symbol} {currency}
      </span>
    </div>
  );
}
