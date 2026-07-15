import type { HolidayPackageApi } from "@/lib/partnerClient";

// Form-state shape + mappers for the dedicated HolidayPackage manager. Mirrors
// tourPackageForm.ts closely — itinerary (with meal checkboxes), discounts, and
// departures are dynamic rows; includes are id selections. The one structural
// difference: pricing is a set of room-tier rows (roomType × mealPlan × price),
// the way real OTA holiday packages (MakeMyTrip, Yatra, Cleartrip) price a
// listing, instead of one flat price.

export const PACKAGE_TYPES = ["fit", "group", "honeymoon", "family", "corporate", "pilgrimage"] as const;
export const DEPARTURE_STATUS = ["open", "filling_fast", "closed", "cancelled"] as const;
export const PACKAGE_CURRENCIES = ["INR", "USD", "EUR", "AED", "GBP"] as const;
export const HOLIDAY_ROOM_TYPES = ["standard", "deluxe", "super_deluxe", "premium", "luxury", "suite"] as const;
export const HOLIDAY_MEAL_PLANS = ["room_only", "breakfast", "half_board", "full_board", "all_inclusive"] as const;

export type PackageItineraryRow = {
  day: string;
  title: string;
  description: string;
  breakfast: boolean;
  lunch: boolean;
  dinner: boolean;
  accommodation: string;
  activities: string;
  locationLat: string;
  locationLng: string;
  locationAddress: string;
};
export type PackageDiscountRow = { label: string; percent: string; validUntil: string };
export type PackageDepartureRow = { date: string; seatsTotal: string; status: string };
export type RoomTierRow = {
  roomType: string;
  mealPlan: string;
  price: string;
  maxOccupancy: string;
  childPrice: string;
  extraBedPrice: string;
};

export type HolidayPackageFormState = {
  title: string;
  status: "draft" | "active";
  packageType: string;
  description: string;
  highlights: string;
  tags: string;
  state: string;
  // route
  origin: string;
  // Pin-dropped start/end of the route — the customer-facing route map begins at
  // the origin pin and ends at the destination pin, connected through the
  // itinerary day pins.
  originLat: string;
  originLng: string;
  originAddress: string;
  destinations: string;
  destinationLat: string;
  destinationLng: string;
  destinationAddress: string;
  durationDays: string;
  durationNights: string;
  // includes
  includeTaxi: string;
  includeHotels: string[];
  includeTours: string[];
  customInclusions: string;
  exclusions: string;
  // dynamic
  itinerary: PackageItineraryRow[];
  roomTiers: RoomTierRow[];
  discounts: PackageDiscountRow[];
  departures: PackageDepartureRow[];
  // pricing
  currency: string;
  singleSupplement: string;
  // media
  videoUrl: string;
};

export type HolidayPackageFiles = { thumbnail: File | null; images: File[] };

export function emptyItineraryRow(day: number): PackageItineraryRow {
  return { day: String(day), title: "", description: "", breakfast: false, lunch: false, dinner: false, accommodation: "", activities: "", locationLat: "", locationLng: "", locationAddress: "" };
}

export function emptyRoomTierRow(): RoomTierRow {
  return { roomType: "standard", mealPlan: "breakfast", price: "", maxOccupancy: "2", childPrice: "", extraBedPrice: "" };
}

export function emptyHolidayPackageForm(): HolidayPackageFormState {
  return {
    title: "",
    status: "draft",
    packageType: "group",
    description: "",
    highlights: "",
    tags: "",
    state: "",
    origin: "",
    originLat: "",
    originLng: "",
    originAddress: "",
    destinations: "",
    destinationLat: "",
    destinationLng: "",
    destinationAddress: "",
    durationDays: "1",
    durationNights: "0",
    includeTaxi: "",
    includeHotels: [],
    includeTours: [],
    customInclusions: "",
    exclusions: "",
    itinerary: [emptyItineraryRow(1)],
    roomTiers: [emptyRoomTierRow()],
    discounts: [],
    departures: [],
    currency: "INR",
    singleSupplement: "",
    videoUrl: "",
  };
}

function toCsv(arr: string[]): string {
  return arr.join(", ");
}
function isoDate(value: string): string {
  return value.length >= 10 ? value.slice(0, 10) : value;
}

