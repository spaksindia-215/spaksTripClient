// Maps IATA city codes (used throughout the frontend) to TBO numeric CityId values.
// TBO hotel search requires a numeric CityId, not an IATA code.
//
// To expand this list: call TBO's GetCityList endpoint once and extract the
// relevant entries, then add them here.

export const CITY_CODE_TO_TBO_ID: Record<string, string> = {
  // India
  DEL: "130443", // New Delhi
  BOM: "130354", // Mumbai
  BLR: "126832", // Bangalore
  GOI: "128795", // Goa
  JAI: "129512", // Jaipur
  CCU: "127164", // Kolkata
  HYD: "129024", // Hyderabad
  COK: "127285", // Kochi
  SHL: "134500", // Shimla
  MNL: "131890", // Manali (approximate — verify with TBO GetCityList)
  UDR: "136200", // Udaipur
  AGR: "125620", // Agra
  // UAE
  DXB: "128905", // Dubai
  AUH: "125760", // Abu Dhabi
  // Southeast Asia
  SIN: "134046", // Singapore
  BKK: "126314", // Bangkok
  KUL: "131267", // Kuala Lumpur
  CMB: "127285", // Colombo
  // South Asia
  KTM: "130890", // Kathmandu
  // Europe
  CDG: "127225", // Paris
  LHR: "131450", // London
  FCO: "128020", // Rome
  BCN: "126180", // Barcelona
  IST: "129310", // Istanbul
  // Americas
  JFK: "129650", // New York
  LAX: "130980", // Los Angeles
  // Asia Pacific
  SYD: "135210", // Sydney
  NRT: "132400", // Tokyo
  ICN: "129200", // Seoul
  HKG: "128960", // Hong Kong
};

export function getTboCityId(iataCode: string): string | null {
  return CITY_CODE_TO_TBO_ID[iataCode.toUpperCase()] ?? null;
}
