"use client";

import { use, useEffect, useMemo, useState } from "react";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { useToast } from "@/components/ui/Toast";
import { formatINR } from "@/lib/format";
import {
  getPackage,
  submitEnquiry,
  kindLabel,
  type PackageDetail,
  type PackageOffer,
  type PackageImage,
  type Operator,
  type PackageSightseeingSpecs,
  type PackageTourSpecs,
  type PackageTourPackageSpecs,
  type PackageHolidaySpecs,
  type PackageCruiseSpecs,
  type PackageTaxiPackageSpecs,
} from "@/lib/packagesClient";
import { useAuthStore } from "@/state/authStore";
import { partnerPackagesClient, type PartnerOffer } from "@/lib/partnerPackagesClient";
import OfferModal from "@/components/partner/OfferModal";
import { PACKAGE_KIND_SPECS, specDisplayValue } from "@/lib/packageKindSpecs";
import ItineraryMap, { type ItineraryMapPoint } from "@/components/packages/ItineraryMap";

// Generic per-kind details, read from Package.specs using the shared kind-spec
// config (every vertical except sightseeing, which has its own richer block).
function KindDetails({ kind, specs }: { kind: PackageDetail["kind"]; specs: Record<string, unknown> }) {
  const fields = PACKAGE_KIND_SPECS[kind];
  if (!fields) return null;
  const rows = fields
    .map((f) => ({ label: f.label, value: specDisplayValue(f, specs[f.key]) }))
    .filter((r) => r.value !== "");
  if (rows.length === 0) return null;
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {rows.map((r) => (
        <div key={r.label} className="rounded-xl border border-border-soft bg-white px-4 py-2.5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted">{r.label}</p>
          <p className="mt-0.5 text-[14px] font-semibold text-ink">{r.value}</p>
        </div>
      ))}
    </div>
  );
}

const SIGHTSEEING_DAY_LABELS: Record<string, string> = {
  mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu", fri: "Fri", sat: "Sat", sun: "Sun",
};
function titleCase(value: string): string {
  return value.split("_").map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(" ");
}

// Sightseeing template details — the fields captured by the admin template form
// (mirroring the partner activity form), read from Package.specs.
function SightseeingDetails({ specs }: { specs: PackageSightseeingSpecs }) {
  const duration = specs.duration?.value ? `${specs.duration.value} ${titleCase(specs.duration.unit ?? "hours")}` : undefined;
  const groupSize = specs.groupSize?.min || specs.groupSize?.max
    ? `${specs.groupSize?.min ?? 1}${specs.groupSize?.max ? `–${specs.groupSize.max}` : "+"} people`
    : undefined;
  const meetingPoint = specs.meetingPoint?.instructions;
  const facts: { label: string; value: string }[] = [
    specs.category ? { label: "Category", value: titleCase(specs.category) } : null,
    duration ? { label: "Duration", value: duration } : null,
    specs.difficulty ? { label: "Difficulty", value: titleCase(specs.difficulty) } : null,
    groupSize ? { label: "Group size", value: groupSize } : null,
    specs.languages?.length ? { label: "Languages", value: specs.languages.join(", ") } : null,
    specs.location?.island ? { label: "Location", value: [specs.location.island, specs.location.address].filter(Boolean).join(", ") } : null,
    specs.timeSlots?.length ? { label: "Time slots", value: specs.timeSlots.join(", ") } : null,
    specs.bookingCutoffHours != null ? { label: "Booking cutoff", value: `${specs.bookingCutoffHours}h before` } : null,
  ].filter((f): f is { label: string; value: string } => f !== null);

  return (
    <div className="flex flex-col gap-4">
      {facts.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {facts.map((f) => (
            <div key={f.label} className="rounded-xl border border-border-soft bg-white px-4 py-2.5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted">{f.label}</p>
              <p className="mt-0.5 text-[14px] font-semibold text-ink">{f.value}</p>
            </div>
          ))}
        </div>
      )}
      {meetingPoint && (
        <p className="text-[13px] text-ink-soft"><span className="font-bold text-ink">Meeting point: </span>{meetingPoint}</p>
      )}
      {specs.whatToBring?.length ? (
        <p className="text-[13px] text-ink-soft"><span className="font-bold text-ink">What to bring: </span>{specs.whatToBring.join(", ")}</p>
      ) : null}
      {specs.availableDays?.length ? (
        <div className="flex flex-wrap gap-2">
          {specs.availableDays.map((d) => (
            <span key={d} className="rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-bold text-brand-700">
              {SIGHTSEEING_DAY_LABELS[d] ?? titleCase(d)}
            </span>
          ))}
        </div>
      ) : null}
      {specs.cancellationPolicy && (
        <p className="text-[13px] text-ink-soft"><span className="font-bold text-ink">Cancellation: </span>{titleCase(specs.cancellationPolicy)}</p>
      )}
    </div>
  );
}

// Shared fact-grid used by every kind's bespoke details block.
function FactGrid({ facts }: { facts: { label: string; value: string }[] }) {
  if (facts.length === 0) return null;
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {facts.map((f) => (
        <div key={f.label} className="rounded-xl border border-border-soft bg-white px-4 py-2.5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted">{f.label}</p>
          <p className="mt-0.5 text-[14px] font-semibold text-ink">{f.value}</p>
        </div>
      ))}
    </div>
  );
}

type ItineraryDay = {
  day?: number;
  title?: string;
  description?: string;
  time?: string;
  location?: string;
  activities?: string[];
  accommodation?: string;
  distance?: number;
  overnight?: string;
  geo?: { lat: number; lng: number; address?: string };
};

