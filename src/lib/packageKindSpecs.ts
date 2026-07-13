import type { PackageKind } from "@/lib/packagesClient";

// Per-kind spec fields for marketplace templates, matched field-for-field against
// what a partner fills in for that vertical (minus partner-identity/compliance
// fields — partner name/contact, RC book/insurance/license uploads, and "pick one
// of my own hotels/taxis/tours" references — which don't apply to an admin
// template since no partner is attached yet). Those vertical-specific fields ride
// in Package.specs; the shared top-level title/description/highlights/inclusions/
// exclusions/route/images cover what's common to all kinds.
//
// This flat config is used for the kinds whose partner form has no dynamic
// repeatable rows (taxi, transfer, self_drive, islandhopper, visa). It drives two
// surfaces so they never drift: the admin PackageTemplateModal (renders inputs)
// and the customer /packages/[slug] detail page (renders values).
//
// Sightseeing, tour, tour_package, cruise, and taxi_package are NOT here — they
// have dynamic rows (itinerary, cabins, pricing tiers, departures…) and instead
// reuse their actual partner form-state modules (sightseeingForm.ts, tourForm.ts,
// tourPackageForm.ts, cruiseForm.ts, taxiPackageForm.ts) directly for true parity.

export type KindSpecField =
  | { key: string; label: string; type: "text" | "textarea" | "number"; placeholder?: string }
  | { key: string; label: string; type: "csv"; placeholder?: string }
  | { key: string; label: string; type: "select"; options: { value: string; label: string }[] }
  | { key: string; label: string; type: "checklist"; options: string[] };

const CANCELLATION = [
  { value: "free_24h", label: "Free cancellation up to 24h" },
  { value: "free_48h", label: "Free cancellation up to 48h" },
  { value: "free_72h", label: "Free cancellation up to 72h" },
  { value: "non_refundable", label: "Non-refundable" },
  { value: "custom", label: "Custom (see terms)" },
];

