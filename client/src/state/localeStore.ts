"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  getCountryLocale,
  DEFAULT_COUNTRY,
  type CountryLocale,
} from "@/lib/localeConfig";

type State = {
  country: string;
  language: string;
};

type Actions = {
  setCountry: (country: string) => void;
  setLanguage: (lang: string) => void;
};

export const useLocaleStore = create<State & Actions>()(
  persist(
    (set) => ({
      country: DEFAULT_COUNTRY,
      language: "English",
      setCountry: (country) => set({ country }),
      setLanguage: (lang) => set({ language: lang }),
    }),
    {
      name: "spakstrip.locale",
      storage: createJSONStorage(() =>
        typeof window !== "undefined"
          ? window.localStorage
          : (undefined as unknown as Storage),
      ),
    },
  ),
);

export function useCountryLocale(): CountryLocale {
  const country = useLocaleStore((s) => s.country);
  return getCountryLocale(country);
}
