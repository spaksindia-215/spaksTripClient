"use client";

import { useEffect, useState, type ReactNode } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import Checkbox from "@/components/ui/Checkbox";
import Modal from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { adminClient, type AdminPackageDetail } from "@/lib/adminClient";
import {
  holidayFormFromPackage,
  taxiPackageFormFromPackage,
  tourPackageFormFromPackage,
  tourFormFromPackage,
  cruiseFormFromPackage,
  sightseeingFormFromPackage,
  flatSpecsFromPackage,
  genericFieldsFromPackage,
} from "@/lib/packageTemplateHydrate";
import LocationPickerField from "@/components/partner/LocationPickerField";
import StateSelect from "@/components/ui/StateSelect";
import CountrySelect from "@/components/ui/CountrySelect";
import ItineraryDescriptionField from "@/components/partner/ItineraryDescriptionField";
import { PACKAGE_KIND_SPECS } from "@/lib/packageKindSpecs";
import type { PackageKind } from "@/lib/packagesClient";
import {
  buildSightseeingFormData,
  emptySightseeingForm,
  validateSightseeingForm,
  SIGHTSEEING_CATEGORIES,
  SIGHTSEEING_DIFFICULTY,
  SIGHTSEEING_PRICING_MODELS,
  SIGHTSEEING_DURATION_UNITS,
  SIGHTSEEING_CANCELLATION_POLICIES,
  SIGHTSEEING_OPERATING_DAYS,
  SIGHTSEEING_CURRENCIES,
  CATEGORY_LABELS,
  POLICY_LABELS,
  type SightseeingFormState,
} from "@/lib/sightseeingForm";
import {
  buildTourFormData,
  emptyTourForm,
  validateTourForm,
  emptyPricingRow,
  TOUR_CATEGORIES,
  TOUR_OPERATING_DAYS,
  TOUR_CURRENCIES,
  type TourFormState,
  type TourItineraryRow,
  type TourPricingRow,
  type TourPickupRow,
} from "@/lib/tourForm";
import {
  buildTourPackageFormData,
  emptyTourPackageForm,
  validateTourPackageForm,
  emptyItineraryRow as emptyTourPkgItineraryRow,
  PACKAGE_TYPES,
  DIFFICULTY_LEVELS,
  DEPARTURE_STATUS,
  PACKAGE_CURRENCIES,
  type TourPackageFormState,
  type PackageItineraryRow as TourPkgItineraryRow,
  type PackageDiscountRow,
  type PackageDepartureRow,
} from "@/lib/tourPackageForm";
import {
  buildHolidayPackageFormData,
  emptyHolidayPackageForm,
  validateHolidayPackageForm,
  emptyRoomTierRow,
  HOLIDAY_ROOM_TYPES,
  HOLIDAY_MEAL_PLANS,
  type HolidayPackageFormState,
  type RoomTierRow,
} from "@/lib/holidayPackageForm";
import {
  buildCruiseFormData,
  emptyCruiseForm,
  validateCruiseForm,
  emptyCabinRow,
  CRUISE_TYPES,
  CABIN_TYPES,
  CRUISE_DEPARTURE_STATUS,
  CRUISE_CURRENCIES,
  type CruiseFormState,
  type CruiseStopRow,
  type CruiseCabinRow,
  type CruiseDepartureRow,
} from "@/lib/cruiseForm";
import {
  buildTaxiPackageFormData,
  emptyTaxiPackageForm,
  validateTaxiPackageForm,
  emptyItineraryRow as emptyTaxiPkgItineraryRow,
  type TaxiPackageFormState,
  type TaxiPackageItineraryRow,
} from "@/lib/taxiPackageForm";

// §5.1 — Superadmin creates fixed platform listings (marketplace Package docs,
// origin "platform"). Shared by the Packages surface and the per-type "Add"
// buttons in the Partner Listings tab. `initialKind` lets a caller open the form
// on a specific listing type; the admin can still switch Type and the form swaps
// to that vertical's fields.
//
// Every kind captures the SAME field set a partner fills in for their own
// listing — sightseeing/tour/tour_package/cruise/taxi_package reuse the actual
// partner form-state modules directly (byte-identical fields + validation);
// taxi/transfer/self_drive/islandhopper/visa use a flat per-kind field config
// (packageKindSpecs.ts) matched against their partner forms. The only fields
// intentionally omitted anywhere are partner-identity/compliance fields (name,
// phone, email, RC book/insurance/license uploads) and "pick one of my own
// hotels/taxis/tours" self-references — neither applies before a partner is
// attached. A partner then attaches their operating price via PackageOffer.

export const TEMPLATE_KINDS = [
  { value: "holiday", label: "Holiday" },
  { value: "tour_package", label: "Tour Package" },
  { value: "tour", label: "Tour" },
  { value: "taxi_package", label: "Taxi Package" },
  { value: "taxi", label: "Taxi" },
  { value: "cruise", label: "Cruise" },
  { value: "sightseeing", label: "Sightseeing" },
  { value: "transfer", label: "Transfer" },
  { value: "self_drive", label: "Self-Drive" },
  { value: "islandhopper", label: "Islandhopper" },
  { value: "visa", label: "Visa Consultancy" },
] as const;

const kindLabel = (v: string): string => TEMPLATE_KINDS.find((k) => k.value === v)?.label ?? "Listing";

const DAY_LABELS: Record<string, string> = {
  mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu", fri: "Fri", sat: "Sat", sun: "Sun",
};

function titleCase(value: string): string {
  return value.split("_").map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(" ");
}

function jsonPayload(form: FormData, field: "data" | "payload"): Record<string, unknown> {
  return JSON.parse(form.get(field) as string) as Record<string, unknown>;
}

// Location is scope-exclusive. A domestic listing is placed by Indian state — a
// field on each kind's own partner form, rendered inside that kind's section. An
// international one is placed by country + a free-text region (state/province/
// emirate/prefecture — too many shapes worldwide to enumerate), which every kind
// shares, so those two live on the modal and render next to the Scope selector.
// The server (validatePackage) drops whichever half doesn't match the scope, so a
// listing flipped between scopes never keeps a stale location.
function InternationalLocationFields({
  country, setCountry, region, setRegion,
}: {
  country: string;
  setCountry: (v: string) => void;
  region: string;
  setRegion: (v: string) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <CountrySelect value={country} onChange={setCountry} />
      <Input
        label="State / Province / Region"
        value={region}
        onChange={(e) => setRegion(e.target.value)}
        placeholder="e.g. Bali, Dubai, Bangkok"
      />
    </div>
  );
}

