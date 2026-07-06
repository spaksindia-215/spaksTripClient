import { useState } from "react";
import type { HotelPreBookInfo } from "@/state/hotelBookingStore";

export interface PreBookResult {
  priceChanged: boolean;
  originalPrice: number;
  newPrice: number;
  priceChangeAmount: number;
  priceChangePercent: number;
  data: HotelPreBookInfo;
}

interface UsePreBookOptions {
  originalPrice: number;
}

interface UsePreBookState {
  loading: boolean;
  error: string | null;
  result: PreBookResult | null;
}

export function usePreBook(options: UsePreBookOptions) {
  const [state, setState] = useState<UsePreBookState>({
    loading: false,
    error: null,
    result: null,
  });

  const callPreBook = async (bookingCode: string): Promise<PreBookResult | null> => {
    setState({ loading: true, error: null, result: null });

    try {
      const response = await fetch("/api/hotels/prebook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingCode }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "PreBook failed");
      }

      const { data } = await response.json();

      // Get the first room from the response (pricing/name-length fields only —
      // PAN/passport requirements come from the top-level ValidationInfo below).
      const firstRoom = data.rooms?.[0];
      if (!firstRoom) {
        throw new Error("No room data in PreBook response");
      }

      // Detect price change
      const newPrice = firstRoom.netAmount || firstRoom.totalFare;
      const priceChanged = newPrice !== options.originalPrice;
      const priceChangeAmount = newPrice - options.originalPrice;
      const priceChangePercent = (priceChangeAmount / options.originalPrice) * 100;

      // ValidationInfo is the authoritative, top-level TBO node for PAN/passport
      // requirements — it must be used instead of any per-room flag.
      const validationInfo = data.validationInfo;

      const result: PreBookResult = {
        priceChanged,
        originalPrice: options.originalPrice,
        newPrice,
        priceChangeAmount,
        priceChangePercent,
        data: {
          bookingCode: firstRoom.bookingCode,
          inclusion: firstRoom.inclusion,
          roomPromotion: firstRoom.roomPromotion,
          cancelPolicies: firstRoom.cancelPolicies,
          rateConditions: data.rateConditions,
          netAmount: newPrice,
          panMandatory: validationInfo?.panMandatory ?? false,
          panCountRequired: validationInfo?.panCountRequired ?? 0,
          passportMandatory: validationInfo?.passportMandatory ?? false,
          corporateBookingAllowed: validationInfo?.corporateBookingAllowed ?? false,
          paxNameMinLength: firstRoom.paxNameMinLength,
          paxNameMaxLength: firstRoom.paxNameMaxLength,
        },
      };

      setState({ loading: false, error: null, result });
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "PreBook request failed";
      setState({ loading: false, error: errorMessage, result: null });
      return null;
    }
  };

  return {
    ...state,
    callPreBook,
  };
}