function ItineraryDayCard({ d, i }: { d: ItineraryDay; i: number }) {
  const [open, setOpen] = useState(false);
  const heading = `${d.day != null ? `Day ${d.day}` : d.time ?? `Stop ${i + 1}`}${d.title ? ` — ${d.title}` : ""}`;
  // A short teaser so the collapsed card still reads as useful, not empty.
  const teaser = d.description && d.description.length > 110 ? `${d.description.slice(0, 110)}…` : d.description;

  return (
    <div className="rounded-lg border border-border-soft bg-white px-4 py-2.5">
      <button type="button" onClick={() => setOpen((o) => !o)} className="flex w-full items-start justify-between gap-3 text-left">
        <div className="min-w-0">
          <p className="text-[13px] font-bold text-ink">{heading}</p>
          {!open && teaser && <p className="mt-0.5 truncate text-[12px] text-ink-muted">{teaser}</p>}
        </div>
        <span className="mt-0.5 shrink-0 text-[12px] font-semibold text-brand-600">{open ? "Hide ▾" : "Details ▸"}</span>
      </button>
      {open && (
        <div className="mt-2">
          {d.location && <p className="text-[12px] text-ink-muted">📍 {d.location}</p>}
          {d.description && <p className="mt-1 text-[12px] text-ink-soft">{d.description}</p>}
          {d.activities?.length ? <p className="mt-1 text-[12px] text-ink-muted">🎯 {d.activities.join(" · ")}</p> : null}
          {d.accommodation && <p className="mt-1 text-[12px] text-ink-muted">🏨 {d.accommodation}</p>}
          {d.overnight && <p className="mt-1 text-[12px] text-ink-muted">🌙 Overnight: {d.overnight}</p>}
          {d.distance != null && <p className="mt-1 text-[12px] text-ink-muted">📏 {d.distance} km</p>}
          {d.geo && (
            <p className="mt-1 text-[12px] text-ink-muted">
              📍 {d.geo.address || `${d.geo.lat.toFixed(5)}, ${d.geo.lng.toFixed(5)}`}{" "}
              <a href={`https://maps.google.com/?q=${d.geo.lat},${d.geo.lng}`} target="_blank" rel="noreferrer" className="font-semibold text-brand-600 hover:text-brand-700">View on map ↗</a>
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function ItineraryList({
  days,
  start,
  end,
  route = false,
}: {
  days: ItineraryDay[];
  // Optional route start/end (a package's pinned origin/destination) — rendered
  // as "S"/"E" markers around the day pins.
  start?: { lat: number; lng: number; label: string };
  end?: { lat: number; lng: number; label: string };
  // Draw the connecting line start → day 1 → day 2 … → end on the map.
  route?: boolean;
}) {
  if (!days || days.length === 0) return null;
  const dayPoints: ItineraryMapPoint[] = days
    .filter((d): d is ItineraryDay & { geo: { lat: number; lng: number } } => d.geo != null)
    .map((d, i) => ({ day: d.day, label: `${d.day != null ? `Day ${d.day}` : `Stop ${i + 1}`}${d.title ? ` — ${d.title}` : ""}`, lat: d.geo.lat, lng: d.geo.lng }));
  const mapPoints: ItineraryMapPoint[] = [
    ...(start ? [{ badge: "S", label: start.label, lat: start.lat, lng: start.lng }] : []),
    ...dayPoints,
    ...(end ? [{ badge: "E", label: end.label, lat: end.lat, lng: end.lng }] : []),
  ];
  return (
    <div className="flex flex-col gap-3">
      <ItineraryMap points={mapPoints} route={route} />
      <div className="flex flex-col gap-2">
        {days.map((d, i) => <ItineraryDayCard key={i} d={d} i={i} />)}
      </div>
    </div>
  );
}

// Tour template details — mirrors tourForm.ts.
function TourDetails({ specs }: { specs: PackageTourSpecs }) {
  const facts: { label: string; value: string }[] = [
    specs.category ? { label: "Category", value: titleCase(specs.category) } : null,
    specs.durationHours ? { label: "Duration", value: `${specs.durationHours} hours` } : null,
    specs.languages?.length ? { label: "Languages", value: specs.languages.join(", ") } : null,
    specs.minGroupSize || specs.maxGroupSize ? { label: "Group size", value: `${specs.minGroupSize ?? 1}${specs.maxGroupSize ? `–${specs.maxGroupSize}` : "+"} people` } : null,
    specs.privateAvailable ? { label: "Private tour", value: specs.privatePrice != null ? `Available · ${formatINR(specs.privatePrice)}` : "Available" } : null,
    specs.pickupIncluded ? { label: "Pickup", value: "Included" } : null,
    specs.operatingDays?.length ? { label: "Operating days", value: specs.operatingDays.map(titleCase).join(", ") } : null,
    specs.startTimes?.length ? { label: "Start times", value: specs.startTimes.join(", ") } : null,
    specs.advanceBookingHrs != null ? { label: "Advance booking", value: `${specs.advanceBookingHrs}h before` } : null,
  ].filter((f): f is { label: string; value: string } => f !== null);
  return (
    <div className="flex flex-col gap-4">
      <FactGrid facts={facts} />
      {specs.pricing?.length ? (
        <div className="rounded-xl border border-border-soft bg-surface-muted/50 p-3">
          <p className="mb-1.5 text-[13px] font-bold text-ink">Pricing tiers</p>
          {specs.pricing.map((t, i) => (
            <div key={i} className="flex items-center justify-between text-[12px] text-ink-soft">
              <span>{t.label}{t.minAge != null || t.maxAge != null ? ` (${t.minAge ?? 0}–${t.maxAge ?? "∞"} yrs)` : ""}</span>
              <span className="font-bold text-ink">{formatINR(t.price)}</span>
            </div>
          ))}
        </div>
      ) : null}
      {specs.pickupPoints?.length ? (
        <p className="text-[13px] text-ink-soft"><span className="font-bold text-ink">Pickup points: </span>{specs.pickupPoints.map((p) => [p.name, p.time].filter(Boolean).join(" @ ")).join(", ")}</p>
      ) : null}
      <ItineraryList
        days={(specs.itinerary ?? []).map(({ location, locationLat, locationLng, ...d }) => {
          const hasGeo = locationLat != null && locationLng != null;
          return {
            ...d,
            location: hasGeo ? undefined : location,
            geo: hasGeo ? { lat: locationLat, lng: locationLng, address: location } : undefined,
          };
        })}
      />
    </div>
  );
}

// Tour package template details — mirrors tourPackageForm.ts.
function TourPackageDetails({ specs }: { specs: PackageTourPackageSpecs }) {
  const facts: { label: string; value: string }[] = [
    specs.packageType ? { label: "Package type", value: titleCase(specs.packageType) } : null,
    specs.difficultyLevel ? { label: "Difficulty", value: titleCase(specs.difficultyLevel) } : null,
    specs.pricing?.maxPersons ? { label: "Max persons", value: String(specs.pricing.maxPersons) } : null,
    specs.pricing?.childPrice != null ? { label: "Child price", value: formatINR(specs.pricing.childPrice) } : null,
    specs.pricing?.singleSupplement != null ? { label: "Single supplement", value: formatINR(specs.pricing.singleSupplement) } : null,
  ].filter((f): f is { label: string; value: string } => f !== null);
  return (
    <div className="flex flex-col gap-4">
      <FactGrid facts={facts} />
      {specs.discounts?.length ? (
        <div className="flex flex-wrap gap-2">
          {specs.discounts.map((d, i) => (
            <span key={i} className="rounded-full bg-success-50 px-2.5 py-1 text-[11px] font-bold text-success-700">{d.label} · {d.percent}% off</span>
          ))}
        </div>
      ) : null}
      {specs.departures?.length ? (
        <div className="rounded-xl border border-border-soft bg-surface-muted/50 p-3">
          <p className="mb-1.5 text-[13px] font-bold text-ink">Upcoming departures</p>
          {specs.departures.map((d, i) => (
            <div key={i} className="flex items-center justify-between text-[12px] text-ink-soft">
              <span>{new Date(d.date).toLocaleDateString()}</span>
              <span>{d.seatsTotal != null ? `${d.seatsTotal} seats` : ""} {d.status ? `· ${titleCase(d.status)}` : ""}</span>
            </div>
          ))}
        </div>
      ) : null}
      <ItineraryList days={(specs.itinerary ?? []).map(({ location, ...d }) => ({ ...d, geo: location }))} />
    </div>
  );
}

// Holiday package details — mirrors holidayPackageForm.ts. Room tiers render as
// a price table (Standard/Deluxe/Luxury × meal plan), the way MakeMyTrip/Yatra
// price a holiday package. A tie-up-generated holiday (hotel + taxi package,
// no roomTiers) instead renders through the "components" bundle section below.
function HolidayPackageDetails({ specs }: { specs: PackageHolidaySpecs }) {
  const facts: { label: string; value: string }[] = [
    specs.packageType ? { label: "Package type", value: titleCase(specs.packageType) } : null,
    specs.singleSupplement != null ? { label: "Single supplement", value: formatINR(specs.singleSupplement) } : null,
  ].filter((f): f is { label: string; value: string } => f !== null);
  return (
    <div className="flex flex-col gap-4">
      <FactGrid facts={facts} />
      {specs.roomTiers?.length ? (
        <div className="rounded-xl border border-border-soft bg-surface-muted/50 p-3">
          <p className="mb-1.5 text-[13px] font-bold text-ink">Room tiers</p>
          {specs.roomTiers.map((t, i) => (
            <div key={i} className="flex items-center justify-between text-[12px] text-ink-soft">
              <span>{titleCase(t.roomType)} · {titleCase(t.mealPlan)}{t.maxOccupancy ? ` (up to ${t.maxOccupancy})` : ""}</span>
              <span className="font-bold text-ink">{formatINR(t.price)}/person</span>
            </div>
          ))}
        </div>
      ) : null}
      {specs.discounts?.length ? (
        <div className="flex flex-wrap gap-2">
          {specs.discounts.map((d, i) => (
            <span key={i} className="rounded-full bg-success-50 px-2.5 py-1 text-[11px] font-bold text-success-700">{d.label} · {d.percent}% off</span>
          ))}
        </div>
      ) : null}
      {specs.departures?.length ? (
        <div className="rounded-xl border border-border-soft bg-surface-muted/50 p-3">
          <p className="mb-1.5 text-[13px] font-bold text-ink">Upcoming departures</p>
          {specs.departures.map((d, i) => (
            <div key={i} className="flex items-center justify-between text-[12px] text-ink-soft">
              <span>{new Date(d.date).toLocaleDateString()}</span>
              <span>{d.seatsTotal != null ? `${d.seatsTotal} seats` : ""} {d.status ? `· ${titleCase(d.status)}` : ""}</span>
            </div>
          ))}
        </div>
      ) : null}
      <ItineraryList
        days={(specs.itinerary ?? []).map(({ location, ...d }) => ({ ...d, geo: location }))}
        start={
          specs.originLocation
            ? { lat: specs.originLocation.lat, lng: specs.originLocation.lng, label: `Start${specs.originLocation.address ? ` — ${specs.originLocation.address}` : ""}` }
            : undefined
        }
        end={
          specs.destinationLocation
            ? { lat: specs.destinationLocation.lat, lng: specs.destinationLocation.lng, label: `End${specs.destinationLocation.address ? ` — ${specs.destinationLocation.address}` : ""}` }
            : undefined
        }
        route
      />
    </div>
  );
}

// Cruise template details — mirrors cruiseForm.ts.
function CruiseDetails({ specs }: { specs: PackageCruiseSpecs }) {
  const facts: { label: string; value: string }[] = [
    specs.cruiseType ? { label: "Cruise type", value: titleCase(specs.cruiseType) } : null,
    specs.vessel?.name ? { label: "Vessel", value: [specs.vessel.name, specs.vessel.operator].filter(Boolean).join(" · ") } : null,
    specs.vessel?.totalDecks ? { label: "Decks", value: String(specs.vessel.totalDecks) } : null,
    specs.boardingAge?.minAge != null || specs.boardingAge?.maxAge != null ? { label: "Boarding age", value: `${specs.boardingAge?.minAge ?? 0}–${specs.boardingAge?.maxAge ?? "∞"}` } : null,
    specs.cancellationPolicy?.freeCancelDays != null ? { label: "Free cancellation", value: `${specs.cancellationPolicy.freeCancelDays} days before` } : null,
  ].filter((f): f is { label: string; value: string } => f !== null);
  const meals = [specs.mealsIncluded?.breakfast && "Breakfast", specs.mealsIncluded?.lunch && "Lunch", specs.mealsIncluded?.dinner && "Dinner"].filter(Boolean).join(", ");
  return (
    <div className="flex flex-col gap-4">
      <FactGrid facts={facts} />
      {specs.cabins?.length ? (
        <div className="rounded-xl border border-border-soft bg-surface-muted/50 p-3">
          <p className="mb-1.5 text-[13px] font-bold text-ink">Cabin types</p>
          {specs.cabins.map((c, i) => (
            <div key={i} className="flex items-center justify-between text-[12px] text-ink-soft">
              <span>{titleCase(c.type)}{c.label ? ` — ${c.label}` : ""}{c.maxOccupancy ? ` (up to ${c.maxOccupancy})` : ""}</span>
              <span className="font-bold text-ink">{formatINR(c.pricePerPerson)}/person</span>
            </div>
          ))}
        </div>
      ) : null}
      {specs.stops?.length ? (
        <p className="text-[13px] text-ink-soft"><span className="font-bold text-ink">Stops: </span>{specs.stops.map((s) => s.port).filter(Boolean).join(" → ")}</p>
      ) : null}
      {specs.shipAmenities?.length ? <p className="text-[13px] text-ink-soft"><span className="font-bold text-ink">Ship amenities: </span>{specs.shipAmenities.join(", ")}</p> : null}
      {specs.diningOptions?.length ? <p className="text-[13px] text-ink-soft"><span className="font-bold text-ink">Dining: </span>{specs.diningOptions.join(", ")}</p> : null}
      {meals && <p className="text-[13px] text-ink-soft"><span className="font-bold text-ink">Meals included: </span>{meals}</p>}
    </div>
  );
}

// Taxi package template details — mirrors taxiPackageForm.ts.
function TaxiPackageDetails({ specs }: { specs: PackageTaxiPackageSpecs }) {
  const facts: { label: string; value: string }[] = [
    specs.totalKm ? { label: "Total distance", value: `${specs.totalKm} km` } : null,
    specs.pricing?.maxPersons ? { label: "Max persons", value: String(specs.pricing.maxPersons) } : null,
    specs.pricing?.tollsIncluded ? { label: "Tolls", value: "Included" } : null,
    specs.pricing?.driverAllowance ? { label: "Driver allowance", value: "Included" } : null,
    specs.pricing?.fuelIncluded ? { label: "Fuel", value: "Included" } : null,
    specs.advanceBookingDays != null ? { label: "Advance booking", value: `${specs.advanceBookingDays} days before` } : null,
  ].filter((f): f is { label: string; value: string } => f !== null);
  return (
    <div className="flex flex-col gap-4">
      <FactGrid facts={facts} />
      {specs.startDates?.length ? <p className="text-[13px] text-ink-soft"><span className="font-bold text-ink">Start dates: </span>{specs.startDates.join(", ")}</p> : null}
      <ItineraryList
        days={(specs.itinerary ?? []).map(({ location, ...d }) => ({ ...d, geo: location }))}
        start={
          specs.originLocation
            ? { lat: specs.originLocation.lat, lng: specs.originLocation.lng, label: `Start${specs.originLocation.address ? ` — ${specs.originLocation.address}` : ""}` }
            : undefined
        }
        route
      />
    </div>
  );
}

// Reference detail layout (matches the oyotours national-tour-details pattern):
// left column = gallery carousel → description → location map → tour calendar →
// itinerary → inclusions/exclusions → policies → gallery; right = sticky summary
// + package cost + "Booking Now" (enquiry) form. Themed with the site tokens.

function operatorName(offer: PackageOffer): string {
  const p = offer.partner as Operator;
  return (typeof p === "object" && (p.companyName || p.name)) || "Operator";
}

// ── Image carousel ──────────────────────────────────────────────────────────
function Carousel({ images, title }: { images: PackageImage[]; title: string }) {
  const [i, setI] = useState(0);
  const has = images.length > 0;
  const go = (d: number) => setI((prev) => (prev + d + images.length) % images.length);
  return (
    <div className="relative overflow-hidden rounded-2xl bg-surface-sunken shadow-(--shadow-sm)">
      {has ? (
        <img src={images[i].url} alt={images[i].caption ?? title} className="h-72 w-full object-cover sm:h-[460px]" />
      ) : (
        <div className="flex h-72 w-full items-center justify-center text-ink-muted sm:h-[460px]">No image</div>
      )}
      {images.length > 1 && (
        <>
          <button type="button" aria-label="Previous image" onClick={() => go(-1)}
            className="absolute left-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-black/35 text-white backdrop-blur transition-colors hover:bg-black/55">‹</button>
          <button type="button" aria-label="Next image" onClick={() => go(1)}
            className="absolute right-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-black/35 text-white backdrop-blur transition-colors hover:bg-black/55">›</button>
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
            {images.map((_, idx) => (
              <span key={idx} className={`h-1.5 rounded-full transition-all ${idx === i ? "w-5 bg-white" : "w-1.5 bg-white/60"}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Section shell ───────────────────────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border-soft bg-surface-muted p-5 sm:p-6">
      <h2 className="mb-4 text-[17px] font-extrabold text-ink">{title}</h2>
      {children}
    </section>
  );
}

// ── Collapsible policy row ──────────────────────────────────────────────────
function Accordion({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl border border-border-soft bg-white">
      <button type="button" onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left">
        <span className="text-[14px] font-bold text-brand-700">{title}</span>
        <span className={`text-ink-muted transition-transform ${open ? "rotate-180" : ""}`}>▾</span>
      </button>
      {open && <div className="border-t border-border-soft px-4 py-3 text-[13px] leading-relaxed text-ink-soft">{children}</div>}
    </div>
  );
}

// ── Tour calendar (next 3 months; future dates enquirable at the from-price) ──
function monthCells(year: number, month: number): (number | null)[] {
  const first = new Date(year, month, 1).getDay(); // 0 = Sun
  const days = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = Array.from({ length: first }, () => null);
  for (let d = 1; d <= days; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function TourCalendar({ price, onPick }: { price?: number | null; onPick: (iso: string) => void }) {
  const base = useMemo(() => new Date(), []);
  const months = useMemo(
    () => [0, 1, 2].map((m) => new Date(base.getFullYear(), base.getMonth() + m, 1)),
    [base],
  );
  const [tab, setTab] = useState(0);
  const active = months[tab];
  const cells = monthCells(active.getFullYear(), active.getMonth());
  const todayMid = new Date(base.getFullYear(), base.getMonth(), base.getDate()).getTime();
  const monthName = active.toLocaleString("en-IN", { month: "long", year: "numeric" });

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-1 border-b border-border-soft">
        {months.map((m, idx) => (
          <button key={idx} type="button" onClick={() => setTab(idx)}
            className={`px-4 py-2 text-[13px] font-semibold transition-colors ${tab === idx ? "border-b-2 border-accent-500 text-accent-600" : "text-ink-muted hover:text-ink"}`}>
            {m.toLocaleString("en-IN", { month: "long" })}
          </button>
        ))}
      </div>
      <div className="overflow-hidden rounded-xl border border-border-soft">
        <div className="bg-brand-700 py-2 text-center text-[13px] font-bold text-white">Tour Calendar — {monthName}</div>
        <div className="grid grid-cols-7 bg-brand-900/90 text-center text-[11px] font-bold text-white/90">
          {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((d) => <div key={d} className="py-2">{d}</div>)}
        </div>
        <div className="grid grid-cols-7 bg-white">
          {cells.map((d, idx) => {
            if (d === null) return <div key={idx} className="min-h-16 border border-border-soft/60" />;
            const iso = `${active.getFullYear()}-${String(active.getMonth() + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
            const isPast = new Date(active.getFullYear(), active.getMonth(), d).getTime() < todayMid;
            return (
              <button key={idx} type="button" disabled={isPast} onClick={() => onPick(iso)}
                className={`min-h-16 border border-border-soft/60 p-1.5 text-center transition-colors ${isPast ? "cursor-not-allowed text-ink-subtle" : "hover:bg-accent-50"}`}>
                <div className="text-[13px] font-semibold text-ink">{String(d).padStart(2, "0")}</div>
                {!isPast && (
                  <>
                    <div className="mx-auto my-1 h-0.5 w-6 rounded bg-success-500" />
                    <div className="text-[10px] font-bold text-success-700">{price ? formatINR(price) : "Enquire"}</div>
                  </>
                )}
              </button>
            );
          })}
        </div>
      </div>
      <p className="text-[11px] text-ink-muted">Pick an available date to start your enquiry for that departure.</p>
    </div>
  );
}

// A real pinned location for this package — used to centre the "Location" map on
// the actual place the admin/partner dropped a pin on. No text-search fallback:
// searching a place by name (e.g. route.destinations) can resolve to an unrelated
// business when the name is generic, so the map only ever renders when precise
// coordinates were actually set. Tour specs carry a base lat/lng plus flat
// per-stop locationLat/locationLng; tour_package/taxi_package nest per-day
// coordinates under `location`.
function firstPackageGeo(pkg: PackageDetail): { lat: number; lng: number } | undefined {
  const itinerary = pkg.specs?.itinerary;
  if (Array.isArray(itinerary)) {
    for (const day of itinerary) {
      if (!day || typeof day !== "object") continue;
      const d = day as Record<string, unknown>;
      const loc = d.location;
      if (loc && typeof loc === "object") {
        const l = loc as Record<string, unknown>;
        if (typeof l.lat === "number" && typeof l.lng === "number") return { lat: l.lat, lng: l.lng };
      }
      if (typeof d.locationLat === "number" && typeof d.locationLng === "number") {
        return { lat: d.locationLat, lng: d.locationLng };
      }
    }
  }
  const lat = pkg.specs?.latitude;
  const lng = pkg.specs?.longitude;
  if (typeof lat === "number" && typeof lng === "number") return { lat, lng };
  return undefined;
}

export default function PackageDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const toast = useToast();
  const [data, setData] = useState<{ item: PackageDetail; offers: PackageOffer[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Booking / enquiry form state (right sidebar).
  const [offerId, setOfferId] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [adults, setAdults] = useState("2");
  const [children, setChildren] = useState("0");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // A logged-in partner reviews this listing as a customer sees it, then attaches
  // their operating price from the same page (instead of enquiring like a customer).
  const role = useAuthStore((s) => s.user?.role);
  const isPartner = role === "partner";
  const [myOffer, setMyOffer] = useState<PartnerOffer | null>(null);
  const [offerOpen, setOfferOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getPackage(slug)
      .then((res) => {
        if (cancelled) return;
        setData(res);
        // Default to the cheapest operator offer.
        const cheapest = [...res.offers].sort((a, b) => a.price - b.price)[0];
        if (cheapest) setOfferId(cheapest.id);
      })
      .catch((e) => { if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load package"); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [slug]);

  // If a partner is viewing, find whether they've already priced this listing.
  useEffect(() => {
    if (!isPartner || !data) return;
    let cancelled = false;
    partnerPackagesClient.listOffers()
      .then((offers) => {
        if (cancelled) return;
        const pkgId = data.item.id;
        const mine = offers.find((o) => (typeof o.package === "object" && o.package ? o.package.id : o.package) === pkgId);
        setMyOffer(mine ?? null);
      })
      .catch(() => { /* non-fatal: the partner can still open the form */ });
    return () => { cancelled = true; };
  }, [isPartner, data]);

  const submit = async () => {
    if (!data) return;
    if (data.offers.length === 0) { toast.push({ title: "No operators available yet", tone: "warn" }); return; }
    if (!offerId) { toast.push({ title: "Select an operator", tone: "warn" }); return; }
    if (!name.trim()) { toast.push({ title: "Enter your name", tone: "warn" }); return; }
    if (!phone.trim()) { toast.push({ title: "Enter your phone number", tone: "warn" }); return; }
    setSubmitting(true);
    try {
      await submitEnquiry(slug, {
        offerId,
        contact: { name: name.trim(), phone: phone.trim(), email: email.trim() || undefined },
        travelDate: checkIn || undefined,
        pax: { adults: Number(adults) || 1, children: Number(children) || 0, infants: 0 },
        message: [message.trim(), checkOut ? `Check-out: ${checkOut}` : ""].filter(Boolean).join(" · ") || undefined,
      });
      toast.push({ title: "Enquiry sent!", description: "The operator and our team will contact you shortly.", tone: "success" });
      setName(""); setPhone(""); setEmail(""); setMessage(""); setCheckIn(""); setCheckOut("");
    } catch (e) {
      toast.push({ title: "Could not send enquiry", description: e instanceof Error ? e.message : "Please try again.", tone: "danger" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-ink">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-8">
        {loading && <div className="h-96 animate-pulse rounded-2xl bg-border-soft/60" />}
        {error && <p className="rounded-lg border border-danger-200 bg-danger-50 px-4 py-3 text-[14px] text-danger-700">{error}</p>}

        {data && (() => {
          const pkg = data.item;
          const gallery: PackageImage[] = pkg.images?.length ? pkg.images : (pkg.thumbnail ? [{ url: pkg.thumbnail }] : []);
          const duration = pkg.route.durationDays > 0 ? `${pkg.route.durationNights} Night ${pkg.route.durationDays} Days` : undefined;
          const fromPrice = pkg.fromPrice ?? pkg.referencePrice ?? null;
          const geo = firstPackageGeo(pkg);
          const cancellation = typeof pkg.specs?.cancellationPolicy === "string" ? pkg.specs.cancellationPolicy : "";
          const terms = typeof pkg.specs?.terms === "string" ? pkg.specs.terms : "";
          const documents = typeof pkg.specs?.documents === "string" ? pkg.specs.documents : "";

          return (
            <div className="grid gap-6 lg:grid-cols-[1fr_360px] lg:items-start">
              {/* ── Left column ── */}
              <div className="flex flex-col gap-6">
                <Carousel images={gallery} title={pkg.title} />

                {/* Description */}
                <Section title="Description">
                  <span className="mb-3 inline-block w-fit rounded-full bg-brand-50 px-2.5 py-0.5 text-[11px] font-bold text-brand-700">
                    {kindLabel(pkg.kind, pkg.scope)}
                  </span>
                  {pkg.description
                    ? <p className="text-[14px] leading-relaxed text-ink-soft">{pkg.description}</p>
                    : <p className="text-[14px] text-ink-muted">No description provided.</p>}
                  {pkg.highlights.length > 0 && (
                    <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
                      {pkg.highlights.map((h) => (
                        <li key={h} className="flex items-start gap-2 text-[13px] text-ink-soft"><span className="mt-0.5 text-success-500">✓</span> {h}</li>
                      ))}
                    </ul>
                  )}
                </Section>

                {/* Per-vertical details, read from Package.specs (mirrors the partner
                    form for this kind — see packageKindSpecs.ts / the bespoke
                    Details components above for how each kind is rendered). */}
                {pkg.kind === "sightseeing" && (
                  <Section title="Activity Details">
                    <SightseeingDetails specs={pkg.specs as PackageSightseeingSpecs} />
                  </Section>
                )}
                {pkg.kind === "tour" && (
                  <Section title="Tour Details"><TourDetails specs={pkg.specs as PackageTourSpecs} /></Section>
                )}
                {pkg.kind === "tour_package" && (
                  <Section title="Package Details"><TourPackageDetails specs={pkg.specs as PackageTourPackageSpecs} /></Section>
                )}
                {pkg.kind === "holiday" && Array.isArray((pkg.specs as PackageHolidaySpecs)?.roomTiers) && (pkg.specs as PackageHolidaySpecs).roomTiers!.length > 0 && (
                  <Section title="Package Details"><HolidayPackageDetails specs={pkg.specs as PackageHolidaySpecs} /></Section>
                )}
                {pkg.kind === "cruise" && (
                  <Section title="Cruise Details"><CruiseDetails specs={pkg.specs as PackageCruiseSpecs} /></Section>
                )}
                {pkg.kind === "taxi_package" && (
                  <Section title="Package Details"><TaxiPackageDetails specs={pkg.specs as PackageTaxiPackageSpecs} /></Section>
                )}
                {PACKAGE_KIND_SPECS[pkg.kind] && (
                  <Section title="Details">
                    <KindDetails kind={pkg.kind} specs={pkg.specs ?? {}} />
                  </Section>
                )}

                {/* Bundle / holiday tie-up components */}
                {(pkg.kind === "bundle" || pkg.kind === "holiday") && pkg.components.length > 0 && (
                  <Section title={pkg.kind === "holiday" ? "What's included in this holiday package" : "What's in this bundle"}>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {pkg.components.map((c, i) => (
                        <div key={`${c.title}-${i}`} className="flex items-start justify-between gap-3 rounded-xl border border-border-soft bg-white p-4">
                          <div className="min-w-0">
                            <p className="text-[14px] font-bold text-ink">{c.title}{c.quantity > 1 && <span className="text-ink-muted"> × {c.quantity}</span>}</p>
                            <span className="mt-0.5 inline-block rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-bold text-brand-700">{c.category}</span>
                            {c.description && <p className="mt-1 text-[12px] text-ink-soft">{c.description}</p>}
                          </div>
                          <span className={`shrink-0 text-[11px] font-bold ${c.included ? "text-success-600" : "text-ink-muted"}`}>{c.included ? "Included" : "Add-on"}</span>
                        </div>
                      ))}
                    </div>
                  </Section>
                )}

                {/* Location — only shown when a real pin was dropped; no
                    text-search fallback (see firstPackageGeo). */}
                {geo && (
                  <Section title="Location">
                    <div className="overflow-hidden rounded-xl border border-border-soft">
                      <iframe
                        title="Map"
                        src={`https://maps.google.com/maps?q=${geo.lat},${geo.lng}&output=embed`}
                        className="h-72 w-full"
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      />
                    </div>
                    {pkg.route.destinations.length > 0 && (
                      <p className="mt-2 text-[13px] text-ink-soft">📍 {pkg.route.destinations.join(" · ")}</p>
                    )}
                  </Section>
                )}

                {/* Tour calendar */}
                <Section title="Tour Calendar">
                  <TourCalendar
                    price={fromPrice}
                    onPick={(iso) => {
                      setCheckIn(iso);
                      toast.push({ title: "Date selected", description: "Complete the Booking Now form to send your enquiry.", tone: "info" });
                      if (typeof document !== "undefined") document.getElementById("booking-now")?.scrollIntoView({ behavior: "smooth", block: "center" });
                    }}
                  />
                </Section>

                {/* Itinerary */}
                {pkg.itinerary.length > 0 && (
                  <Section title="Itinerary">
                    <div className="flex flex-col gap-4">
                      {pkg.itinerary.map((d) => (
                        <div key={d.day} className="rounded-xl border border-border-soft bg-white">
                          <div className="flex items-stretch gap-3 border-l-4 border-success-500 bg-brand-50/60 px-4 py-2.5">
                            <p className="text-[14px] font-bold text-ink">Day {String(d.day).padStart(2, "0")}{d.title ? ` — ${d.title}` : ""}</p>
                          </div>
                          {(d.description || d.activities.length > 0 || d.accommodation) && (
                            <div className="px-4 py-3">
                              {d.description && <p className="text-[13px] leading-relaxed text-ink-soft">{d.description}</p>}
                              {d.activities.length > 0 && <p className="mt-2 text-[12px] text-ink-muted">🎯 {d.activities.join(" · ")}</p>}
                              {d.accommodation && <p className="mt-1 text-[12px] text-ink-muted">🏨 {d.accommodation}</p>}
                              {(d.meals.breakfast || d.meals.lunch || d.meals.dinner) && (
                                <p className="mt-1 text-[12px] text-ink-muted">🍽 {[d.meals.breakfast && "Breakfast", d.meals.lunch && "Lunch", d.meals.dinner && "Dinner"].filter(Boolean).join(", ")}</p>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </Section>
                )}

                {/* Inclusions / Exclusions */}
                {(pkg.inclusions.length > 0 || pkg.exclusions.length > 0) && (
                  <div className="grid gap-6 rounded-2xl border border-border-soft bg-surface-muted p-5 sm:grid-cols-2 sm:p-6">
                    <div>
                      <h3 className="mb-3 text-[16px] font-extrabold text-ink">Inclusions</h3>
                      <ul className="flex flex-col gap-2">
                        {pkg.inclusions.length ? pkg.inclusions.map((i) => (
                          <li key={i} className="flex items-start gap-2 text-[13px] text-ink-soft">
                            <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded bg-success-500 text-[10px] font-bold text-white">✓</span> {i}
                          </li>
                        )) : <li className="text-[13px] text-ink-muted">—</li>}
                      </ul>
                    </div>
                    <div>
                      <h3 className="mb-3 text-[16px] font-extrabold text-ink">Exclusions</h3>
                      <ul className="flex flex-col gap-2">
                        {pkg.exclusions.length ? pkg.exclusions.map((i) => (
                          <li key={i} className="flex items-start gap-2 text-[13px] text-ink-soft">
                            <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded bg-danger-500 text-[10px] font-bold text-white">✕</span> {i}
                          </li>
                        )) : <li className="text-[13px] text-ink-muted">—</li>}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Policies */}
                <Section title="Policies & Terms">
                  <div className="flex flex-col gap-3">
                    <Accordion title={`Documents for ${pkg.scope === "international" ? "International" : "National"} tours`}>
                      {documents || "Carry a valid government photo ID for every traveller. For international trips, a passport valid for at least 6 months and applicable visas are required."}
                    </Accordion>
                    <Accordion title="Tour Cancellation Policy — if the package is cancelled by client">
                      {cancellation || "Cancellation charges apply as per the operator's policy and depend on how far in advance the cancellation is made. The operator will confirm exact charges on your enquiry."}
                    </Accordion>
                    <Accordion title="Terms & Conditions">
                      {terms || "Prices are indicative and confirmed by the operator on enquiry. Rooms and services are subject to availability at the time of booking."}
                    </Accordion>
                  </div>
                </Section>

                {/* Gallery (mandatory images) — taxi listings are short point-to-
                    point rides, not multi-day tours; the top Carousel already
                    shows the vehicle photos, so this redundant grid is skipped
                    for kind "taxi" only (taxi_package still gets it). */}
                {pkg.kind !== "taxi" && (
                <Section title="Tour Gallery">
                  {gallery.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {gallery.map((img, i) => (
                        <img key={i} src={img.url} alt={img.caption ?? `${pkg.title} ${i + 1}`} className="h-32 w-full rounded-xl object-cover sm:h-40" loading="lazy" />
                      ))}
                    </div>
                  ) : (
                    <p className="text-[13px] text-ink-muted">No gallery images available.</p>
                  )}
                </Section>
                )}
              </div>

              {/* ── Right sidebar ── */}
              <aside className="flex flex-col gap-4 lg:sticky lg:top-24">
                {/* Summary */}
                <div className="rounded-2xl border border-border-soft bg-surface-muted p-5">
                  <h1 className="text-[20px] font-extrabold text-brand-700">{pkg.title}</h1>
                  {duration && <p className="mt-0.5 text-[13px] font-semibold text-accent-600">{duration}</p>}
                  {fromPrice != null && (
                    <>
                      <p className="mt-2 text-[26px] font-extrabold leading-none text-brand-600">{formatINR(fromPrice)}/-</p>
                      <p className="text-[13px] text-ink-muted">Per Person (from)</p>
                    </>
                  )}
                </div>

                {/* Package cost — operator offers */}
                {data.offers.length > 0 && (
                  <div className="overflow-hidden rounded-2xl bg-brand-700 text-white">
                    <div className="px-5 py-3 text-[15px] font-extrabold tracking-wide">PACKAGE COST</div>
                    <div className="flex flex-col">
                      {[...data.offers].sort((a, b) => a.price - b.price).map((o) => (
                        <div key={o.id} className="flex items-center justify-between gap-3 border-t border-white/15 px-5 py-2.5 text-[13px]">
                          <span className="min-w-0 truncate text-white/90">{operatorName(o)}{o.perPerson ? " · per person" : " · total"}</span>
                          <span className="shrink-0 font-bold">{formatINR(o.price)}/-</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Partner pricing panel — replaces the customer enquiry box when a
                    partner is signed in, so they price the listing they just reviewed. */}
                {isPartner ? (
                  <div className="rounded-2xl border border-accent-300 bg-accent-50 p-5 shadow-(--shadow-sm)">
                    <h2 className="text-[17px] font-extrabold text-ink">Operate this listing</h2>
                    <p className="mt-1 text-[13px] text-ink-soft">
                      You&apos;re viewing this listing as your customers will. Attach your operating price to appear as an operator here.
                    </p>
                    {myOffer ? (
                      <div className="mt-3 rounded-xl border border-accent-200 bg-white p-3">
                        <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-ink-muted">Your current price</p>
                        <p className="text-[20px] font-extrabold text-success-700">{formatINR(myOffer.price)}{myOffer.perPerson ? " /person" : " total"}</p>
                        {myOffer.pricingNote && <p className="text-[12px] text-ink-muted">{myOffer.pricingNote}</p>}
                      </div>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => setOfferOpen(true)}
                      className="mt-3 w-full rounded-lg bg-accent-500 py-3 text-[14px] font-extrabold text-white transition-colors hover:bg-accent-600"
                    >
                      {myOffer ? "Update your price" : "Set your price"}
                    </button>
                  </div>
                ) : (
                /* Booking Now (enquiry) */
                <div id="booking-now" className="rounded-2xl border border-border-soft bg-white p-5 shadow-(--shadow-sm)">
                  <h2 className="mb-3 text-[17px] font-extrabold text-ink">Booking Now</h2>
                  <div className="flex flex-col gap-3">
                    <input value={pkg.title} readOnly className="w-full rounded-lg border border-border bg-surface-muted px-3 py-2 text-[13px] font-semibold text-brand-700" />

                    <div className="grid grid-cols-2 gap-3">
                      <label className="flex flex-col gap-1 text-[12px] font-medium text-ink-muted">Check In
                        <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className="rounded-lg border border-border px-3 py-2 text-[13px] text-ink focus:border-brand-500 focus:outline-none" />
                      </label>
                      <label className="flex flex-col gap-1 text-[12px] font-medium text-ink-muted">Check Out
                        <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className="rounded-lg border border-border px-3 py-2 text-[13px] text-ink focus:border-brand-500 focus:outline-none" />
                      </label>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <label className="flex flex-col gap-1 text-[12px] font-medium text-ink-muted">Adults
                        <input type="number" min={1} value={adults} onChange={(e) => setAdults(e.target.value)} className="rounded-lg border border-border px-3 py-2 text-[13px] text-ink focus:border-brand-500 focus:outline-none" />
                      </label>
                      <label className="flex flex-col gap-1 text-[12px] font-medium text-ink-muted">Children (2–12 Yrs)
                        <input type="number" min={0} value={children} onChange={(e) => setChildren(e.target.value)} className="rounded-lg border border-border px-3 py-2 text-[13px] text-ink focus:border-brand-500 focus:outline-none" />
                      </label>
                    </div>

                    {data.offers.length > 1 && (
                      <label className="flex flex-col gap-1 text-[12px] font-medium text-ink-muted">Operator
                        <select value={offerId} onChange={(e) => setOfferId(e.target.value)} className="rounded-lg border border-border px-3 py-2 text-[13px] text-ink focus:border-brand-500 focus:outline-none">
                          {[...data.offers].sort((a, b) => a.price - b.price).map((o) => (
                            <option key={o.id} value={o.id}>{operatorName(o)} — {formatINR(o.price)}</option>
                          ))}
                        </select>
                      </label>
                    )}

                    <div className="grid grid-cols-1 gap-3">
                      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className="rounded-lg border border-border px-3 py-2 text-[13px] text-ink placeholder:text-ink-subtle focus:border-brand-500 focus:outline-none" />
                      <div className="grid grid-cols-2 gap-3">
                        <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" className="rounded-lg border border-border px-3 py-2 text-[13px] text-ink placeholder:text-ink-subtle focus:border-brand-500 focus:outline-none" />
                        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email (optional)" className="rounded-lg border border-border px-3 py-2 text-[13px] text-ink placeholder:text-ink-subtle focus:border-brand-500 focus:outline-none" />
                      </div>
                      <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={2} placeholder="Message (optional)" className="resize-none rounded-lg border border-border px-3 py-2 text-[13px] text-ink placeholder:text-ink-subtle focus:border-brand-500 focus:outline-none" />
                    </div>

                    <button type="button" onClick={submit} disabled={submitting || data.offers.length === 0}
                      className="mt-1 w-full rounded-lg bg-accent-500 py-3 text-[14px] font-extrabold text-white transition-colors hover:bg-accent-600 disabled:cursor-not-allowed disabled:opacity-60">
                      {submitting ? "Sending…" : data.offers.length === 0 ? "No operators yet" : "Book Now"}
                    </button>
                    <p className="text-center text-[11px] text-ink-muted">Enquiry only — the operator confirms price &amp; availability.</p>
                  </div>
                </div>
                )}
              </aside>
            </div>
          );
        })()}
      </main>
      <Footer />

      {/* Partner offer form — set/update the price for the listing being reviewed. */}
      {isPartner && data && (
        <OfferModal
          open={offerOpen}
          onClose={() => setOfferOpen(false)}
          packageId={data.item.id}
          packageLabel={data.item.title}
          existing={myOffer}
          onSaved={(saved) => { setMyOffer(saved); void getPackage(slug).then(setData).catch(() => {}); }}
        />
      )}
    </div>
  );
}
