import {
  searchAirports,
  searchCities,
  searchSightseeingCities,
} from "@/lib/mock/taxi";
import type {
  AirportTransferSearch,
  AirportTransferOffer,
  AirportCode,
  OutstationSearch,
  OutstationOffer,
  CityOption,
  SightseeingSearch,
  SightseeingPackage,
  SightseeingCity,
} from "@/lib/mock/taxi";

export async function searchAirportTransfers(s: AirportTransferSearch): Promise<AirportTransferOffer[]> {
  void s;
  return [];
}

export async function getAirportTransfer(id: string): Promise<AirportTransferOffer | null> {
  void id;
  return null;
}

export function searchAirportOptions(q: string): AirportCode[] {
  return searchAirports(q);
}

export async function searchOutstationOffers(s: OutstationSearch): Promise<OutstationOffer[]> {
  void s;
  return [];
}

export async function getOutstationOffer(id: string): Promise<OutstationOffer | null> {
  void id;
  return null;
}

export function searchCityOptions(q: string): CityOption[] {
  return searchCities(q);
}

export async function searchSightseeingPackages(s: SightseeingSearch): Promise<SightseeingPackage[]> {
  void s;
  return [];
}

export async function getSightseeingPackage(id: string): Promise<SightseeingPackage | null> {
  void id;
  return null;
}

export function searchSightseeingCityOptions(q: string): SightseeingCity[] {
  return searchSightseeingCities(q);
}
