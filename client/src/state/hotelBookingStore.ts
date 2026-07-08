"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Hotel, Room } from "@/lib/mock/hotels";
import type { ContactInfo } from "./bookingStore";

export type HotelGuest = {
  title: "Mr" | "Mrs" | "Ms"; // TBO requires Mr/Mrs/Ms only
  firstName: string; // 2-25 chars, no special characters
  lastName: string; // 2-25 chars, no special characters
  age?: number; // Optional; required for child passengers
  // Identity documents — required only when PreBook's ValidationInfo says so
  // (see HotelPreBookInfo.panMandatory / passportMandatory), never inferred
  // from nationality or destination.
  pan?: string; // This room's lead guest PAN
  // Extra PAN(s) for additional adults in this room, beyond the lead, needed
  // to satisfy PreBook's panCountRequired. Index 0 = 2nd adult in the room, etc.
  additionalAdultPans?: string[];
  passport?: string; // Required: Foreign nationals booking domestic hotels
  passportIssueDate?: string; // ISO format: YYYY-MM-DD
  passportExpDate?: string; // ISO format: YYYY-MM-DD
  // Corporate booking fields (when hotel allows corporate bookings)
  isCorporate?: boolean; // true = corporate booking, false = individual
  corporatePan?: string; // Required when isCorporate=true (10 chars: XXXXX9999X)
};

export type HotelPreBookInfo = {
  bookingCode: string;
  inclusion?: string;
  roomPromotion?: string[];
  cancelPolicies?: Array<{ index: string; fromDate: string; chargeType: string; cancellationCharge: number }>;
  rateConditions?: string[];
  // Mandatory supplements paid at hotel (may be in hotel's local currency)
  supplements?: Array<{ index: string; type: string; description: string; price: number; currency: string }>;
  netAmount: number;
  panMandatory: boolean;
  // Exact number of PANs TBO requires for this booking (0 when panMandatory is
  // false). Authoritative source: PreBook's top-level ValidationInfo node.
  // Missing on bookings persisted before this field existed — default to 0.
  panCountRequired: number;
  passportMandatory: boolean;
  corporateBookingAllowed: boolean; // TBO flag: whether corporate booking is allowed for this room
  paxNameMinLength: number;
  paxNameMaxLength: number;
  // Hold/Voucher deadlines from TBO PreBook
  lastVoucherDate?: string; // When voucher must be generated (for hold bookings)
  lastCancellationDeadline?: string; // When booking can no longer be cancelled
  // TBO PreBook.Rooms[].IsRefundable — non-refundable/restricted rates are
  // frequently rejected by TBO's Book API when IsVoucherBooking=false (Hold),
  // with "Booking Under Cancellation can only be vouchered". Used to hide the
  // Hold option for such rates so we never send a Hold request TBO will reject.
  isRefundable?: boolean;
};

export type HotelBooking = {
  id: string;
  hotel: Hotel;
  room: Room;
  checkIn: string;
  checkOut: string;
  nights: number;
  rooms: number;
  adults: number;
  children: number;
  childrenAges: number[];
  guests: HotelGuest[];
  contact: ContactInfo;
  addOns: { breakfast: boolean; insurance: boolean };
  totalPrice: number;
  taxes: number;
  status: "SELECTED" | "GUEST" | "PAYMENT" | "CONFIRMED";
  guestNationality: string;
  createdAt: string; // When booking started (Search was performed)
  confirmedAt?: string;
  bookingReference?: string;
  // Numeric TBO BookingId from the Book/Hold Book response — needed to call
  // GenerateVoucher or GetBookingDetail later. Optional for backward
  // compatibility with bookings persisted before this field existed.
  bookingId?: number;
  // PreBook data
  preBook?: HotelPreBookInfo;
  // Booking type: true = generate voucher immediately, false = hold booking
  isVoucherBooking?: boolean; // TBO Hold functionality: false = hold, true = voucher now
  // True once a voucher exists for this booking — either because Book itself
  // vouchered it (isVoucherBooking=true) or because the automatic post-Book
  // GenerateVoucher call succeeded for a Hold booking. Undefined means unknown
  // (e.g. Hold booking whose auto-voucher attempt failed or hasn't run yet).
  voucherStatus?: boolean;
  // Session management (TBO session valid for 40 minutes from Search)
  sessionStartedAt: string; // ISO timestamp when Search was performed
  sessionExpiresAt: string; // ISO timestamp when session expires (40 min from search)
};

type State = {
  current: HotelBooking | null;
  bookings: HotelBooking[];
};

type Actions = {
  startHotelBooking: (p: {
    hotel: Hotel;
    room: Room;
    checkIn: string;
    checkOut: string;
    rooms: number;
    adults: number;
    children: number;
    childrenAges: number[];
    guestNationality: string;
  }) => void;
  setGuests: (guests: HotelGuest[]) => void;
  setContact: (contact: ContactInfo) => void;
  setAddOns: (addOns: Partial<HotelBooking["addOns"]>) => void;
  setPreBook: (preBook: HotelPreBookInfo, netAmount: number) => void;
  confirm: (ref: string, bookingId?: number, voucherStatus?: boolean) => void;
  clearCurrent: () => void;
};

