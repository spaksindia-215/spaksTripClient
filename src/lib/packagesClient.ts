import { api } from "@/lib/api";

// Typed client for the public marketplace packages API (mirrors the server's
// toJSON output). Browsing + detail + enquiry submission are all unauthenticated
// (guests allowed); the enquiry is attributed to the user when a session cookie
// is present.

export type PackageKind =
  | "taxi"
  | "taxi_package"
  | "tour"
  | "tour_package"
  | "holiday"
  | "cruise"
  | "sightseeing"
  | "transfer"
  | "self_drive"
  | "islandhopper"
  | "visa"
  | "bundle";
export type PackageScope = "domestic" | "international";

// Mongoose model names a bundle component may link to (mirrors server enums).
export type ListingRefModel =
  | "TaxiListing"
  | "TourListing"
  | "HotelListing"
  | "SightseeingListing"
  | "TransferListing"
  | "SelfDriveListing"
  | "IslandhopperListing"
  | "VisaListing"
  | "CruiseListing"
  | "EventListing";

// One piece of a composite bundle. `ref`/`refModel` link to a partner's real listing;
// free-form pieces omit both.
export type PackageComponent = {
  category: string;
  refModel?: ListingRefModel;
  ref?: string;
  title: string;
  description?: string;
  quantity: number;
  included: boolean;
};

export type PackageImage = { url: string; caption?: string; isPrimary?: boolean };

export type PackageItineraryDay = {
  day: number;
  title?: string;
  description?: string;
  meals: { breakfast: boolean; lunch: boolean; dinner: boolean };
  accommodation?: string;
  activities: string[];
};

export type PackageSummary = {
  id: string;
  kind: PackageKind;
  scope: PackageScope;
  origin: "platform" | "partner";
  status: string;
  title: string;
  slug: string;
  thumbnail?: string;
  images: PackageImage[];
  description?: string;
  highlights: string[];
  tags: string[];
  route: { origin?: string; destinations: string[]; durationDays: number; durationNights: number };
  referencePrice?: number;
  currency: string;
  // Present in list responses too (toJSON returns the whole doc); typed loosely —
  // cast to PackageSightseeingSpecs (etc.) per kind.
  specs?: Record<string, unknown>;
  // Added by the list/catalog endpoints:
  operatorCount?: number;
  fromPrice?: number | null;
};

export type PackageDetail = PackageSummary & {
  itinerary: PackageItineraryDay[];
  components: PackageComponent[]; // populated only for kind "bundle"
  inclusions: string[];
  exclusions: string[];
  specs: Record<string, unknown>;
};

// Shape of `specs` when kind === "sightseeing" (mirrors validateSightseeingSpecs on
// the server / the partner SightseeingListing field set). All fields optional since
// specs is stored loosely and older/partial templates may omit any of them.
export type PackageSightseeingSpecs = {
  category?: string;
  location?: { island?: string; address?: string };
  meetingPoint?: { instructions?: string };
  duration?: { value?: number; unit?: string };
  difficulty?: string;
  ageRestriction?: { min?: number; max?: number };
  groupSize?: { min?: number; max?: number };
  whatToBring?: string[];
  pricingModel?: string;
  pricing?: { adult?: number; child?: number; infant?: number; groupPrice?: number };
  availableDays?: string[];
  timeSlots?: string[];
  blackoutDates?: string[];
  cancellationPolicy?: string;
  bookingCutoffHours?: number;
  languages?: string[];
  accessibility?: string[];
  termsAndConditions?: string;
  videoUrl?: string;
};

// Shape of `specs` per kind for the verticals whose admin template reuses the
// partner form's dynamic-row shape (mirrors tourForm.ts / tourPackageForm.ts /
// cruiseForm.ts / taxiPackageForm.ts, minus the fields lifted to the shared
// Package top level — title/description/highlights/tags/inclusions/exclusions/
// currency/route). All optional: specs is stored loosely.
export type PackageTourSpecs = {
  category?: string;
  languages?: string[];
  coordinates?: { lat?: number; lng?: number };
  durationHours?: number;
  itinerary?: { time?: string; title?: string; description?: string; location?: string; locationLat?: number; locationLng?: number }[];
  pricing?: { label: string; price: number; currency?: string; minAge?: number; maxAge?: number }[];
  pickupPoints?: { name?: string; time?: string }[];
  minGroupSize?: number;
  maxGroupSize?: number;
  privateAvailable?: boolean;
  privatePrice?: number;
  pickupIncluded?: boolean;
  operatingDays?: string[];
  startTimes?: string[];
  advanceBookingHrs?: number;
  blackoutDates?: string[];
  videoUrl?: string;
};