export function holidayPackageFormFromApi(pkg: HolidayPackageApi): HolidayPackageFormState {
  return {
    title: pkg.title,
    status: pkg.status === "active" ? "active" : "draft",
    packageType: pkg.packageType,
    description: pkg.description ?? "",
    highlights: toCsv(pkg.highlights),
    tags: toCsv(pkg.tags),
    state: pkg.state ?? "",
    origin: pkg.route.origin ?? "",
    originLat: pkg.route.originLocation ? String(pkg.route.originLocation.lat) : "",
    originLng: pkg.route.originLocation ? String(pkg.route.originLocation.lng) : "",
    originAddress: pkg.route.originLocation?.address ?? "",
    destinations: toCsv(pkg.route.destinations),
    destinationLat: pkg.route.destinationLocation ? String(pkg.route.destinationLocation.lat) : "",
    destinationLng: pkg.route.destinationLocation ? String(pkg.route.destinationLocation.lng) : "",
    destinationAddress: pkg.route.destinationLocation?.address ?? "",
    durationDays: String(pkg.route.durationDays),
    durationNights: String(pkg.route.durationNights),
    includeTaxi: pkg.includes.taxi ?? "",
    includeHotels: pkg.includes.hotels,
    includeTours: pkg.includes.tours,
    customInclusions: toCsv(pkg.customInclusions),
    exclusions: toCsv(pkg.exclusions),
    itinerary:
      pkg.itinerary.length > 0
        ? pkg.itinerary.map((d) => ({
            day: String(d.day),
            title: d.title ?? "",
            description: d.description ?? "",
            breakfast: d.meals.breakfast,
            lunch: d.meals.lunch,
            dinner: d.meals.dinner,
            accommodation: d.accommodation ?? "",
            activities: toCsv(d.activities),
            locationLat: d.location ? String(d.location.lat) : "",
            locationLng: d.location ? String(d.location.lng) : "",
            locationAddress: d.location?.address ?? "",
          }))
        : [emptyItineraryRow(1)],
    roomTiers:
      pkg.roomTiers.length > 0
        ? pkg.roomTiers.map((t) => ({
            roomType: t.roomType,
            mealPlan: t.mealPlan,
            price: String(t.price),
            maxOccupancy: String(t.maxOccupancy),
            childPrice: t.childPrice !== undefined ? String(t.childPrice) : "",
            extraBedPrice: t.extraBedPrice !== undefined ? String(t.extraBedPrice) : "",
          }))
        : [emptyRoomTierRow()],
    discounts: pkg.discounts.map((d) => ({
      label: d.label,
      percent: String(d.percent),
      validUntil: d.validUntil ? isoDate(d.validUntil) : "",
    })),
    departures: pkg.departures.map((d) => ({
      date: isoDate(d.date),
      seatsTotal: d.seatsTotal !== undefined ? String(d.seatsTotal) : "",
      status: d.status,
    })),
    currency: pkg.currency,
    singleSupplement: pkg.singleSupplement !== undefined ? String(pkg.singleSupplement) : "",
    videoUrl: pkg.videoUrl ?? "",
  };
}

function fromCsv(value: string): string[] {
  return Array.from(new Set(value.split(/[\n,]/).map((s) => s.trim()).filter(Boolean)));
}
function numOrUndef(value: string): number | undefined {
  if (value.trim() === "") return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

export function validateHolidayPackageForm(state: HolidayPackageFormState): string | null {
  if (!state.title.trim()) return "Title is required.";
  if (fromCsv(state.destinations).length === 0) return "Add at least one destination.";
  if (!(Number(state.durationDays) >= 1)) return "Duration (days) must be at least 1.";
  const tiers = state.roomTiers.filter((t) => t.price.trim());
  if (tiers.length === 0) return "Add at least one room tier with a price.";
  if (tiers.some((t) => !(Number(t.price) > 0))) return "Room tier prices must be greater than 0.";
  return null;
}

export function buildHolidayPackageFormData(
  state: HolidayPackageFormState,
  files: HolidayPackageFiles,
): FormData {
  const payload = {
    title: state.title.trim(),
    status: state.status,
    packageType: state.packageType,
    description: state.description.trim() || undefined,
    highlights: fromCsv(state.highlights),
    tags: fromCsv(state.tags),
    state: state.state || undefined,
    route: {
      origin: state.origin.trim() || undefined,
      originLocation:
        numOrUndef(state.originLat) !== undefined && numOrUndef(state.originLng) !== undefined
          ? { lat: numOrUndef(state.originLat), lng: numOrUndef(state.originLng), address: state.originAddress.trim() || undefined }
          : undefined,
      destinations: fromCsv(state.destinations),
      destinationLocation:
        numOrUndef(state.destinationLat) !== undefined && numOrUndef(state.destinationLng) !== undefined
          ? { lat: numOrUndef(state.destinationLat), lng: numOrUndef(state.destinationLng), address: state.destinationAddress.trim() || undefined }
          : undefined,
      durationDays: Number(state.durationDays),
      durationNights: Number(state.durationNights),
    },
    includes: {
      taxi: state.includeTaxi || undefined,
      hotels: state.includeHotels,
      tours: state.includeTours,
    },
    customInclusions: fromCsv(state.customInclusions),
    exclusions: fromCsv(state.exclusions),
    itinerary: state.itinerary
      .filter((r) => r.title.trim() || r.description.trim() || r.accommodation.trim() || r.activities.trim() || r.locationLat.trim())
      .map((r, i) => {
        const lat = numOrUndef(r.locationLat);
        const lng = numOrUndef(r.locationLng);
        return {
          day: numOrUndef(r.day) ?? i + 1,
          title: r.title.trim() || undefined,
          description: r.description.trim() || undefined,
          meals: { breakfast: r.breakfast, lunch: r.lunch, dinner: r.dinner },
          accommodation: r.accommodation.trim() || undefined,
          activities: fromCsv(r.activities),
          location: lat !== undefined && lng !== undefined ? { lat, lng, address: r.locationAddress.trim() || undefined } : undefined,
        };
      }),
    roomTiers: state.roomTiers
      .filter((t) => t.price.trim())
      .map((t) => ({
        roomType: t.roomType,
        mealPlan: t.mealPlan,
        price: Number(t.price),
        maxOccupancy: numOrUndef(t.maxOccupancy) ?? 2,
        childPrice: numOrUndef(t.childPrice),
        extraBedPrice: numOrUndef(t.extraBedPrice),
      })),
    currency: state.currency,
    singleSupplement: numOrUndef(state.singleSupplement),
    discounts: state.discounts
      .filter((d) => d.label.trim() && d.percent.trim())
      .map((d) => ({
        label: d.label.trim(),
        percent: Number(d.percent),
        validUntil: d.validUntil || undefined,
      })),
    departures: state.departures
      .filter((d) => d.date.trim())
      .map((d) => ({
        date: d.date,
        seatsTotal: numOrUndef(d.seatsTotal),
        status: d.status,
      })),
    videoUrl: state.videoUrl.trim() || undefined,
  };

  const form = new FormData();
  form.append("payload", JSON.stringify(payload));
  if (files.thumbnail) form.append("thumbnail", files.thumbnail);
  files.images.forEach((file) => form.append("images", file));
  return form;
}