export const PACKAGE_KIND_SPECS: Partial<Record<PackageKind, KindSpecField[]>> = {
  // Mirrors TaxiListingDraft (client/src/lib/taxiListing.ts) minus fullName/
  // mobileNumber/emailAddress/businessName/registrationNumber/rcBook/insurance/
  // pollutionCertificate/drivingLicense/acceptTerms (partner identity + compliance
  // docs — inapplicable pre-partner).
  taxi: [
    { key: "vehicleType", label: "Vehicle type", type: "select", options: [
      { value: "Sedan", label: "Sedan" }, { value: "SUV", label: "SUV" }, { value: "Hatchback", label: "Hatchback" },
      { value: "MUV", label: "MUV" }, { value: "Luxury", label: "Luxury" }, { value: "Tempo Traveller", label: "Tempo Traveller" },
    ] },
    { key: "brand", label: "Vehicle brand", type: "text", placeholder: "Toyota" },
    { key: "model", label: "Vehicle model", type: "text", placeholder: "Innova Crysta" },
    { key: "seatingCapacity", label: "Seating capacity", type: "number" },
    { key: "fuelType", label: "Fuel type", type: "select", options: [
      { value: "Petrol", label: "Petrol" }, { value: "Diesel", label: "Diesel" }, { value: "CNG", label: "CNG" },
      { value: "Electric", label: "Electric" }, { value: "Hybrid", label: "Hybrid" },
    ] },
    { key: "transmission", label: "Transmission", type: "select", options: [
      { value: "Manual", label: "Manual" }, { value: "Automatic", label: "Automatic" },
    ] },
    { key: "acAvailable", label: "AC available", type: "select", options: [{ value: "yes", label: "Yes" }, { value: "no", label: "No" }] },
    { key: "luggageCapacity", label: "Luggage capacity", type: "number" },
    { key: "yearOfManufacture", label: "Year of manufacture", type: "number" },
    { key: "operatingCity", label: "Operating city", type: "text" },
    { key: "serviceAreas", label: "Service areas", type: "csv", placeholder: "Delhi, Agra, Jaipur" },
    { key: "availableRoutes", label: "Available routes", type: "csv", placeholder: "Delhi–Agra, Delhi–Jaipur" },
    { key: "minimumFare", label: "Minimum fare (₹)", type: "number" },
    { key: "pricePerKm", label: "Price per km (₹)", type: "number" },
    { key: "driverIncluded", label: "Driver included", type: "select", options: [{ value: "yes", label: "Yes" }, { value: "no", label: "No" }] },
    { key: "selfDriveAvailable", label: "Self-drive available", type: "select", options: [{ value: "yes", label: "Yes" }, { value: "no", label: "No" }] },
    { key: "availableDays", label: "Available days", type: "checklist", options: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] },
    { key: "availableTimeSlots", label: "Available time slots", type: "checklist", options: ["06:00 - 10:00", "10:00 - 14:00", "14:00 - 18:00", "18:00 - 22:00", "22:00 - 06:00"] },
    { key: "amenities", label: "Amenities", type: "checklist", options: ["Wi-Fi", "Phone Charger", "Water Bottles", "Music System", "First Aid Kit", "Child Seat", "GPS Tracking", "Extra Legroom"] },
  ],
  // Matches the partner create form exactly (client/src/lib/serviceModules.ts →
  // SERVICE_MODULES.transfer.fields).
  transfer: [
    { key: "transferType", label: "Transfer type", type: "select", options: [
      { value: "airport_pickup", label: "Airport Pickup" }, { value: "airport_dropoff", label: "Airport Drop-off" },
      { value: "round_trip", label: "Round Trip" }, { value: "intercity", label: "Inter-city" }, { value: "harbour", label: "Harbour Transfer" },
    ] },
    { key: "coverageAreas", label: "Coverage areas", type: "csv", placeholder: "Malé Airport, Hulhumalé" },
    { key: "advanceBookingHours", label: "Advance booking (hours)", type: "number" },
    { key: "waitingTimePolicy", label: "Waiting time policy", type: "text" },
    { key: "cancellationPolicy", label: "Cancellation policy", type: "select", options: CANCELLATION },
  ],
  // Matches SERVICE_MODULES.self_drive.fields exactly.
  self_drive: [
    { key: "minRentalDays", label: "Minimum rental days", type: "number" },
    { key: "maxRentalDays", label: "Maximum rental days", type: "number" },
    { key: "lateReturnPolicy", label: "Late return policy", type: "text" },
    { key: "cancellationPolicy", label: "Cancellation policy", type: "select", options: CANCELLATION },
  ],
  // Matches SERVICE_MODULES.islandhopper.fields exactly.
  islandhopper: [
    { key: "serviceType", label: "Service type", type: "select", options: [
      { value: "domestic_flight", label: "Domestic Flight" }, { value: "seaplane", label: "Seaplane" },
      { value: "speedboat", label: "Speedboat" }, { value: "ferry", label: "Ferry" }, { value: "yacht_charter", label: "Yacht Charter" },
    ] },
    { key: "departurePoint", label: "Departure point", type: "text" },
    { key: "checkinPolicy", label: "Check-in policy", type: "text" },
    { key: "weatherRestrictions", label: "Weather / seasonal restrictions", type: "text" },
    { key: "cancellationPolicy", label: "Cancellation policy", type: "select", options: CANCELLATION },
  ],
  // Matches SERVICE_MODULES.visa.fields exactly.
  visa: [
    { key: "licenceNumber", label: "Licence / registration number", type: "text" },
    { key: "countriesCovered", label: "Countries covered", type: "csv", placeholder: "Canada, Australia" },
    { key: "visaTypesOffered", label: "Visa types offered", type: "csv", placeholder: "pr, work, study, visit" },
    { key: "languages", label: "Languages", type: "csv" },
    { key: "consultationModes", label: "Consultation modes", type: "csv", placeholder: "in_person, video, phone, email" },
  ],
  // No dedicated partner "Holiday" listing type exists — holidays are always
  // marketplace packages (bundles of tour/taxi packages), so there is no partner
  // form to match here; no vertical-specific fields.
};

// Human-readable label for a stored spec value (used on the detail page). Resolves
// select codes back to their label; passes text/number/csv/checklist through.
export function specDisplayValue(field: KindSpecField, raw: unknown): string {
  if (raw == null || raw === "") return "";
  if (field.type === "csv" || field.type === "checklist") return Array.isArray(raw) ? raw.join(", ") : String(raw);
  if (field.type === "select") return field.options.find((o) => o.value === raw)?.label ?? String(raw);
  return String(raw);
}
