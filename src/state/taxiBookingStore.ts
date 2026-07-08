"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { AirportTransferOffer, AirportTransferSearch, OutstationOffer, OutstationSearch, SightseeingPackage, SightseeingSearch } from "@/lib/mock/taxi";

// ─── Airport Transfer ─────────────────────────────────────────────────────────

export type TransferAddOns = {
  meetGreet: boolean;
  childSeat: boolean;
  flightDelayProtection: boolean;
};

export type TransferPassenger = {
  name: string;
  phone: string;
  email: string;
  address: string;
};

export type AirportTransferBooking = {
  id: string;
  offer: AirportTransferOffer;
  search: AirportTransferSearch;
  addOns: TransferAddOns;
  passenger: TransferPassenger;
  totalPrice: number;
  taxes: number;
  status: "PASSENGER" | "PAYMENT" | "CONFIRMED";
  createdAt: string;
  confirmedAt?: string;
  bookingReference?: string;
};

// ─── Outstation ───────────────────────────────────────────────────────────────

export type OutstationPassenger = {
  name: string;
  phone: string;
  email: string;
  pickupAddress: string;
};

export type OutstationBooking = {
  id: string;
  offer: OutstationOffer;
  search: OutstationSearch;
  passenger: OutstationPassenger;
  totalPrice: number;
  taxes: number;
  status: "PASSENGER" | "PAYMENT" | "CONFIRMED";
  createdAt: string;
  confirmedAt?: string;
  bookingReference?: string;
};

// ─── Sightseeing ──────────────────────────────────────────────────────────────

export type SightseeingAddOns = {
  privateGuide: boolean;
};

export type SightseeingTraveler = {
  name: string;
};

export type SightseeingContact = {
  name: string;
  phone: string;
  email: string;
};

export type SightseeingBooking = {
  id: string;
  pkg: SightseeingPackage;
  search: SightseeingSearch;
  travelers: SightseeingTraveler[];
  contact: SightseeingContact;
  addOns: SightseeingAddOns;
  totalPrice: number;
  taxes: number;
  status: "PASSENGER" | "PAYMENT" | "CONFIRMED";
  createdAt: string;
  confirmedAt?: string;
  bookingReference?: string;
};

// ─── Store ────────────────────────────────────────────────────────────────────

type State = {
  currentTransfer: AirportTransferBooking | null;
  currentOutstation: OutstationBooking | null;
  currentSightseeing: SightseeingBooking | null;
  transfers: AirportTransferBooking[];
  outstations: OutstationBooking[];
  sightseeings: SightseeingBooking[];
};

type Actions = {
  startTransferBooking: (offer: AirportTransferOffer, search: AirportTransferSearch) => void;
  setTransferPassenger: (p: TransferPassenger) => void;
  setTransferAddOns: (a: TransferAddOns) => void;
  confirmTransfer: (ref: string) => void;
  clearCurrentTransfer: () => void;

  startOutstationBooking: (offer: OutstationOffer, search: OutstationSearch) => void;
  setOutstationPassenger: (p: OutstationPassenger) => void;
  confirmOutstation: (ref: string) => void;
  clearCurrentOutstation: () => void;

  startSightseeingBooking: (pkg: SightseeingPackage, search: SightseeingSearch) => void;
  setSightseeingTravelers: (travelers: SightseeingTraveler[]) => void;
  setSightseeingContact: (contact: SightseeingContact) => void;
  setSightseeingAddOns: (addOns: SightseeingAddOns) => void;
  confirmSightseeing: (ref: string) => void;
  clearCurrentSightseeing: () => void;
};

function calcTaxes(price: number) {
  return Math.round(price * 0.05);
}

