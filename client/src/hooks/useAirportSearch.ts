"use client";

import { useCallback } from "react";
import { searchAirportOptions } from "@/services/flights";
import type { ComboOption } from "@/components/ui/Combobox";

export function useAirportSearch() {
  return useCallback(async (q: string): Promise<ComboOption[]> => {
    const results = await searchAirportOptions(q);
    return results.map((a) => ({
      value: a.code,
      label: `${a.city} (${a.code})`,
      sublabel: a.name,
      badge: a.countryCode,
      group: a.countryCode === "IN" ? "India" : "International",
    }));
  }, []);
}
