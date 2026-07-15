// Mirrors server/src/models/partner/_shared/enums.ts INDIAN_STATES — keep in sync.
// Powers the "State" field on domestic itinerary-bearing listings (tour,
// tour_package, taxi_package, holiday), which drives state-wise browse categories.
export const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
] as const;
export type IndianState = (typeof INDIAN_STATES)[number];

// URL-safe slug for a state name, used by the /national-tour-packages/[state]
// browse-by-state route. Built off the fixed INDIAN_STATES list so slug <->
// state is a lossless round trip (no ambiguous-collision risk from freeform
// slugifying arbitrary strings).
const SLUG_TO_STATE = new Map<string, IndianState>(
  INDIAN_STATES.map((s) => [s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""), s]),
);

export function stateToSlug(state: string): string {
  return state.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function slugToState(slug: string): IndianState | undefined {
  return SLUG_TO_STATE.get(slug);
}
