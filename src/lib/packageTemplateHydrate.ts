import type { AdminPackageDetail } from "@/lib/adminClient";
import type {
  HolidayPackageApi,
  TaxiPackageApi,
  TourPackageApi,
  TourListingApi,
  CruiseListingApi,
  SightseeingListingApi,
} from "@/lib/partnerClient";
import { holidayPackageFormFromApi, type HolidayPackageFormState } from "@/lib/holidayPackageForm";
import { taxiPackageFormFromApi, type TaxiPackageFormState } from "@/lib/taxiPackageForm";
import { tourPackageFormFromApi, type TourPackageFormState } from "@/lib/tourPackageForm";
import { tourFormFromApi, type TourFormState } from "@/lib/tourForm";
import { cruiseFormFromApi, type CruiseFormState } from "@/lib/cruiseForm";
import { sightseeingFormFromApi, type SightseeingFormState } from "@/lib/sightseeingForm";
import type { KindSpecField } from "@/lib/packageKindSpecs";

// Reverse of PackageTemplateModal's create-time `save()`: rebuilds each kind's
// form state from a stored marketplace Package so the superadmin edit form
// prefills. The vertical-specific block lives in `pkg.specs` in the SAME shape
// each form's buildFormData payload produced, so the cleanest inverse is to
// reshape the stored package back into that kind's partner-API type and reuse the
// already-tested `xxxFormFromApi` hydrator. (Tour is the one shape mismatch — its
// API type carries GeoJSON points while the stored specs are flat lat/lng, so we
// wrap them back into GeoJSON here.)

type Specs = Record<string, unknown>;

function specs(p: AdminPackageDetail): Specs {
  return (p.specs ?? {}) as Specs;
}
function strArr(v: unknown): string[] {
  return Array.isArray(v) ? (v.filter((x) => typeof x === "string") as string[]) : [];
}
function anyArr(v: unknown): unknown[] {
  return Array.isArray(v) ? v : [];
}
function obj(v: unknown): Record<string, unknown> {
  return v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : {};
}
function str(v: unknown): string | undefined {
  return typeof v === "string" ? v : undefined;
}
function status(p: AdminPackageDetail): "active" | "draft" {
  return p.status === "active" ? "active" : "draft";
}

export function holidayFormFromPackage(p: AdminPackageDetail): HolidayPackageFormState {
  const s = specs(p);
  const api = {
    title: p.title,
    status: status(p),
    packageType: str(s.packageType) ?? "group",
    description: p.description,
    highlights: p.highlights ?? [],
    tags: p.tags ?? [],
    state: p.state,
    route: {
      origin: p.route.origin,
      originLocation: s.originLocation,
      destinations: p.route.destinations,
      destinationLocation: s.destinationLocation,
      durationDays: p.route.durationDays,
      durationNights: p.route.durationNights,
    },
    includes: { taxi: undefined, hotels: [], tours: [] },
    customInclusions: p.inclusions ?? [],
    exclusions: p.exclusions ?? [],
    itinerary: anyArr(s.itinerary),
    roomTiers: anyArr(s.roomTiers),
    currency: p.currency ?? "INR",
    singleSupplement: s.singleSupplement,
    discounts: anyArr(s.discounts),
    departures: anyArr(s.departures),
    videoUrl: s.videoUrl,
  } as unknown as HolidayPackageApi;
  return holidayPackageFormFromApi(api);
}

export function taxiPackageFormFromPackage(p: AdminPackageDetail): TaxiPackageFormState {
  const s = specs(p);
  const pr = obj(s.pricing);
  const api = {
    title: p.title,
    status: status(p),
    state: p.state,
    route: {
      origin: p.route.origin ?? "",
      originLocation: s.originLocation,
      destinations: p.route.destinations,
      totalKm: s.totalKm,
      durationDays: p.route.durationDays,
      durationNights: p.route.durationNights,
    },
    itinerary: anyArr(s.itinerary),
    pricing: {
      basePrice: Number(pr.basePrice ?? p.referencePrice ?? 0),
      currency: p.currency ?? "INR",
      maxPersons: pr.maxPersons,
      extraPersonCharge: pr.extraPersonCharge,
      tollsIncluded: Boolean(pr.tollsIncluded),
      driverAllowance: pr.driverAllowance !== false,
      fuelIncluded: pr.fuelIncluded !== false,
    },
    inclusions: p.inclusions ?? [],
    exclusions: p.exclusions ?? [],
    startDates: strArr(s.startDates),
    blackoutDates: strArr(s.blackoutDates),
    advanceBookingDays: Number(s.advanceBookingDays ?? 3),
    description: p.description,
    highlights: p.highlights ?? [],
    tags: p.tags ?? [],
  } as unknown as TaxiPackageApi;
  return taxiPackageFormFromApi(api);
}