export default function PackageTemplateModal({
  open,
  onClose,
  onSaved,
  initialKind = "holiday",
  editing = null,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  // Which type the form opens on. Only a starting point — the admin can switch the
  // Type dropdown at any time while creating and the whole form swaps to that
  // vertical's fields (each kind keeps its own form state, so switching back and
  // forth loses nothing).
  initialKind?: string;
  // When set, the modal edits this existing listing (prefilled) and PUTs on save
  // instead of creating. The kind is frozen (a listing can't change vertical).
  editing?: AdminPackageDetail | null;
}) {
  const toast = useToast();
  const editingId = editing?.id ?? null;
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState(initialKind);
  const [scope, setScope] = useState("domestic");
  // International location (domestic listings use the per-kind Indian state field).
  const [country, setCountry] = useState("");
  const [region, setRegion] = useState("");
  const [destinations, setDestinations] = useState("");
  const [days, setDays] = useState("4");
  const [nights, setNights] = useState("3");
  const [description, setDescription] = useState("");
  const [highlights, setHighlights] = useState("");
  const [inclusions, setInclusions] = useState("");
  const [exclusions, setExclusions] = useState("");
  const [price, setPrice] = useState("");
  const [images, setImages] = useState<FileList | null>(null);
  const [saving, setSaving] = useState(false);

  // Flat per-kind spec fields (taxi, transfer, self_drive, islandhopper, visa).
  const [specValues, setSpecValues] = useState<Record<string, string>>({});
  const [specChecklists, setSpecChecklists] = useState<Record<string, string[]>>({});
  const specFields = PACKAGE_KIND_SPECS[kind as PackageKind];

  // Full form-state per kind that has dynamic rows — same shape as the partner form.
  const [sForm, setSForm] = useState<SightseeingFormState>(() => emptySightseeingForm());
  const [tForm, setTForm] = useState<TourFormState>(() => emptyTourForm());
  const [tpForm, setTpForm] = useState<TourPackageFormState>(() => emptyTourPackageForm());
  const [hForm, setHForm] = useState<HolidayPackageFormState>(() => emptyHolidayPackageForm());
  const [cForm, setCForm] = useState<CruiseFormState>(() => emptyCruiseForm());
  const [xpForm, setXpForm] = useState<TaxiPackageFormState>(() => emptyTaxiPackageForm());

  // On open: hydrate from the listing being edited, else reset to a blank create
  // form for the requested kind.
  useEffect(() => {
    if (!open) return;
    if (editing) {
      setKind(editing.kind);
      setScope(editing.scope === "international" ? "international" : "domestic");
      setCountry(editing.country ?? "");
      setRegion(editing.region ?? "");
      hydrateFromPackage(editing);
    } else {
      setKind(initialKind);
      resetAll();
    }
    // hydrateFromPackage/resetAll are stable closures over setState setters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editing, initialKind]);

  // Prefill every form-state branch from a stored listing (inverse of `save()`).
  function hydrateFromPackage(pkg: AdminPackageDetail) {
    setImages(null);
    switch (pkg.kind) {
      case "holiday": setHForm(() => holidayFormFromPackage(pkg)); return;
      case "tour_package": setTpForm(() => tourPackageFormFromPackage(pkg)); return;
      case "tour": setTForm(() => tourFormFromPackage(pkg)); return;
      case "cruise": setCForm(() => cruiseFormFromPackage(pkg)); return;
      case "taxi_package": setXpForm(() => taxiPackageFormFromPackage(pkg)); return;
      case "sightseeing": setSForm(() => sightseeingFormFromPackage(pkg)); return;
      default: {
        // Flat/generic kinds (taxi, transfer, self_drive, islandhopper, visa).
        const g = genericFieldsFromPackage(pkg);
        setTitle(g.title); setDestinations(g.destinations); setDays(g.days); setNights(g.nights);
        setDescription(g.description); setHighlights(g.highlights);
        setInclusions(g.inclusions); setExclusions(g.exclusions); setPrice(g.price);
        const flatFields = PACKAGE_KIND_SPECS[pkg.kind as PackageKind] ?? [];
        const { values, checklists } = flatSpecsFromPackage(pkg, flatFields);
        setSpecValues(values); setSpecChecklists(checklists);
      }
    }
  }

  function setSField<K extends keyof SightseeingFormState>(key: K, value: SightseeingFormState[K]) {
    setSForm((c) => ({ ...c, [key]: value }));
  }
  function toggleSDay(day: string) {
    setSForm((c) => ({ ...c, availableDays: c.availableDays.includes(day) ? c.availableDays.filter((d) => d !== day) : [...c.availableDays, day] }));
  }
  function setTField<K extends keyof TourFormState>(key: K, value: TourFormState[K]) {
    setTForm((c) => ({ ...c, [key]: value }));
  }
  function toggleTDay(day: string) {
    setTForm((c) => ({ ...c, operatingDays: c.operatingDays.includes(day) ? c.operatingDays.filter((d) => d !== day) : [...c.operatingDays, day] }));
  }
  function setTpField<K extends keyof TourPackageFormState>(key: K, value: TourPackageFormState[K]) {
    setTpForm((c) => ({ ...c, [key]: value }));
  }
  function setHField<K extends keyof HolidayPackageFormState>(key: K, value: HolidayPackageFormState[K]) {
    setHForm((c) => ({ ...c, [key]: value }));
  }
  function setCField<K extends keyof CruiseFormState>(key: K, value: CruiseFormState[K]) {
    setCForm((c) => ({ ...c, [key]: value }));
  }
  function setXpField<K extends keyof TaxiPackageFormState>(key: K, value: TaxiPackageFormState[K]) {
    setXpForm((c) => ({ ...c, [key]: value }));
  }
  function toggleChecklist(fieldKey: string, value: string) {
    setSpecChecklists((prev) => {
      const cur = prev[fieldKey] ?? [];
      return { ...prev, [fieldKey]: cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value] };
    });
  }

  function resetAll() {
    setScope("domestic"); setCountry(""); setRegion("");
    setTitle(""); setDestinations(""); setDescription(""); setHighlights("");
    setInclusions(""); setExclusions(""); setPrice(""); setImages(null);
    setSpecValues({}); setSpecChecklists({});
    setSForm(emptySightseeingForm());
    setTForm(emptyTourForm());
    setTpForm(emptyTourPackageForm());
    setHForm(emptyHolidayPackageForm());
    setCForm(emptyCruiseForm());
    setXpForm(emptyTaxiPackageForm());
  }

  // Serialize the flat spec inputs into a specs object (csv/checklist → array,
  // number → Number, empties dropped) matching the partner listing's field shape.
  function buildFlatSpecs(): Record<string, unknown> {
    const out: Record<string, unknown> = {};
    for (const f of specFields ?? []) {
      if (f.type === "checklist") {
        const arr = specChecklists[f.key] ?? [];
        if (arr.length > 0) out[f.key] = arr;
        continue;
      }
      const v = (specValues[f.key] ?? "").trim();
      if (!v) continue;
      if (f.type === "csv") out[f.key] = v.split(",").map((x) => x.trim()).filter(Boolean);
      else if (f.type === "number") { const n = Number(v); if (Number.isFinite(n)) out[f.key] = n; }
      else out[f.key] = v;
    }
    return out;
  }

  async function submitData(data: Record<string, unknown>, successLabel: string) {
    setSaving(true);
    try {
      const form = new FormData();
      form.append("data", JSON.stringify(data));
      if (images) Array.from(images).forEach((f) => form.append("images", f));
      if (editingId) {
        await adminClient.packages.updateTemplate(editingId, form);
        toast.push({ title: "Listing updated", description: "Your changes are saved.", tone: "success" });
      } else {
        await adminClient.packages.createTemplate(form);
        toast.push({ title: successLabel, description: "It's live now and manageable under Packages.", tone: "success" });
      }
      onSaved(); onClose();
      resetAll();
    } catch (e) {
      toast.push({ title: editingId ? "Could not update listing" : "Could not create listing", description: e instanceof Error ? e.message : undefined, tone: "danger" });
    } finally { setSaving(false); }
  }

  // Location fields for the payload, keyed off Scope: an Indian state (taken from
  // the kind's own form) for domestic, country + region for international. The
  // server drops the half that doesn't match the scope, so sending only the right
  // one keeps an edited listing from carrying both.
  const geoFields = (formState: unknown): Record<string, unknown> =>
    scope === "international"
      ? { country: country || undefined, region: region.trim() || undefined }
      : { state: formState };

  const save = async () => {
    if (scope === "international" && !country) {
      toast.push({ title: "Select a country", description: "An international listing needs the country it operates in.", tone: "warn" });
      return;
    }

    if (kind === "sightseeing") {
      const err = validateSightseeingForm(sForm);
      if (err) { toast.push({ title: "Please review the activity", description: err, tone: "warn" }); return; }
      const payload = jsonPayload(buildSightseeingFormData(sForm, { images: [] }), "data");
      delete payload.status;
      const { title: t, description: d, highlights: h, tags: tg, inclusions: inc, exclusions: exc, currency: cur, ...specs } = payload;
      await submitData({ title: t, kind, scope, ...geoFields(undefined), description: d, highlights: h, tags: tg, inclusions: inc, exclusions: exc, currency: cur, specs }, "Sightseeing listing created");
      return;
    }

    if (kind === "tour") {
      const err = validateTourForm(tForm);
      if (err) { toast.push({ title: "Please review the tour", description: err, tone: "warn" }); return; }
      const payload = jsonPayload(buildTourFormData(tForm, { images: [] }), "payload");
      delete payload.status;
      const { title: t, description: d, highlights: h, tags: tg, inclusions: inc, exclusions: exc, basedIn, coversCities, durationDays, durationNights, state: st, ...specs } = payload;
      await submitData({
        title: t, kind, scope, description: d, highlights: h, tags: tg, inclusions: inc, exclusions: exc,
        currency: tForm.currency, ...geoFields(st),
        route: { origin: basedIn, destinations: coversCities, durationDays, durationNights },
        specs,
      }, "Tour listing created");
      return;
    }

    if (kind === "tour_package") {
      const err = validateTourPackageForm(tpForm);
      if (err) { toast.push({ title: "Please review the tour package", description: err, tone: "warn" }); return; }
      const payload = jsonPayload(buildTourPackageFormData(tpForm, { thumbnail: null, images: [] }), "payload");
      delete payload.status;
      const { title: t, description: d, highlights: h, tags: tg, route, customInclusions, exclusions: exc, pricing, state: st, ...rest } = payload;
      delete rest.includes; // partner's own hotels/taxi/tours — not applicable pre-partner
      const pr = (pricing ?? {}) as Record<string, unknown>;
      await submitData({
        title: t, kind, scope, description: d, highlights: h, tags: tg,
        inclusions: customInclusions, exclusions: exc,
        currency: pr.currency, referencePrice: pr.basePrice, ...geoFields(st),
        route,
        specs: {
          packageType: rest.packageType, difficultyLevel: rest.difficultyLevel,
          itinerary: rest.itinerary, departures: rest.departures, videoUrl: rest.videoUrl,
          discounts: pr.discounts,
          pricing: { basePrice: pr.basePrice, perPerson: pr.perPerson, maxPersons: pr.maxPersons, childPrice: pr.childPrice, infantPrice: pr.infantPrice, extraPersonCharge: pr.extraPersonCharge, singleSupplement: pr.singleSupplement },
        },
      }, "Tour package listing created");
      return;
    }

    if (kind === "holiday") {
      const err = validateHolidayPackageForm(hForm);
      if (err) { toast.push({ title: "Please review the holiday package", description: err, tone: "warn" }); return; }
      const payload = jsonPayload(buildHolidayPackageFormData(hForm, { thumbnail: null, images: [] }), "payload");
      delete payload.status;
      const { title: t, description: d, highlights: h, tags: tg, route, customInclusions, exclusions: exc, currency: cur, roomTiers, state: st, ...rest } = payload;
      delete rest.includes; // partner's own hotels/taxi/tours — not applicable pre-partner
      const tiers = (roomTiers ?? []) as { price: number }[];
      const referencePrice = tiers.length > 0 ? Math.min(...tiers.map((t2) => t2.price)) : undefined;
      const hr = (route ?? {}) as Record<string, unknown>;
      await submitData({
        title: t, kind, scope, description: d, highlights: h, tags: tg,
        inclusions: customInclusions, exclusions: exc,
        currency: cur, referencePrice, ...geoFields(st),
        route,
        specs: {
          // origin/destination pins ride in specs (Package.route is a fixed shape)
          // so the detail page can draw the route start → stops → end.
          packageType: rest.packageType, itinerary: rest.itinerary, departures: rest.departures, videoUrl: rest.videoUrl,
          discounts: rest.discounts, roomTiers, singleSupplement: rest.singleSupplement,
          originLocation: hr.originLocation, destinationLocation: hr.destinationLocation,
        },
      }, "Holiday package listing created");
      return;
    }

    if (kind === "cruise") {
      const err = validateCruiseForm(cForm);
      if (err) { toast.push({ title: "Please review the cruise", description: err, tone: "warn" }); return; }
      const payload = jsonPayload(buildCruiseFormData(cForm, { vesselImages: [] }), "payload");
      delete payload.status;
      const { cruiseName: t, description: d, highlights: h, tags: tg, vessel, route, cabins, shipAmenities, diningOptions, mealsIncluded, departures, cancellationPolicy, boardingAge, cruiseType } = payload;
      const r = (route ?? {}) as Record<string, unknown>;
      await submitData({
        title: t, kind, scope, ...geoFields(undefined), description: d, highlights: h, tags: tg,
        inclusions: [], exclusions: [],
        currency: cForm.currency,
        route: { origin: r.departurePort, destinations: r.arrivalPort ? [r.arrivalPort] : [], durationDays: r.durationDays, durationNights: r.durationNights },
        specs: { cruiseType, vessel, stops: r.stops, cabins, shipAmenities, diningOptions, mealsIncluded, departures, cancellationPolicy, boardingAge },
      }, "Cruise listing created");
      return;
    }

    if (kind === "taxi_package") {
      const err = validateTaxiPackageForm(xpForm);
      if (err) { toast.push({ title: "Please review the taxi package", description: err, tone: "warn" }); return; }
      const payload = jsonPayload(buildTaxiPackageFormData(xpForm, { thumbnail: null, images: [] }), "payload");
      delete payload.status;
      delete payload.vehicle; // partner's own vehicle listing — not applicable pre-partner
      const { title: t, description: d, highlights: h, tags: tg, route, itinerary, pricing, inclusions: inc, exclusions: exc, startDates, blackoutDates, advanceBookingDays, state: st } = payload;
      const r = (route ?? {}) as Record<string, unknown>;
      const pr = (pricing ?? {}) as Record<string, unknown>;
      await submitData({
        title: t, kind, scope, description: d, highlights: h, tags: tg, inclusions: inc, exclusions: exc,
        currency: pr.currency, referencePrice: pr.basePrice, ...geoFields(st),
        route: { origin: r.origin, destinations: r.destinations, durationDays: r.durationDays, durationNights: r.durationNights },
        specs: {
          // originLocation rides in specs (Package.route is a fixed shape) so the
          // detail page can start the route map at the origin pin.
          totalKm: r.totalKm, originLocation: r.originLocation, itinerary, startDates, blackoutDates, advanceBookingDays,
          pricing: { basePrice: pr.basePrice, maxPersons: pr.maxPersons, extraPersonCharge: pr.extraPersonCharge, tollsIncluded: pr.tollsIncluded, driverAllowance: pr.driverAllowance, fuelIncluded: pr.fuelIncluded },
        },
      }, "Taxi package listing created");
      return;
    }

    // Generic path: kinds driven by the flat PACKAGE_KIND_SPECS config (taxi,
    // transfer, self_drive, islandhopper, visa, bundle) — no vertical fields.
    if (!title.trim()) { toast.push({ title: "Enter a title", tone: "warn" }); return; }
    await submitData({
      title: title.trim(), kind, scope, ...geoFields(undefined),
      description: description.trim() || undefined,
      highlights: highlights.split("\n").map((x) => x.trim()).filter(Boolean),
      inclusions: inclusions.split("\n").map((x) => x.trim()).filter(Boolean),
      exclusions: exclusions.split("\n").map((x) => x.trim()).filter(Boolean),
      referencePrice: price.trim() ? Number(price) : undefined,
      route: { destinations: destinations.split(",").map((x) => x.trim()).filter(Boolean), durationDays: Number(days) || 1, durationNights: Number(nights) || 0 },
      specs: buildFlatSpecs(),
    }, `${kindLabel(kind)} listing created`);
  };

  return (
    <Modal open={open} onClose={onClose}
      title={editingId ? `Edit ${kindLabel(kind)} listing` : `New ${kindLabel(kind)} listing`} size="lg"
      footer={<div className="flex justify-end gap-3"><Button variant="ghost" onClick={onClose}>Cancel</Button><Button variant="accent" onClick={save} loading={saving}>{editingId ? "Save changes" : "Create"}</Button></div>}>
      <div className="flex flex-col gap-3 p-1">
        <div className="grid gap-3 sm:grid-cols-2">
          {/* Switching Type swaps the whole form to that vertical's fields. Frozen
              only while editing — an existing listing can't change vertical. */}
          <Select label="Type" value={kind} onChange={(e) => setKind(e.target.value)} disabled={!!editingId}>
            {TEMPLATE_KINDS.map((k) => <option key={k.value} value={k.value}>{k.label}</option>)}
          </Select>
          <Select label="Scope" value={scope} onChange={(e) => setScope(e.target.value)}><option value="domestic">Domestic</option><option value="international">International</option></Select>
        </div>

        {scope === "international" && (
          <InternationalLocationFields country={country} setCountry={setCountry} region={region} setRegion={setRegion} />
        )}

        {kind === "sightseeing" && (
          <SightseeingFields sForm={sForm} setSField={setSField} toggleSDay={toggleSDay} />
        )}

        {kind === "tour" && (
          <TourFields scope={scope} tForm={tForm} setTForm={setTForm} setTField={setTField} toggleTDay={toggleTDay} />
        )}

        {kind === "tour_package" && (
          <TourPackageFields scope={scope} tpForm={tpForm} setTpForm={setTpForm} setTpField={setTpField} />
        )}

        {kind === "holiday" && (
          <HolidayPackageFields scope={scope} hForm={hForm} setHForm={setHForm} setHField={setHField} />
        )}

        {kind === "cruise" && (
          <CruiseFields cForm={cForm} setCForm={setCForm} setCField={setCField} />
        )}

        {kind === "taxi_package" && (
          <TaxiPackageFields scope={scope} xpForm={xpForm} setXpForm={setXpForm} setXpField={setXpField} />
        )}

        {kind !== "sightseeing" && kind !== "tour" && kind !== "tour_package" && kind !== "holiday" && kind !== "cruise" && kind !== "taxi_package" && (
          <>
            <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Delhi to Ladakh 3N/4D" />
            <Input label="Destinations (comma-separated)" value={destinations} onChange={(e) => setDestinations(e.target.value)} placeholder="Leh, Nubra, Pangong" />
            <div className="grid gap-3 sm:grid-cols-3">
              <Input label="Days" type="number" value={days} onChange={(e) => setDays(e.target.value)} />
              <Input label="Nights" type="number" value={nights} onChange={(e) => setNights(e.target.value)} />
              <Input label="Reference price (₹)" type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="e.g. 25000" />
            </div>
            <Textarea label="Description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
            <Textarea label="Highlights (one per line)" value={highlights} onChange={(e) => setHighlights(e.target.value)} rows={2} />
            <div className="grid gap-3 sm:grid-cols-2">
              <Textarea label="Inclusions (one per line)" value={inclusions} onChange={(e) => setInclusions(e.target.value)} rows={3} />
              <Textarea label="Exclusions (one per line)" value={exclusions} onChange={(e) => setExclusions(e.target.value)} rows={3} />
            </div>

            {/* Per-vertical detail fields (same set the partner fills for this kind). */}
            {specFields && specFields.length > 0 && (
              <FieldSection title={`${kindLabel(kind)} details`}>
                {specFields.map((f) => {
                  if (f.type === "checklist") {
                    const selected = specChecklists[f.key] ?? [];
                    return (
                      <div key={f.key} className="sm:col-span-2">
                        <p className="mb-2 text-[13px] font-medium text-ink-soft">{f.label}</p>
                        <div className="flex flex-wrap gap-3">
                          {f.options.map((opt) => (
                            <Checkbox key={opt} label={opt} checked={selected.includes(opt)} onChange={() => toggleChecklist(f.key, opt)} />
                          ))}
                        </div>
                      </div>
                    );
                  }
                  const val = specValues[f.key] ?? "";
                  const set = (v: string) => setSpecValues((prev) => ({ ...prev, [f.key]: v }));
                  if (f.type === "select") {
                    return (
                      <Select key={f.key} label={f.label} value={val} onChange={(e) => set(e.target.value)}>
                        <option value="">—</option>
                        {f.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </Select>
                    );
                  }
                  if (f.type === "textarea") {
                    return <div key={f.key} className="sm:col-span-2"><Textarea label={f.label} value={val} onChange={(e) => set(e.target.value)} rows={2} placeholder={f.placeholder} /></div>;
                  }
                  return (
                    <Input key={f.key} label={f.label} type={f.type === "number" ? "number" : "text"} value={val} onChange={(e) => set(e.target.value)} placeholder={f.type === "csv" ? (f.placeholder ?? "comma separated") : f.placeholder} />
                  );
                })}
              </FieldSection>
            )}
          </>
        )}

        <div className="flex flex-col gap-1">
          <label className="text-[13px] font-medium text-ink-soft">Images</label>
          <input type="file" accept="image/*" multiple onChange={(e) => setImages(e.target.files)} className="text-[13px]" />
          {editingId && <p className="text-[12px] text-ink-muted">Leave empty to keep the current images; choosing files replaces them.</p>}
        </div>
      </div>
    </Modal>
  );
}

function FieldSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-border-soft bg-surface-muted p-4">
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-700">{title}</p>
      <div className="grid gap-3 sm:grid-cols-2">{children}</div>
    </div>
  );
}

