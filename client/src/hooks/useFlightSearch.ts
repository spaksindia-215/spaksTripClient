"use client";

import { useCallback, useEffect, useState } from "react";
import { searchFlights, type FlightOffer } from "@/services/flights";
import type { FlightSearchInput } from "@/lib/mock/flights";

type Status = "idle" | "loading" | "ready" | "error";

export function useFlightSearch(input: FlightSearchInput | null) {
  const [status, setStatus] = useState<Status>("idle");
  const [offers, setOffers] = useState<FlightOffer[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 0]);
  const [error, setError] = useState<Error | null>(null);

  const run = useCallback(async (i: FlightSearchInput) => {
    setStatus("loading");
    try {
      const { offers, minPrice, maxPrice } = await searchFlights(i);
      setOffers(offers);
      setPriceRange([
        Number.isFinite(minPrice) ? Math.floor(minPrice) : 0,
        Number.isFinite(maxPrice) ? Math.ceil(maxPrice) : 0,
      ]);
      setStatus("ready");
    } catch (e) {
      setError(e as Error);
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    if (!input) return;
    run(input);
  }, [input, run]);

  return { status, offers, priceRange, error, refetch: () => input && run(input) };
}