export const useTaxiBookingStore = create<State & Actions>()(
  persist(
    (set) => ({
      currentTransfer: null,
      currentOutstation: null,
      currentSightseeing: null,
      transfers: [],
      outstations: [],
      sightseeings: [],

      startTransferBooking: (offer, search) => {
        const addOnTotal =
          (offer.meetGreetFee > 0 ? 0 : 0); // starts at zero, addOns not selected yet
        const taxes = calcTaxes(offer.baseFare);
        set({
          currentTransfer: {
            id: `TRF-${Date.now().toString(36)}`,
            offer,
            search,
            addOns: { meetGreet: false, childSeat: false, flightDelayProtection: false },
            passenger: { name: "", phone: "", email: "", address: "" },
            totalPrice: offer.baseFare + taxes,
            taxes,
            status: "PASSENGER",
            createdAt: new Date().toISOString(),
          },
        });
      },
      setTransferPassenger: (passenger) =>
        set((s) => (s.currentTransfer ? { currentTransfer: { ...s.currentTransfer, passenger } } : s)),
      setTransferAddOns: (addOns) =>
        set((s) => {
          if (!s.currentTransfer) return s;
          const extra =
            (addOns.meetGreet ? s.currentTransfer.offer.meetGreetFee : 0) +
            (addOns.childSeat ? s.currentTransfer.offer.childSeatFee : 0) +
            (addOns.flightDelayProtection ? s.currentTransfer.offer.flightDelayProtection : 0);
          const taxes = calcTaxes(s.currentTransfer.offer.baseFare + extra);
          return {
            currentTransfer: {
              ...s.currentTransfer,
              addOns,
              totalPrice: s.currentTransfer.offer.baseFare + extra + taxes,
              taxes,
            },
          };
        }),
      confirmTransfer: (ref) =>
        set((s) => {
          if (!s.currentTransfer) return s;
          const done: AirportTransferBooking = {
            ...s.currentTransfer,
            status: "CONFIRMED",
            confirmedAt: new Date().toISOString(),
            bookingReference: ref,
          };
          return { currentTransfer: done, transfers: [done, ...s.transfers].slice(0, 30) };
        }),
      clearCurrentTransfer: () => set({ currentTransfer: null }),

      startOutstationBooking: (offer, search) => {
        const taxes = calcTaxes(offer.estimatedFare);
        set({
          currentOutstation: {
            id: `OUT-${Date.now().toString(36)}`,
            offer,
            search,
            passenger: { name: "", phone: "", email: "", pickupAddress: "" },
            totalPrice: offer.estimatedFare + taxes,
            taxes,
            status: "PASSENGER",
            createdAt: new Date().toISOString(),
          },
        });
      },
      setOutstationPassenger: (passenger) =>
        set((s) => (s.currentOutstation ? { currentOutstation: { ...s.currentOutstation, passenger } } : s)),
      confirmOutstation: (ref) =>
        set((s) => {
          if (!s.currentOutstation) return s;
          const done: OutstationBooking = {
            ...s.currentOutstation,
            status: "CONFIRMED",
            confirmedAt: new Date().toISOString(),
            bookingReference: ref,
          };
          return { currentOutstation: done, outstations: [done, ...s.outstations].slice(0, 30) };
        }),
      clearCurrentOutstation: () => set({ currentOutstation: null }),

      startSightseeingBooking: (pkg, search) => {
        const base = pkg.pricePerPerson * search.pax;
        const taxes = calcTaxes(base);
        set({
          currentSightseeing: {
            id: `SIG-${Date.now().toString(36)}`,
            pkg,
            search,
            travelers: Array.from({ length: search.pax }, () => ({ name: "" })),
            contact: { name: "", phone: "", email: "" },
            addOns: { privateGuide: false },
            totalPrice: base + taxes,
            taxes,
            status: "PASSENGER",
            createdAt: new Date().toISOString(),
          },
        });
      },
      setSightseeingTravelers: (travelers) =>
        set((s) => (s.currentSightseeing ? { currentSightseeing: { ...s.currentSightseeing, travelers } } : s)),
      setSightseeingContact: (contact) =>
        set((s) => (s.currentSightseeing ? { currentSightseeing: { ...s.currentSightseeing, contact } } : s)),
      setSightseeingAddOns: (addOns) =>
        set((s) => {
          if (!s.currentSightseeing) return s;
          const guideFee = addOns.privateGuide ? 800 : 0;
          const base = s.currentSightseeing.pkg.pricePerPerson * s.currentSightseeing.search.pax;
          const taxes = calcTaxes(base + guideFee);
          return {
            currentSightseeing: {
              ...s.currentSightseeing,
              addOns,
              totalPrice: base + guideFee + taxes,
              taxes,
            },
          };
        }),
      confirmSightseeing: (ref) =>
        set((s) => {
          if (!s.currentSightseeing) return s;
          const done: SightseeingBooking = {
            ...s.currentSightseeing,
            status: "CONFIRMED",
            confirmedAt: new Date().toISOString(),
            bookingReference: ref,
          };
          return { currentSightseeing: done, sightseeings: [done, ...s.sightseeings].slice(0, 30) };
        }),
      clearCurrentSightseeing: () => set({ currentSightseeing: null }),
    }),
    {
      name: "spakstrip.taxi-bookings",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? window.localStorage : (undefined as unknown as Storage),
      ),
      partialize: (s) => ({
        transfers: s.transfers,
        outstations: s.outstations,
        sightseeings: s.sightseeings,
        currentTransfer: s.currentTransfer,
        currentOutstation: s.currentOutstation,
        currentSightseeing: s.currentSightseeing,
      }),
    },
  ),
);