export function tourPackageFormFromPackage(p: AdminPackageDetail): TourPackageFormState {
  const s = specs(p);
  const pr = obj(s.pricing);
  const api = {
    title: p.title,
    status: status(p),
    packageType: str(s.packageType) ?? "group",
    difficultyLevel: s.difficultyLevel,
    description: p.description,
    highlights: p.highlights ?? [],
    tags: p.tags ?? [],
    state: p.state,
    route: {
      origin: p.route.origin,
      destinations: p.route.destinations,
      durationDays: p.route.durationDays,
      durationNights: p.route.durationNights,
    },
    includes: { taxi: undefined, hotels: [], tours: [] },
    customInclusions: p.inclusions ?? [],
    exclusions: p.exclusions ?? [],
    itinerary: anyArr(s.itinerary),
    pricing: {
      basePrice: Number(pr.basePrice ?? p.referencePrice ?? 0),
      currency: p.currency ?? "INR",
      perPerson: pr.perPerson !== false,
      maxPersons: pr.maxPersons,
      childPrice: pr.childPrice,
      infantPrice: Number(pr.infantPrice ?? 0),
      extraPersonCharge: pr.extraPersonCharge,
      singleSupplement: pr.singleSupplement,
      discounts: anyArr(s.discounts),
    },
    departures: anyArr(s.departures),
    videoUrl: s.videoUrl,
  } as unknown as TourPackageApi;
  return tourPackageFormFromApi(api);
}

export function tourFormFromPackage(p: AdminPackageDetail): TourFormState {
  const s = specs(p);
  // The stored specs are flat lat/lng (buildTourFormData payload); the API type
  // (what tourFormFromApi reads) uses GeoJSON [lng, lat] — wrap them back.
  const geo = (lat: unknown, lng: unknown) =>
    lat != null && lng != null && lat !== "" && lng !== ""
      ? { type: "Point", coordinates: [Number(lng), Number(lat)] }
      : undefined;
  const api = {
    title: p.title,
    status: status(p),
    category: str(s.category) ?? "",
    description: p.description,
    highlights: p.highlights ?? [],
    tags: p.tags ?? [],
    languages: strArr(s.languages),
    basedIn: p.route.origin ?? "",
    coversCities: p.route.destinations,
    state: p.state,
    coordinates: geo(s.latitude, s.longitude),
    durationHours: s.durationHours,
    durationDays: p.route.durationDays,
    durationNights: p.route.durationNights,
    itinerary: anyArr(s.itinerary).map((raw) => {
      const it = obj(raw);
      return {
        time: it.time,
        title: it.title,
        description: it.description,
        location: it.location,
        coordinates: geo(it.locationLat, it.locationLng),
      };
    }),
    pricing: anyArr(s.pricing).map((raw) => {
      const t = obj(raw);
      return {
        label: t.label,
        price: t.price,
        currency: str(t.currency) ?? p.currency ?? "INR",
        minAge: t.minAge,
        maxAge: t.maxAge,
      };
    }),
    pickupPoints: anyArr(s.pickupPoints),
    minGroupSize: Number(s.minGroupSize ?? 1),
    maxGroupSize: s.maxGroupSize,
    privateAvailable: Boolean(s.privateAvailable),
    privatePrice: s.privatePrice,
    inclusions: p.inclusions ?? [],
    exclusions: p.exclusions ?? [],
    pickupIncluded: Boolean(s.pickupIncluded),
    operatingDays: strArr(s.operatingDays),
    startTimes: strArr(s.startTimes),
    advanceBookingHrs: Number(s.advanceBookingHrs ?? 12),
    blackoutDates: strArr(s.blackoutDates),
    videoUrl: s.videoUrl,
  } as unknown as TourListingApi;
  return tourFormFromApi(api);
}