// Generic add/remove editor for a dynamic array of rows (itinerary days, cabins,
// pricing tiers, discounts, departures, stops, pickup points…).
function RowList<T>({
  label, rows, onChange, newRow, renderRow,
}: {
  label: string;
  rows: T[];
  onChange: (rows: T[]) => void;
  newRow: () => T;
  renderRow: (row: T, patch: (p: Partial<T>) => void, idx: number) => ReactNode;
}) {
  return (
    <div className="sm:col-span-2 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-bold text-ink">{label} ({rows.length})</p>
        <button type="button" onClick={() => onChange([...rows, newRow()])} className="text-[12px] font-semibold text-brand-600 hover:text-brand-700">+ Add</button>
      </div>
      <div className="flex flex-col gap-2">
        {rows.map((r, i) => (
          <div key={i} className="relative rounded-lg border border-border-soft bg-white p-3">
            {rows.length > 1 && (
              <button type="button" onClick={() => onChange(rows.filter((_, xi) => xi !== i))}
                className="absolute right-2 top-2 text-[11px] font-semibold text-danger-600 hover:text-danger-700">Remove</button>
            )}
            <div className="grid gap-2 pr-14 sm:grid-cols-2">
              {renderRow(r, (patch) => onChange(rows.map((x, xi) => (xi === i ? { ...x, ...patch } : x))), i)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Sightseeing ──────────────────────────────────────────────────────────────
function SightseeingFields({
  sForm, setSField, toggleSDay,
}: {
  sForm: SightseeingFormState;
  setSField: <K extends keyof SightseeingFormState>(key: K, value: SightseeingFormState[K]) => void;
  toggleSDay: (day: string) => void;
}) {
  return (
    <>
      <FieldSection title="Basics">
        <Input label="Title" value={sForm.title} onChange={(e) => setSField("title", e.target.value)} placeholder="Sunset Dolphin Cruise" />
        <Select label="Category" value={sForm.category} onChange={(e) => setSField("category", e.target.value)}>
          {SIGHTSEEING_CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_LABELS[c] ?? titleCase(c)}</option>)}
        </Select>
        <Input label="Languages (comma separated)" value={sForm.languages} onChange={(e) => setSField("languages", e.target.value)} placeholder="English, Hindi" />
        <Input label="Tags (comma separated)" value={sForm.tags} onChange={(e) => setSField("tags", e.target.value)} />
        <div className="sm:col-span-2"><Textarea label="Description" value={sForm.description} onChange={(e) => setSField("description", e.target.value)} rows={3} /></div>
        <div className="sm:col-span-2"><Textarea label="Highlights (comma or newline separated)" value={sForm.highlights} onChange={(e) => setSField("highlights", e.target.value)} rows={2} /></div>
      </FieldSection>

      <FieldSection title="Location & Meeting Point">
        <Input label="Island / City" value={sForm.island} onChange={(e) => setSField("island", e.target.value)} placeholder="Havelock" />
        <Input label="Address" value={sForm.address} onChange={(e) => setSField("address", e.target.value)} />
        <div className="sm:col-span-2"><Textarea label="Meeting point instructions" value={sForm.meetingInstructions} onChange={(e) => setSField("meetingInstructions", e.target.value)} rows={2} /></div>
      </FieldSection>

      <FieldSection title="Duration & Group">
        <Input label="Duration value" type="number" min="0" value={sForm.durationValue} onChange={(e) => setSField("durationValue", e.target.value)} placeholder="2" />
        <Select label="Duration unit" value={sForm.durationUnit} onChange={(e) => setSField("durationUnit", e.target.value)}>
          {SIGHTSEEING_DURATION_UNITS.map((u) => <option key={u} value={u}>{titleCase(u)}</option>)}
        </Select>
        <Select label="Difficulty (optional)" value={sForm.difficulty} onChange={(e) => setSField("difficulty", e.target.value)}>
          <option value="">—</option>
          {SIGHTSEEING_DIFFICULTY.map((d) => <option key={d} value={d}>{titleCase(d)}</option>)}
        </Select>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Min age" type="number" min="0" value={sForm.minAge} onChange={(e) => setSField("minAge", e.target.value)} />
          <Input label="Max age" type="number" min="0" value={sForm.maxAge} onChange={(e) => setSField("maxAge", e.target.value)} />
        </div>
        <Input label="Min participants" type="number" min="1" value={sForm.minGroupSize} onChange={(e) => setSField("minGroupSize", e.target.value)} />
        <Input label="Max participants" type="number" min="1" value={sForm.maxGroupSize} onChange={(e) => setSField("maxGroupSize", e.target.value)} />
      </FieldSection>

      <FieldSection title="Indicative pricing — operators set the actual price">
        <Select label="Pricing model" value={sForm.pricingModel} onChange={(e) => setSField("pricingModel", e.target.value)}>
          {SIGHTSEEING_PRICING_MODELS.map((m) => <option key={m} value={m}>{titleCase(m)}</option>)}
        </Select>
        <Select label="Currency" value={sForm.currency} onChange={(e) => setSField("currency", e.target.value)}>
          {SIGHTSEEING_CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </Select>
        <Input label="Adult price" type="number" min="0" value={sForm.priceAdult} onChange={(e) => setSField("priceAdult", e.target.value)} />
        <Input label="Child price" type="number" min="0" value={sForm.priceChild} onChange={(e) => setSField("priceChild", e.target.value)} />
        <Input label="Infant price" type="number" min="0" value={sForm.priceInfant} onChange={(e) => setSField("priceInfant", e.target.value)} />
        <Input label="Group price" type="number" min="0" value={sForm.priceGroup} onChange={(e) => setSField("priceGroup", e.target.value)} />
      </FieldSection>

      <FieldSection title="Inclusions">
        <div className="sm:col-span-2"><Textarea label="Inclusions (comma or newline)" value={sForm.inclusions} onChange={(e) => setSField("inclusions", e.target.value)} rows={2} /></div>
        <div className="sm:col-span-2"><Textarea label="Exclusions (comma or newline)" value={sForm.exclusions} onChange={(e) => setSField("exclusions", e.target.value)} rows={2} /></div>
        <div className="sm:col-span-2"><Textarea label="What to bring (comma or newline)" value={sForm.whatToBring} onChange={(e) => setSField("whatToBring", e.target.value)} rows={2} /></div>
        <Input label="Accessibility (comma separated)" value={sForm.accessibility} onChange={(e) => setSField("accessibility", e.target.value)} placeholder="Wheelchair accessible" />
      </FieldSection>

      <FieldSection title="Availability">
        <div className="sm:col-span-2">
          <p className="mb-2 text-[13px] font-medium text-ink-soft">Available days</p>
          <div className="flex flex-wrap gap-3">
            {SIGHTSEEING_OPERATING_DAYS.map((day) => (
              <Checkbox key={day} label={DAY_LABELS[day]} checked={sForm.availableDays.includes(day)} onChange={() => toggleSDay(day)} />
            ))}
          </div>
        </div>
        <Input label="Time slots (comma separated)" value={sForm.timeSlots} onChange={(e) => setSField("timeSlots", e.target.value)} placeholder="09:00, 14:00" />
        <Input label="Booking cutoff (hours before)" type="number" min="0" value={sForm.bookingCutoffHours} onChange={(e) => setSField("bookingCutoffHours", e.target.value)} />
        <Input label="Blackout dates (YYYY-MM-DD, comma separated)" value={sForm.blackoutDates} onChange={(e) => setSField("blackoutDates", e.target.value)} />
      </FieldSection>

      <FieldSection title="Policy & Media">
        <Select label="Cancellation policy" value={sForm.cancellationPolicy} onChange={(e) => setSField("cancellationPolicy", e.target.value)}>
          {SIGHTSEEING_CANCELLATION_POLICIES.map((p) => <option key={p} value={p}>{POLICY_LABELS[p] ?? titleCase(p)}</option>)}
        </Select>
        <Input label="Video URL" value={sForm.videoUrl} onChange={(e) => setSField("videoUrl", e.target.value)} placeholder="https://youtu.be/…" />
        <div className="sm:col-span-2"><Textarea label="Terms & conditions" value={sForm.termsAndConditions} onChange={(e) => setSField("termsAndConditions", e.target.value)} rows={2} /></div>
      </FieldSection>
    </>
  );
}

// ── Tour ─────────────────────────────────────────────────────────────────────
function TourFields({
  scope, tForm, setTForm, setTField, toggleTDay,
}: {
  // Drives the location field: the Indian state below only applies to a domestic
  // listing (an international one is placed by the modal's country + region).
  scope: string;
  tForm: TourFormState;
  setTForm: (fn: (c: TourFormState) => TourFormState) => void;
  setTField: <K extends keyof TourFormState>(key: K, value: TourFormState[K]) => void;
  toggleTDay: (day: string) => void;
}) {
  return (
    <>
      <FieldSection title="Basics">
        <Input label="Title" value={tForm.title} onChange={(e) => setTField("title", e.target.value)} placeholder="Old City Heritage Walk" />
        <Select label="Category" value={tForm.category} onChange={(e) => setTField("category", e.target.value)}>
          {TOUR_CATEGORIES.map((c) => <option key={c} value={c}>{titleCase(c)}</option>)}
        </Select>
        <Input label="Languages (comma separated)" value={tForm.languages} onChange={(e) => setTField("languages", e.target.value)} />
        <Input label="Tags (comma separated)" value={tForm.tags} onChange={(e) => setTField("tags", e.target.value)} />
        <div className="sm:col-span-2"><Textarea label="Description" value={tForm.description} onChange={(e) => setTField("description", e.target.value)} rows={3} /></div>
        <div className="sm:col-span-2"><Textarea label="Highlights (comma or newline)" value={tForm.highlights} onChange={(e) => setTField("highlights", e.target.value)} rows={2} /></div>
      </FieldSection>

      <FieldSection title="Location & Duration">
        <Input label="Based in (city)" value={tForm.basedIn} onChange={(e) => setTField("basedIn", e.target.value)} />
        <Input label="Covers cities (comma separated)" value={tForm.coversCities} onChange={(e) => setTField("coversCities", e.target.value)} />
        {scope === "domestic" && <StateSelect value={tForm.state} onChange={(v) => setTField("state", v)} />}
        <LocationPickerField
          lat={tForm.latitude} lng={tForm.longitude}
          onChange={(v) => setTForm((c) => ({ ...c, latitude: v.lat, longitude: v.lng }))}
        />
        <Input label="Duration (hours)" type="number" value={tForm.durationHours} onChange={(e) => setTField("durationHours", e.target.value)} />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Duration (days)" type="number" value={tForm.durationDays} onChange={(e) => setTField("durationDays", e.target.value)} />
          <Input label="Duration (nights)" type="number" value={tForm.durationNights} onChange={(e) => setTField("durationNights", e.target.value)} />
        </div>
      </FieldSection>

      <FieldSection title="Itinerary">
        <RowList<TourItineraryRow>
          label="Stops" rows={tForm.itinerary} onChange={(rows) => setTForm((c) => ({ ...c, itinerary: rows }))}
          newRow={() => ({ time: "", title: "", description: "", location: "", locationLat: "", locationLng: "" })}
          renderRow={(r, patch, idx) => (<>
            <Input label="Time" value={r.time} onChange={(e) => patch({ time: e.target.value })} placeholder="09:00" />
            <Input label="Title" value={r.title} onChange={(e) => patch({ title: e.target.value })} />
            <Input label="Location" value={r.location} onChange={(e) => patch({ location: e.target.value })} />
            <ItineraryDescriptionField id={`admin-tour-it-desc-${idx}`} value={r.description} onChange={(v) => patch({ description: v })} />
            <LocationPickerField
              lat={r.locationLat} lng={r.locationLng} address={r.location}
              onChange={(v) => patch({ locationLat: v.lat, locationLng: v.lng, location: v.address ?? r.location })}
            />
          </>)}
        />
      </FieldSection>

      <FieldSection title="Pricing tiers">
        <RowList<TourPricingRow>
          label="Tiers" rows={tForm.pricing} onChange={(rows) => setTForm((c) => ({ ...c, pricing: rows }))}
          newRow={emptyPricingRow}
          renderRow={(r, patch) => (<>
            <Input label="Label" value={r.label} onChange={(e) => patch({ label: e.target.value })} placeholder="Adult" />
            <Input label="Price" type="number" value={r.price} onChange={(e) => patch({ price: e.target.value })} />
            <Input label="Min age" type="number" value={r.minAge} onChange={(e) => patch({ minAge: e.target.value })} />
            <Input label="Max age" type="number" value={r.maxAge} onChange={(e) => patch({ maxAge: e.target.value })} />
          </>)}
        />
        <Select label="Currency" value={tForm.currency} onChange={(e) => setTField("currency", e.target.value)}>
          {TOUR_CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </Select>
        <Input label="Min group size" type="number" value={tForm.minGroupSize} onChange={(e) => setTField("minGroupSize", e.target.value)} />
        <Input label="Max group size" type="number" value={tForm.maxGroupSize} onChange={(e) => setTField("maxGroupSize", e.target.value)} />
        <div className="flex items-end pb-1"><Checkbox label="Private tour available" checked={tForm.privateAvailable} onChange={(e) => setTField("privateAvailable", e.target.checked)} /></div>
        {tForm.privateAvailable && <Input label="Private tour price" type="number" value={tForm.privatePrice} onChange={(e) => setTField("privatePrice", e.target.value)} />}
      </FieldSection>

      <FieldSection title="Pickup & Inclusions">
        <div className="flex items-end pb-1"><Checkbox label="Pickup included" checked={tForm.pickupIncluded} onChange={(e) => setTField("pickupIncluded", e.target.checked)} /></div>
        <RowList<TourPickupRow>
          label="Pickup points" rows={tForm.pickupPoints} onChange={(rows) => setTForm((c) => ({ ...c, pickupPoints: rows }))}
          newRow={() => ({ name: "", time: "" })}
          renderRow={(r, patch) => (<>
            <Input label="Name" value={r.name} onChange={(e) => patch({ name: e.target.value })} />
            <Input label="Time" value={r.time} onChange={(e) => patch({ time: e.target.value })} />
          </>)}
        />
        <div className="sm:col-span-2"><Textarea label="Inclusions (comma or newline)" value={tForm.inclusions} onChange={(e) => setTField("inclusions", e.target.value)} rows={2} /></div>
        <div className="sm:col-span-2"><Textarea label="Exclusions (comma or newline)" value={tForm.exclusions} onChange={(e) => setTField("exclusions", e.target.value)} rows={2} /></div>
      </FieldSection>

      <FieldSection title="Availability">
        <div className="sm:col-span-2">
          <p className="mb-2 text-[13px] font-medium text-ink-soft">Operating days</p>
          <div className="flex flex-wrap gap-3">
            {TOUR_OPERATING_DAYS.map((day) => (
              <Checkbox key={day} label={DAY_LABELS[day]} checked={tForm.operatingDays.includes(day)} onChange={() => toggleTDay(day)} />
            ))}
          </div>
        </div>
        <Input label="Start times (comma separated)" value={tForm.startTimes} onChange={(e) => setTField("startTimes", e.target.value)} placeholder="09:00, 14:00" />
        <Input label="Advance booking (hours)" type="number" value={tForm.advanceBookingHrs} onChange={(e) => setTField("advanceBookingHrs", e.target.value)} />
        <Input label="Blackout dates (comma separated)" value={tForm.blackoutDates} onChange={(e) => setTField("blackoutDates", e.target.value)} />
        <Input label="Video URL" value={tForm.videoUrl} onChange={(e) => setTField("videoUrl", e.target.value)} />
      </FieldSection>
    </>
  );
}

// ── Tour Package ─────────────────────────────────────────────────────────────
function TourPackageFields({
  scope, tpForm, setTpForm, setTpField,
}: {
  scope: string;
  tpForm: TourPackageFormState;
  setTpForm: (fn: (c: TourPackageFormState) => TourPackageFormState) => void;
  setTpField: <K extends keyof TourPackageFormState>(key: K, value: TourPackageFormState[K]) => void;
}) {
  return (
    <>
      <FieldSection title="Basics">
        <Input label="Title" value={tpForm.title} onChange={(e) => setTpField("title", e.target.value)} placeholder="Kerala Family Getaway 5N/6D" />
        <Select label="Package type" value={tpForm.packageType} onChange={(e) => setTpField("packageType", e.target.value)}>
          {PACKAGE_TYPES.map((p) => <option key={p} value={p}>{titleCase(p)}</option>)}
        </Select>
        <Select label="Difficulty level (optional)" value={tpForm.difficultyLevel} onChange={(e) => setTpField("difficultyLevel", e.target.value)}>
          <option value="">—</option>
          {DIFFICULTY_LEVELS.map((d) => <option key={d} value={d}>{titleCase(d)}</option>)}
        </Select>
        <Input label="Tags (comma separated)" value={tpForm.tags} onChange={(e) => setTpField("tags", e.target.value)} />
        <div className="sm:col-span-2"><Textarea label="Description" value={tpForm.description} onChange={(e) => setTpField("description", e.target.value)} rows={3} /></div>
        <div className="sm:col-span-2"><Textarea label="Highlights (comma or newline)" value={tpForm.highlights} onChange={(e) => setTpField("highlights", e.target.value)} rows={2} /></div>
      </FieldSection>

      <FieldSection title="Route">
        <Input label="Origin" value={tpForm.origin} onChange={(e) => setTpField("origin", e.target.value)} />
        <Input label="Destinations (comma separated)" value={tpForm.destinations} onChange={(e) => setTpField("destinations", e.target.value)} />
        {scope === "domestic" && <StateSelect value={tpForm.state} onChange={(v) => setTpField("state", v)} />}
        <Input label="Duration (days)" type="number" value={tpForm.durationDays} onChange={(e) => setTpField("durationDays", e.target.value)} />
        <Input label="Duration (nights)" type="number" value={tpForm.durationNights} onChange={(e) => setTpField("durationNights", e.target.value)} />
      </FieldSection>

      <FieldSection title="Itinerary">
        <RowList<TourPkgItineraryRow>
          label="Days" rows={tpForm.itinerary} onChange={(rows) => setTpForm((c) => ({ ...c, itinerary: rows }))}
          newRow={() => emptyTourPkgItineraryRow(tpForm.itinerary.length + 1)}
          renderRow={(r, patch, idx) => (<>
            <Input label="Day" type="number" value={r.day} onChange={(e) => patch({ day: e.target.value })} />
            <Input label="Title" value={r.title} onChange={(e) => patch({ title: e.target.value })} />
            <ItineraryDescriptionField id={`admin-tp-it-desc-${idx}`} value={r.description} onChange={(v) => patch({ description: v })} />
            <Input label="Accommodation" value={r.accommodation} onChange={(e) => patch({ accommodation: e.target.value })} />
            <Input label="Activities (comma separated)" value={r.activities} onChange={(e) => patch({ activities: e.target.value })} />
            <div className="sm:col-span-2 flex gap-4">
              <Checkbox label="Breakfast" checked={r.breakfast} onChange={(e) => patch({ breakfast: e.target.checked })} />
              <Checkbox label="Lunch" checked={r.lunch} onChange={(e) => patch({ lunch: e.target.checked })} />
              <Checkbox label="Dinner" checked={r.dinner} onChange={(e) => patch({ dinner: e.target.checked })} />
            </div>
            <LocationPickerField
              lat={r.locationLat} lng={r.locationLng} address={r.locationAddress}
              onChange={(v) => patch({ locationLat: v.lat, locationLng: v.lng, locationAddress: v.address })}
            />
          </>)}
        />
      </FieldSection>

      <FieldSection title="Pricing">
        <Input label="Base price" type="number" value={tpForm.basePrice} onChange={(e) => setTpField("basePrice", e.target.value)} />
        <Select label="Currency" value={tpForm.currency} onChange={(e) => setTpField("currency", e.target.value)}>
          {PACKAGE_CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </Select>
        <div className="flex items-end pb-1"><Checkbox label="Per person" checked={tpForm.perPerson} onChange={(e) => setTpField("perPerson", e.target.checked)} /></div>
        <Input label="Max persons" type="number" value={tpForm.maxPersons} onChange={(e) => setTpField("maxPersons", e.target.value)} />
        <Input label="Child price" type="number" value={tpForm.childPrice} onChange={(e) => setTpField("childPrice", e.target.value)} />
        <Input label="Infant price" type="number" value={tpForm.infantPrice} onChange={(e) => setTpField("infantPrice", e.target.value)} />
        <Input label="Extra person charge" type="number" value={tpForm.extraPersonCharge} onChange={(e) => setTpField("extraPersonCharge", e.target.value)} />
        <Input label="Single supplement" type="number" value={tpForm.singleSupplement} onChange={(e) => setTpField("singleSupplement", e.target.value)} />
      </FieldSection>

      <FieldSection title="Discounts">
        <RowList<PackageDiscountRow>
          label="Discounts" rows={tpForm.discounts} onChange={(rows) => setTpForm((c) => ({ ...c, discounts: rows }))}
          newRow={() => ({ label: "", percent: "", validUntil: "" })}
          renderRow={(r, patch) => (<>
            <Input label="Label" value={r.label} onChange={(e) => patch({ label: e.target.value })} placeholder="Early bird" />
            <Input label="Percent" type="number" value={r.percent} onChange={(e) => patch({ percent: e.target.value })} />
            <Input label="Valid until" type="date" value={r.validUntil} onChange={(e) => patch({ validUntil: e.target.value })} />
          </>)}
        />
      </FieldSection>

      <FieldSection title="Departures">
        <RowList<PackageDepartureRow>
          label="Departures" rows={tpForm.departures} onChange={(rows) => setTpForm((c) => ({ ...c, departures: rows }))}
          newRow={() => ({ date: "", seatsTotal: "", status: "open" })}
          renderRow={(r, patch) => (<>
            <Input label="Date" type="date" value={r.date} onChange={(e) => patch({ date: e.target.value })} />
            <Input label="Seats total" type="number" value={r.seatsTotal} onChange={(e) => patch({ seatsTotal: e.target.value })} />
            <Select label="Status" value={r.status} onChange={(e) => patch({ status: e.target.value })}>
              {DEPARTURE_STATUS.map((s) => <option key={s} value={s}>{titleCase(s)}</option>)}
            </Select>
          </>)}
        />
      </FieldSection>

      <FieldSection title="Inclusions & Media">
        <div className="sm:col-span-2"><Textarea label="Custom inclusions (comma or newline)" value={tpForm.customInclusions} onChange={(e) => setTpField("customInclusions", e.target.value)} rows={2} /></div>
        <div className="sm:col-span-2"><Textarea label="Exclusions (comma or newline)" value={tpForm.exclusions} onChange={(e) => setTpField("exclusions", e.target.value)} rows={2} /></div>
        <Input label="Video URL" value={tpForm.videoUrl} onChange={(e) => setTpField("videoUrl", e.target.value)} />
      </FieldSection>
    </>
  );
}

// ── Holiday Package ────────────────────────────────────────────────────────
// Same shape as TourPackageFields — the only real difference is room-tier
// pricing (Standard/Deluxe/Luxury × meal plan) instead of one flat price.
function HolidayPackageFields({
  scope, hForm, setHForm, setHField,
}: {
  scope: string;
  hForm: HolidayPackageFormState;
  setHForm: (fn: (c: HolidayPackageFormState) => HolidayPackageFormState) => void;
  setHField: <K extends keyof HolidayPackageFormState>(key: K, value: HolidayPackageFormState[K]) => void;
}) {
  return (
    <>
      <FieldSection title="Basics">
        <Input label="Title" value={hForm.title} onChange={(e) => setHField("title", e.target.value)} placeholder="Goa Beach Holiday 4D/5N" />
        <Select label="Package type" value={hForm.packageType} onChange={(e) => setHField("packageType", e.target.value)}>
          {PACKAGE_TYPES.map((p) => <option key={p} value={p}>{titleCase(p)}</option>)}
        </Select>
        <Input label="Tags (comma separated)" value={hForm.tags} onChange={(e) => setHField("tags", e.target.value)} />
        <div className="sm:col-span-2"><Textarea label="Description" value={hForm.description} onChange={(e) => setHField("description", e.target.value)} rows={3} /></div>
        <div className="sm:col-span-2"><Textarea label="Highlights (comma or newline)" value={hForm.highlights} onChange={(e) => setHField("highlights", e.target.value)} rows={2} /></div>
      </FieldSection>

      <FieldSection title="Route">
        <Input label="Origin" value={hForm.origin} onChange={(e) => setHField("origin", e.target.value)} />
        <Input label="Destinations (comma separated)" value={hForm.destinations} onChange={(e) => setHField("destinations", e.target.value)} />
        <div className="sm:col-span-2">
          <p className="mb-1 text-[13px] font-medium text-ink-soft">Origin location (start of the route map)</p>
          <LocationPickerField
            lat={hForm.originLat} lng={hForm.originLng} address={hForm.originAddress}
            onChange={(v) => setHForm((c) => ({ ...c, originLat: v.lat, originLng: v.lng, originAddress: v.address ?? c.originAddress }))}
          />
        </div>
        <div className="sm:col-span-2">
          <p className="mb-1 text-[13px] font-medium text-ink-soft">Destination location (end of the route map)</p>
          <LocationPickerField
            lat={hForm.destinationLat} lng={hForm.destinationLng} address={hForm.destinationAddress}
            onChange={(v) => setHForm((c) => ({ ...c, destinationLat: v.lat, destinationLng: v.lng, destinationAddress: v.address ?? c.destinationAddress }))}
          />
        </div>
        {scope === "domestic" && <StateSelect value={hForm.state} onChange={(v) => setHField("state", v)} />}
        <Input label="Duration (days)" type="number" value={hForm.durationDays} onChange={(e) => setHField("durationDays", e.target.value)} />
        <Input label="Duration (nights)" type="number" value={hForm.durationNights} onChange={(e) => setHField("durationNights", e.target.value)} />
      </FieldSection>

      <FieldSection title="Itinerary">
        <RowList<TourPkgItineraryRow>
          label="Days" rows={hForm.itinerary} onChange={(rows) => setHForm((c) => ({ ...c, itinerary: rows }))}
          newRow={() => emptyTourPkgItineraryRow(hForm.itinerary.length + 1)}
          renderRow={(r, patch, idx) => (<>
            <Input label="Day" type="number" value={r.day} onChange={(e) => patch({ day: e.target.value })} />
            <Input label="Title" value={r.title} onChange={(e) => patch({ title: e.target.value })} />
            <ItineraryDescriptionField id={`admin-hp-it-desc-${idx}`} value={r.description} onChange={(v) => patch({ description: v })} />
            <Input label="Accommodation" value={r.accommodation} onChange={(e) => patch({ accommodation: e.target.value })} />
            <Input label="Activities (comma separated)" value={r.activities} onChange={(e) => patch({ activities: e.target.value })} />
            <div className="sm:col-span-2 flex gap-4">
              <Checkbox label="Breakfast" checked={r.breakfast} onChange={(e) => patch({ breakfast: e.target.checked })} />
              <Checkbox label="Lunch" checked={r.lunch} onChange={(e) => patch({ lunch: e.target.checked })} />
              <Checkbox label="Dinner" checked={r.dinner} onChange={(e) => patch({ dinner: e.target.checked })} />
            </div>
            <LocationPickerField
              lat={r.locationLat} lng={r.locationLng} address={r.locationAddress}
              onChange={(v) => patch({ locationLat: v.lat, locationLng: v.lng, locationAddress: v.address })}
            />
          </>)}
        />
      </FieldSection>

      <FieldSection title="Room tiers">
        <p className="text-[13px] text-ink-muted sm:col-span-2">
          Price this package by room category, the way MakeMyTrip/Yatra do — add one row per tier with its own meal plan and price.
        </p>
        <RowList<RoomTierRow>
          label="Room tiers" rows={hForm.roomTiers} onChange={(rows) => setHForm((c) => ({ ...c, roomTiers: rows }))}
          newRow={emptyRoomTierRow}
          renderRow={(r, patch) => (<>
            <Select label="Room type" value={r.roomType} onChange={(e) => patch({ roomType: e.target.value })}>
              {HOLIDAY_ROOM_TYPES.map((t) => <option key={t} value={t}>{titleCase(t)}</option>)}
            </Select>
            <Select label="Meal plan" value={r.mealPlan} onChange={(e) => patch({ mealPlan: e.target.value })}>
              {HOLIDAY_MEAL_PLANS.map((m) => <option key={m} value={m}>{titleCase(m)}</option>)}
            </Select>
            <Input label="Price per person" type="number" value={r.price} onChange={(e) => patch({ price: e.target.value })} />
            <Input label="Max occupancy" type="number" value={r.maxOccupancy} onChange={(e) => patch({ maxOccupancy: e.target.value })} />
            <Input label="Child price (optional)" type="number" value={r.childPrice} onChange={(e) => patch({ childPrice: e.target.value })} />
            <Input label="Extra bed price (optional)" type="number" value={r.extraBedPrice} onChange={(e) => patch({ extraBedPrice: e.target.value })} />
          </>)}
        />
        <Select label="Currency" value={hForm.currency} onChange={(e) => setHField("currency", e.target.value)}>
          {PACKAGE_CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </Select>
        <Input label="Single supplement (optional)" type="number" value={hForm.singleSupplement} onChange={(e) => setHField("singleSupplement", e.target.value)} />
      </FieldSection>

      <FieldSection title="Discounts">
        <RowList<PackageDiscountRow>
          label="Discounts" rows={hForm.discounts} onChange={(rows) => setHForm((c) => ({ ...c, discounts: rows }))}
          newRow={() => ({ label: "", percent: "", validUntil: "" })}
          renderRow={(r, patch) => (<>
            <Input label="Label" value={r.label} onChange={(e) => patch({ label: e.target.value })} placeholder="Early bird" />
            <Input label="Percent" type="number" value={r.percent} onChange={(e) => patch({ percent: e.target.value })} />
            <Input label="Valid until" type="date" value={r.validUntil} onChange={(e) => patch({ validUntil: e.target.value })} />
          </>)}
        />
      </FieldSection>

      <FieldSection title="Departures">
        <RowList<PackageDepartureRow>
          label="Departures" rows={hForm.departures} onChange={(rows) => setHForm((c) => ({ ...c, departures: rows }))}
          newRow={() => ({ date: "", seatsTotal: "", status: "open" })}
          renderRow={(r, patch) => (<>
            <Input label="Date" type="date" value={r.date} onChange={(e) => patch({ date: e.target.value })} />
            <Input label="Seats total" type="number" value={r.seatsTotal} onChange={(e) => patch({ seatsTotal: e.target.value })} />
            <Select label="Status" value={r.status} onChange={(e) => patch({ status: e.target.value })}>
              {DEPARTURE_STATUS.map((s) => <option key={s} value={s}>{titleCase(s)}</option>)}
            </Select>
          </>)}
        />
      </FieldSection>

      <FieldSection title="Inclusions & Media">
        <div className="sm:col-span-2"><Textarea label="Custom inclusions (comma or newline)" value={hForm.customInclusions} onChange={(e) => setHField("customInclusions", e.target.value)} rows={2} /></div>
        <div className="sm:col-span-2"><Textarea label="Exclusions (comma or newline)" value={hForm.exclusions} onChange={(e) => setHField("exclusions", e.target.value)} rows={2} /></div>
        <Input label="Video URL" value={hForm.videoUrl} onChange={(e) => setHField("videoUrl", e.target.value)} />
      </FieldSection>
    </>
  );
}

// ── Cruise ───────────────────────────────────────────────────────────────────
function CruiseFields({
  cForm, setCForm, setCField,
}: {
  cForm: CruiseFormState;
  setCForm: (fn: (c: CruiseFormState) => CruiseFormState) => void;
  setCField: <K extends keyof CruiseFormState>(key: K, value: CruiseFormState[K]) => void;
}) {
  return (
    <>
      <FieldSection title="Basics">
        <Input label="Cruise name" value={cForm.cruiseName} onChange={(e) => setCField("cruiseName", e.target.value)} placeholder="Backwater Sunset Cruise" />
        <Select label="Cruise type" value={cForm.cruiseType} onChange={(e) => setCField("cruiseType", e.target.value)}>
          {CRUISE_TYPES.map((c) => <option key={c} value={c}>{titleCase(c)}</option>)}
        </Select>
        <Input label="Tags (comma separated)" value={cForm.tags} onChange={(e) => setCField("tags", e.target.value)} />
        <div className="sm:col-span-2"><Textarea label="Description" value={cForm.description} onChange={(e) => setCField("description", e.target.value)} rows={3} /></div>
        <div className="sm:col-span-2"><Textarea label="Highlights (comma or newline)" value={cForm.highlights} onChange={(e) => setCField("highlights", e.target.value)} rows={2} /></div>
      </FieldSection>

      <FieldSection title="Vessel">
        <Input label="Vessel name" value={cForm.vesselName} onChange={(e) => setCField("vesselName", e.target.value)} />
        <Input label="Operator" value={cForm.vesselOperator} onChange={(e) => setCField("vesselOperator", e.target.value)} />
        <Input label="Total decks" type="number" value={cForm.vesselTotalDecks} onChange={(e) => setCField("vesselTotalDecks", e.target.value)} />
        <Input label="Built year" type="number" value={cForm.vesselBuiltYear} onChange={(e) => setCField("vesselBuiltYear", e.target.value)} />
      </FieldSection>

      <FieldSection title="Route">
        <Input label="Departure port" value={cForm.departurePort} onChange={(e) => setCField("departurePort", e.target.value)} />
        <Input label="Arrival port" value={cForm.arrivalPort} onChange={(e) => setCField("arrivalPort", e.target.value)} />
        <Input label="Duration (days)" type="number" value={cForm.durationDays} onChange={(e) => setCField("durationDays", e.target.value)} />
        <Input label="Duration (nights)" type="number" value={cForm.durationNights} onChange={(e) => setCField("durationNights", e.target.value)} />
        <RowList<CruiseStopRow>
          label="Stops" rows={cForm.stops} onChange={(rows) => setCForm((c) => ({ ...c, stops: rows }))}
          newRow={() => ({ port: "", arrivalTime: "", departureTime: "" })}
          renderRow={(r, patch) => (<>
            <Input label="Port" value={r.port} onChange={(e) => patch({ port: e.target.value })} />
            <Input label="Arrival time" value={r.arrivalTime} onChange={(e) => patch({ arrivalTime: e.target.value })} />
            <Input label="Departure time" value={r.departureTime} onChange={(e) => patch({ departureTime: e.target.value })} />
          </>)}
        />
      </FieldSection>

      <FieldSection title="Cabins">
        <Select label="Currency" value={cForm.currency} onChange={(e) => setCField("currency", e.target.value)}>
          {CRUISE_CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </Select>
        <RowList<CruiseCabinRow>
          label="Cabin types" rows={cForm.cabins} onChange={(rows) => setCForm((c) => ({ ...c, cabins: rows }))}
          newRow={emptyCabinRow}
          renderRow={(r, patch) => (<>
            <Select label="Type" value={r.type} onChange={(e) => patch({ type: e.target.value })}>
              {CABIN_TYPES.map((t) => <option key={t} value={t}>{titleCase(t)}</option>)}
            </Select>
            <Input label="Label" value={r.label} onChange={(e) => patch({ label: e.target.value })} />
            <Input label="Max occupancy" type="number" value={r.maxOccupancy} onChange={(e) => patch({ maxOccupancy: e.target.value })} />
            <Input label="Price per person" type="number" value={r.pricePerPerson} onChange={(e) => patch({ pricePerPerson: e.target.value })} />
            <Input label="Total cabins" type="number" value={r.totalCabins} onChange={(e) => patch({ totalCabins: e.target.value })} />
            <Input label="Amenities (comma separated)" value={r.amenities} onChange={(e) => patch({ amenities: e.target.value })} />
            <div className="flex items-end pb-1"><Checkbox label="Refundable" checked={r.isRefundable} onChange={(e) => patch({ isRefundable: e.target.checked })} /></div>
          </>)}
        />
      </FieldSection>

      <FieldSection title="Amenities & Dining">
        <Input label="Ship amenities (comma separated)" value={cForm.shipAmenities} onChange={(e) => setCField("shipAmenities", e.target.value)} />
        <Input label="Dining options (comma separated)" value={cForm.diningOptions} onChange={(e) => setCField("diningOptions", e.target.value)} />
        <div className="sm:col-span-2 flex gap-4">
          <Checkbox label="Breakfast included" checked={cForm.mealBreakfast} onChange={(e) => setCField("mealBreakfast", e.target.checked)} />
          <Checkbox label="Lunch included" checked={cForm.mealLunch} onChange={(e) => setCField("mealLunch", e.target.checked)} />
          <Checkbox label="Dinner included" checked={cForm.mealDinner} onChange={(e) => setCField("mealDinner", e.target.checked)} />
        </div>
      </FieldSection>

      <FieldSection title="Departures">
        <RowList<CruiseDepartureRow>
          label="Departures" rows={cForm.departures} onChange={(rows) => setCForm((c) => ({ ...c, departures: rows }))}
          newRow={() => ({ date: "", status: "open" })}
          renderRow={(r, patch) => (<>
            <Input label="Date" type="date" value={r.date} onChange={(e) => patch({ date: e.target.value })} />
            <Select label="Status" value={r.status} onChange={(e) => patch({ status: e.target.value })}>
              {CRUISE_DEPARTURE_STATUS.map((s) => <option key={s} value={s}>{titleCase(s)}</option>)}
            </Select>
          </>)}
        />
      </FieldSection>

      <FieldSection title="Policies">
        <Input label="Free cancellation (days before)" type="number" value={cForm.freeCancelDays} onChange={(e) => setCField("freeCancelDays", e.target.value)} />
        <Input label="Cancellation charge (%)" type="number" value={cForm.chargePercent} onChange={(e) => setCField("chargePercent", e.target.value)} />
        <Input label="Min boarding age" type="number" value={cForm.minAge} onChange={(e) => setCField("minAge", e.target.value)} />
        <Input label="Max boarding age" type="number" value={cForm.maxAge} onChange={(e) => setCField("maxAge", e.target.value)} />
      </FieldSection>
    </>
  );
}

// ── Taxi Package ─────────────────────────────────────────────────────────────
function TaxiPackageFields({
  scope, xpForm, setXpForm, setXpField,
}: {
  scope: string;
  xpForm: TaxiPackageFormState;
  setXpForm: (fn: (c: TaxiPackageFormState) => TaxiPackageFormState) => void;
  setXpField: <K extends keyof TaxiPackageFormState>(key: K, value: TaxiPackageFormState[K]) => void;
}) {
  return (
    <>
      <FieldSection title="Basics">
        <Input label="Title" value={xpForm.title} onChange={(e) => setXpField("title", e.target.value)} placeholder="Delhi to Ladakh 3N/4D" />
        <Input label="Tags (comma separated)" value={xpForm.tags} onChange={(e) => setXpField("tags", e.target.value)} />
        <div className="sm:col-span-2"><Textarea label="Description" value={xpForm.description} onChange={(e) => setXpField("description", e.target.value)} rows={3} /></div>
        <div className="sm:col-span-2"><Textarea label="Highlights (comma or newline)" value={xpForm.highlights} onChange={(e) => setXpField("highlights", e.target.value)} rows={2} /></div>
      </FieldSection>

      <FieldSection title="Route">
        <Input label="Origin" value={xpForm.origin} onChange={(e) => setXpField("origin", e.target.value)} />
        <Input label="Destinations (comma separated)" value={xpForm.destinations} onChange={(e) => setXpField("destinations", e.target.value)} />
        <div className="sm:col-span-2">
          <p className="mb-1 text-[13px] font-medium text-ink-soft">Origin location (start of the route map)</p>
          <LocationPickerField
            lat={xpForm.originLat} lng={xpForm.originLng} address={xpForm.originAddress}
            onChange={(v) => setXpForm((c) => ({ ...c, originLat: v.lat, originLng: v.lng, originAddress: v.address ?? c.originAddress }))}
          />
        </div>
        {scope === "domestic" && <StateSelect value={xpForm.state} onChange={(v) => setXpField("state", v)} />}
        <Input label="Total distance (km)" type="number" value={xpForm.totalKm} onChange={(e) => setXpField("totalKm", e.target.value)} />
        <Input label="Duration (days)" type="number" value={xpForm.durationDays} onChange={(e) => setXpField("durationDays", e.target.value)} />
        <Input label="Duration (nights)" type="number" value={xpForm.durationNights} onChange={(e) => setXpField("durationNights", e.target.value)} />
      </FieldSection>

      <FieldSection title="Itinerary">
        <RowList<TaxiPackageItineraryRow>
          label="Days" rows={xpForm.itinerary} onChange={(rows) => setXpForm((c) => ({ ...c, itinerary: rows }))}
          newRow={() => emptyTaxiPkgItineraryRow(xpForm.itinerary.length + 1)}
          renderRow={(r, patch, idx) => (<>
            <Input label="Day" type="number" value={r.day} onChange={(e) => patch({ day: e.target.value })} />
            <Input label="Title" value={r.title} onChange={(e) => patch({ title: e.target.value })} />
            <ItineraryDescriptionField id={`admin-xp-it-desc-${idx}`} value={r.description} onChange={(v) => patch({ description: v })} />
            <Input label="Activities (comma separated)" value={r.activities} onChange={(e) => patch({ activities: e.target.value })} />
            <Input label="Distance (km)" type="number" value={r.distance} onChange={(e) => patch({ distance: e.target.value })} />
            <Input label="Overnight stop" value={r.overnight} onChange={(e) => patch({ overnight: e.target.value })} />
            <LocationPickerField
              lat={r.locationLat} lng={r.locationLng} address={r.locationAddress}
              onChange={(v) => patch({ locationLat: v.lat, locationLng: v.lng, locationAddress: v.address })}
            />
          </>)}
        />
      </FieldSection>

      <FieldSection title="Pricing">
        <Input label="Base price" type="number" value={xpForm.basePrice} onChange={(e) => setXpField("basePrice", e.target.value)} />
        <Input label="Currency" value={xpForm.currency} onChange={(e) => setXpField("currency", e.target.value)} />
        <Input label="Max persons" type="number" value={xpForm.maxPersons} onChange={(e) => setXpField("maxPersons", e.target.value)} />
        <Input label="Extra person charge" type="number" value={xpForm.extraPersonCharge} onChange={(e) => setXpField("extraPersonCharge", e.target.value)} />
        <div className="sm:col-span-2 flex flex-wrap gap-4">
          <Checkbox label="Tolls included" checked={xpForm.tollsIncluded} onChange={(e) => setXpField("tollsIncluded", e.target.checked)} />
          <Checkbox label="Driver allowance included" checked={xpForm.driverAllowance} onChange={(e) => setXpField("driverAllowance", e.target.checked)} />
          <Checkbox label="Fuel included" checked={xpForm.fuelIncluded} onChange={(e) => setXpField("fuelIncluded", e.target.checked)} />
        </div>
      </FieldSection>

      <FieldSection title="Inclusions & Availability">
        <div className="sm:col-span-2"><Textarea label="Inclusions (comma or newline)" value={xpForm.inclusions} onChange={(e) => setXpField("inclusions", e.target.value)} rows={2} /></div>
        <div className="sm:col-span-2"><Textarea label="Exclusions (comma or newline)" value={xpForm.exclusions} onChange={(e) => setXpField("exclusions", e.target.value)} rows={2} /></div>
        <Input label="Start dates (comma separated)" placeholder="mm/dd/yyyy, mm/dd/yyyy" value={xpForm.startDates} onChange={(e) => setXpField("startDates", e.target.value)} />
        <Input label="Blackout dates (comma separated)" placeholder="mm/dd/yyyy, mm/dd/yyyy" value={xpForm.blackoutDates} onChange={(e) => setXpField("blackoutDates", e.target.value)} />
        <Input label="Advance booking (days)" type="number" value={xpForm.advanceBookingDays} onChange={(e) => setXpField("advanceBookingDays", e.target.value)} />
      </FieldSection>
    </>
  );
}