export type PackageTourPackageSpecs = {
  packageType?: string;
  difficultyLevel?: string;
  itinerary?: { day: number; title?: string; description?: string; meals?: { breakfast: boolean; lunch: boolean; dinner: boolean }; accommodation?: string; activities?: string[]; location?: { lat: number; lng: number; address?: string } }[];
  discounts?: { label: string; percent: number; validUntil?: string }[];
  departures?: { date: string; seatsTotal?: number; status?: string }[];
  pricing?: { basePrice?: number; perPerson?: boolean; maxPersons?: number; childPrice?: number; infantPrice?: number; extraPersonCharge?: number; singleSupplement?: number };
  videoUrl?: string;
};

export type PackageCruiseSpecs = {
  cruiseType?: string;
  vessel?: { name?: string; operator?: string; totalDecks?: number; builtYear?: number };
  stops?: { port?: string; arrivalTime?: string; departureTime?: string }[];
  cabins?: { type: string; label?: string; maxOccupancy?: number; pricePerPerson: number; totalCabins?: number; amenities?: string[]; isRefundable: boolean }[];
  shipAmenities?: string[];
  diningOptions?: string[];
  mealsIncluded?: { breakfast: boolean; lunch: boolean; dinner: boolean };
  departures?: { date: string; status?: string }[];
  cancellationPolicy?: { freeCancelDays?: number; chargePercent?: number };
  boardingAge?: { minAge?: number; maxAge?: number };
};

export type PackageTaxiPackageSpecs = {
  totalKm?: number;
  itinerary?: { day: number; title?: string; description?: string; activities?: string[]; distance?: number; overnight?: string }[];
  pricing?: { basePrice?: number; maxPersons?: number; extraPersonCharge?: number; tollsIncluded?: boolean; driverAllowance?: boolean; fuelIncluded?: boolean };
  startDates?: string[];
  blackoutDates?: string[];
  advanceBookingDays?: number;
};

export type OperatorContact = {
  name?: string;
  businessName?: string;
  phone?: string;
  email?: string;
  whatsapp?: string;
};

export type Operator = {
  id: string;
  name?: string;
  companyName?: string;
  slug?: string;
};

export type PackageOffer = {
  id: string;
  partner: Operator | string;
  price: number;
  currency: string;
  perPerson: boolean;
  pricingNote?: string;
  notes?: string;
  inclusionsOverride: string[];
  directContact?: OperatorContact; // present only when the operator chose to share it
  showDirectContact: boolean;
};

export type Pagination = { page: number; limit: number; total: number; totalPages: number };

export type EnquiryInput = {
  offerId: string;
  contact: { name: string; phone: string; email?: string };
  travelDate?: string;
  pax?: { adults: number; children: number; infants: number };
  message?: string;
};

function qs(params: Record<string, string | number | undefined>): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "" && v !== null) sp.set(k, String(v));
  }
  const s = sp.toString();
  return s ? `?${s}` : "";
}

export function listPackages(filters: {
  kind?: PackageKind;
  scope?: PackageScope;
  q?: string;
  destination?: string;
  page?: number;
  limit?: number;
} = {}): Promise<{ items: PackageSummary[]; pagination: Pagination }> {
  return api(`/api/packages${qs(filters)}`);
}

export function getPackage(slug: string): Promise<{ item: PackageDetail; offers: PackageOffer[] }> {
  return api(`/api/packages/${encodeURIComponent(slug)}`);
}

export function submitEnquiry(slug: string, input: EnquiryInput): Promise<{ item: { id: string } }> {
  return api(`/api/packages/${encodeURIComponent(slug)}/enquire`, {
    method: "POST",
    body: input,
  });
}

// Human label for a kind+scope combination (used in headings/badges).
export function kindLabel(kind: PackageKind, scope?: PackageScope): string {
  const base: Record<PackageKind, string> = {
    taxi: "Taxi",
    taxi_package: "Taxi Package",
    tour: "Tour",
    tour_package: "Tour Package",
    holiday: scope === "international" ? "International Holiday" : "Holiday",
    cruise: "Cruise",
    sightseeing: "Sightseeing",
    transfer: "Transfer",
    self_drive: "Self-Drive",
    islandhopper: "Islandhopper",
    visa: "Visa Consultancy",
    bundle: "Bundle",
  };
  return base[kind];
}