export function cruiseFormFromPackage(p: AdminPackageDetail): CruiseFormState {
  const s = specs(p);
  const currency = p.currency ?? "INR";
  const api = {
    cruiseName: p.title,
    status: status(p),
    cruiseType: str(s.cruiseType) ?? "",
    description: p.description,
    highlights: p.highlights ?? [],
    tags: p.tags ?? [],
    vessel: obj(s.vessel),
    route: {
      departurePort: p.route.origin ?? "",
      arrivalPort: p.route.destinations[0],
      durationDays: p.route.durationDays,
      durationNights: p.route.durationNights,
      stops: anyArr(s.stops),
    },
    // Cabins store their price but not currency (lifted to the package); re-attach
    // so cruiseFormFromApi can read cabins[0].currency.
    cabins: anyArr(s.cabins).map((raw) => ({ ...obj(raw), currency })),
    shipAmenities: strArr(s.shipAmenities),
    diningOptions: strArr(s.diningOptions),
    mealsIncluded: { breakfast: false, lunch: false, dinner: false, ...obj(s.mealsIncluded) },
    departures: anyArr(s.departures),
    cancellationPolicy: obj(s.cancellationPolicy),
    boardingAge: obj(s.boardingAge),
  } as unknown as CruiseListingApi;
  return cruiseFormFromApi(api);
}

export function sightseeingFormFromPackage(p: AdminPackageDetail): SightseeingFormState {
  const s = specs(p);
  const api = {
    title: p.title,
    status: status(p),
    category: str(s.category) ?? "",
    location: obj(s.location),
    meetingPoint: obj(s.meetingPoint),
    description: p.description,
    highlights: p.highlights ?? [],
    tags: p.tags ?? [],
    languages: strArr(s.languages),
    accessibility: strArr(s.accessibility),
    duration: obj(s.duration),
    difficulty: s.difficulty,
    ageRestriction: obj(s.ageRestriction),
    groupSize: obj(s.groupSize),
    pricingModel: str(s.pricingModel) ?? "per_person",
    currency: p.currency ?? "INR",
    pricing: obj(s.pricing),
    inclusions: p.inclusions ?? [],
    exclusions: p.exclusions ?? [],
    whatToBring: strArr(s.whatToBring),
    availableDays: strArr(s.availableDays),
    timeSlots: strArr(s.timeSlots),
    cancellationPolicy: str(s.cancellationPolicy) ?? "free_24h",
    bookingCutoffHours: Number(s.bookingCutoffHours ?? 24),
    termsAndConditions: s.termsAndConditions,
    videoUrl: s.videoUrl,
  } as unknown as SightseeingListingApi;
  return sightseeingFormFromApi(api);
}

// ── Flat-config kinds (taxi, transfer, self_drive, islandhopper, visa) ──────────
// The inverse of buildFlatSpecs: pull each field back out of pkg.specs into the
// text-input map (`values`) and checklist map (`checklists`).
export function flatSpecsFromPackage(
  p: AdminPackageDetail,
  fields: KindSpecField[],
): { values: Record<string, string>; checklists: Record<string, string[]> } {
  const s = specs(p);
  const values: Record<string, string> = {};
  const checklists: Record<string, string[]> = {};
  for (const f of fields) {
    const raw = s[f.key];
    if (raw == null) continue;
    if (f.type === "checklist") {
      checklists[f.key] = strArr(raw);
    } else if (f.type === "csv") {
      values[f.key] = Array.isArray(raw) ? strArr(raw).join(", ") : String(raw);
    } else {
      values[f.key] = String(raw);
    }
  }
  return { values, checklists };
}

// Shared top-level fields for the generic (flat/no-vertical) create branch.
export function genericFieldsFromPackage(p: AdminPackageDetail): {
  title: string;
  destinations: string;
  days: string;
  nights: string;
  description: string;
  highlights: string;
  inclusions: string;
  exclusions: string;
  price: string;
} {
  return {
    title: p.title,
    destinations: p.route.destinations.join(", "),
    days: String(p.route.durationDays),
    nights: String(p.route.durationNights),
    description: p.description ?? "",
    highlights: (p.highlights ?? []).join("\n"),
    inclusions: (p.inclusions ?? []).join("\n"),
    exclusions: (p.exclusions ?? []).join("\n"),
    price: p.referencePrice != null ? String(p.referencePrice) : "",
  };
}