function computeHotelTotals(room: Room, nights: number, rooms: number, addOns: HotelBooking["addOns"]) {
  const base = room.basePrice * nights * rooms;
  const breakfastCost = addOns.breakfast ? 650 * nights * rooms : 0;
  const insuranceCost = addOns.insurance ? 499 : 0;
  const subtotal = base + breakfastCost + insuranceCost;
  const taxes = Math.round(subtotal * 0.12);
  return { subtotal, taxes, total: subtotal + taxes };
}

// Add-on cost only (no tax, no base fare) — used to adjust the PreBook-authoritative
// total without reintroducing the synthetic 12% tax or stale Search-time base price.
function computeAddOnCost(nights: number, rooms: number, addOns: HotelBooking["addOns"]) {
  const breakfastCost = addOns.breakfast ? 650 * nights * rooms : 0;
  const insuranceCost = addOns.insurance ? 499 : 0;
  return breakfastCost + insuranceCost;
}

function nightsBetween(checkIn: string, checkOut: string): number {
  const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime();
  return Math.max(1, Math.round(diff / 86400000));
}

export const useHotelBookingStore = create<State & Actions>()(
  persist(
    (set) => ({
      current: null,
      bookings: [],
      startHotelBooking: ({ hotel, room, checkIn, checkOut, rooms, adults, children, childrenAges, guestNationality }) => {
        // Validate room and occupancy restrictions
        // Max 8 adults and 4 children per room
        const adultsPerRoom = Math.ceil(adults / rooms);
        const childrenPerRoom = Math.ceil(children / rooms);

        if (adultsPerRoom > 8) {
          throw new Error("Maximum 8 adults allowed per room");
        }
        if (childrenPerRoom > 4) {
          throw new Error("Maximum 4 children allowed per room");
        }
        if (rooms > 6) {
          throw new Error("Maximum 6 rooms per booking");
        }

        const nights = nightsBetween(checkIn, checkOut);
        const addOns: HotelBooking["addOns"] = { breakfast: room.breakfast, insurance: false };
        const { taxes, total } = computeHotelTotals(room, nights, rooms, addOns);
        const now = new Date();
        const sessionExpiresAt = new Date(now.getTime() + 40 * 60 * 1000); // 40 minutes from now
        set({
          current: {
            id: `HTL-BK-${Date.now().toString(36)}`,
            hotel,
            room,
            checkIn,
            checkOut,
            nights,
            rooms,
            adults,
            children,
            childrenAges,
            guests: [],
            contact: { email: "", phone: "", countryCode: "+91" },
            addOns,
            totalPrice: total,
            taxes,
            status: "SELECTED",
            guestNationality,
            createdAt: now.toISOString(),
            sessionStartedAt: now.toISOString(),
            sessionExpiresAt: sessionExpiresAt.toISOString(),
          },
        });
      },
      setGuests: (guests) =>
        set((s) => (s.current ? { current: { ...s.current, guests, status: "GUEST" } } : s)),
      setContact: (contact) =>
        set((s) => (s.current ? { current: { ...s.current, contact } } : s)),
      setAddOns: (a) =>
        set((s) => {
          if (!s.current) return s;
          const addOns = { ...s.current.addOns, ...a };
          // Once PreBook has run, TBO's netAmount is the source of truth for the
          // base price. Only layer the explicit add-on cost on top of it — never
          // recompute from the stale Search-time room.basePrice or re-apply the
          // synthetic 12% tax.
          if (s.current.preBook) {
            const addOnCost = computeAddOnCost(s.current.nights, s.current.rooms, addOns);
            return {
              current: {
                ...s.current,
                addOns,
                taxes: 0,
                totalPrice: s.current.preBook.netAmount + addOnCost,
              },
            };
          }
          const { taxes, total } = computeHotelTotals(s.current.room, s.current.nights, s.current.rooms, addOns);
          return { current: { ...s.current, addOns, taxes, totalPrice: total } };
        }),
      setPreBook: (preBook, netAmount) =>
        set((s) => {
          if (!s.current) return s;
          // PreBook response contains the authoritative price from TBO
          // Use netAmount as the total (this is what TBO expects us to charge)
          const updatedTotal = netAmount ?? s.current.totalPrice;
          return {
            current: {
              ...s.current,
              preBook,
              totalPrice: updatedTotal,
              taxes: 0,  // Clear frontend-calculated taxes; TBO's price is authoritative
              status: "PAYMENT",
            },
          };
        }),
      confirm: (ref, bookingId, voucherStatus) =>
        set((s) => {
          if (!s.current) return s;
          const done: HotelBooking = {
            ...s.current,
            status: "CONFIRMED",
            confirmedAt: new Date().toISOString(),
            bookingReference: ref,
            ...(bookingId !== undefined ? { bookingId } : {}),
            ...(voucherStatus !== undefined ? { voucherStatus } : {}),
          };
          return { current: done, bookings: [done, ...s.bookings].slice(0, 30) };
        }),
      clearCurrent: () => set({ current: null }),
    }),
    {
      name: "spakstrip.hotel-bookings",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? window.localStorage : (undefined as unknown as Storage),
      ),
      partialize: (s) => ({ bookings: s.bookings, current: s.current }),
    },
  ),
);

export { computeHotelTotals, nightsBetween };
