"use client";

import { useCallback, useEffect, useState } from "react";
import { searchHotels, type Hotel, type HotelSearchInput } from "@/services/hotels";

type Status = "idle" | "loading" | "ready" | "error";

export function useHotelSearch(input: HotelSearchInput | null) {
  const [status, setStatus] = useState<Status>("idle");
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 0]);
  const [error, setError] = useState<Error | null>(null);

  const run = useCallback(async (i: HotelSearchInput) => {
    setStatus("loading");
    try {
      const { hotels, minPrice, maxPrice } = await searchHotels(i);
      setHotels(hotels);
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

  return { status, hotels, priceRange, error, refetch: () => input && run(input) };
}
