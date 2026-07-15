"use client";

import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from "react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Checkbox from "@/components/ui/Checkbox";
import EmptyState from "@/components/ui/EmptyState";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { useToast } from "@/components/ui/Toast";
import StatusBadge from "@/components/dashboard/StatusBadge";
import LocationPickerField from "./LocationPickerField";
import StateSelect from "@/components/ui/StateSelect";
import ItineraryDescriptionField from "./ItineraryDescriptionField";
import { useSubmitForReview, SUBMITTABLE_STATUSES } from "./useSubmitForReview";
import {
  partnerClient,
  type HotelListingApi,
  type TaxiListingApi,
  type TourListingApi,
  type HolidayPackageApi,
} from "@/lib/partnerClient";
import {
  buildHolidayPackageFormData,
  emptyItineraryRow,
  emptyRoomTierRow,
  emptyHolidayPackageForm,
  holidayPackageFormFromApi,
  validateHolidayPackageForm,
  PACKAGE_TYPES,
  PACKAGE_CURRENCIES,
  DEPARTURE_STATUS,
  HOLIDAY_ROOM_TYPES,
  HOLIDAY_MEAL_PLANS,
  type PackageDepartureRow,
  type PackageDiscountRow,
  type PackageItineraryRow,
  type RoomTierRow,
  type HolidayPackageFiles,
  type HolidayPackageFormState,
} from "@/lib/holidayPackageForm";

type Mode = "list" | "form";

function titleCase(value: string): string {
  return value.split("_").map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(" ");
}

export default function HolidayPackageManager() {
  const toast = useToast();
  const [packages, setPackages] = useState<HolidayPackageApi[]>([]);
  const [taxis, setTaxis] = useState<TaxiListingApi[]>([]);
  const [hotels, setHotels] = useState<HotelListingApi[]>([]);
  const [tours, setTours] = useState<TourListingApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<Mode>("list");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<HolidayPackageFormState>(() => emptyHolidayPackageForm());
  const [files, setFiles] = useState<HolidayPackageFiles>({ thumbnail: null, images: [] });
  const [saving, setSaving] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const [pkgs, t, h, tr] = await Promise.all([
        partnerClient.holidayPackages.list(),
        partnerClient.taxis.list().catch(() => [] as TaxiListingApi[]),
        partnerClient.hotels.list().catch(() => [] as HotelListingApi[]),
        partnerClient.tours.list().catch(() => [] as TourListingApi[]),
      ]);
      setPackages(pkgs);
      setTaxis(t);
      setHotels(h);
      setTours(tr);
    } catch (error) {
      toast.push({
        title: "Could not load holiday packages",
        description: error instanceof Error ? error.message : "Please try again.",
        tone: "danger",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const { submittingId, submit: submitForReview } = useSubmitForReview("holiday", refresh);

  function setField<K extends keyof HolidayPackageFormState>(key: K, value: HolidayPackageFormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function openCreate() {
    setEditingId(null);
    setForm(emptyHolidayPackageForm());
    setFiles({ thumbnail: null, images: [] });
    setMode("form");
  }
  function openEdit(pkg: HolidayPackageApi) {
    setEditingId(pkg.id);
    setForm(holidayPackageFormFromApi(pkg));
    setFiles({ thumbnail: null, images: [] });
    setMode("form");
  }
  function backToList() {
    if (saving) return;
    setMode("list");
    setEditingId(null);
  }

  function toggleInclude(key: "includeHotels" | "includeTours", id: string) {
    setForm((c) => ({
      ...c,
      [key]: c[key].includes(id) ? c[key].filter((x) => x !== id) : [...c[key], id],
    }));
  }

  function setItinerary(index: number, key: keyof PackageItineraryRow, value: string | boolean) {
    setForm((c) => ({ ...c, itinerary: c.itinerary.map((r, i) => (i === index ? { ...r, [key]: value } : r)) }));
  }
  function patchItinerary(index: number, patch: Partial<PackageItineraryRow>) {
    setForm((c) => ({ ...c, itinerary: c.itinerary.map((r, i) => (i === index ? { ...r, ...patch } : r)) }));
  }
  function setRoomTier(index: number, key: keyof RoomTierRow, value: string) {
    setForm((c) => ({ ...c, roomTiers: c.roomTiers.map((r, i) => (i === index ? { ...r, [key]: value } : r)) }));
  }
  function setDiscount(index: number, key: keyof PackageDiscountRow, value: string) {
    setForm((c) => ({ ...c, discounts: c.discounts.map((r, i) => (i === index ? { ...r, [key]: value } : r)) }));
  }
  function setDeparture(index: number, key: keyof PackageDepartureRow, value: string) {
    setForm((c) => ({ ...c, departures: c.departures.map((r, i) => (i === index ? { ...r, [key]: value } : r)) }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const error = validateHolidayPackageForm(form);
    if (error) {
      toast.push({ title: "Please review the package", description: error, tone: "warn" });
      return;
    }
    setSaving(true);
    try {
      const data = buildHolidayPackageFormData(form, files);
      if (editingId) await partnerClient.holidayPackages.update(editingId, data);
      else await partnerClient.holidayPackages.create(data);
      toast.push({ title: editingId ? "Holiday package updated" : "Holiday package created", tone: "success" });
      await refresh();
      setMode("list");
      setEditingId(null);
    } catch (err) {
      toast.push({
        title: editingId ? "Could not update package" : "Could not create package",
        description: err instanceof Error ? err.message : "Please try again.",
        tone: "danger",
      });
    } finally {
      setSaving(false);
    }
  }

  async function removePackage(pkg: HolidayPackageApi) {
    if (!window.confirm(`Delete "${pkg.title}"? This cannot be undone.`)) return;
    try {
      await partnerClient.holidayPackages.remove(pkg.id);
      setPackages((c) => c.filter((p) => p.id !== pkg.id));
      toast.push({ title: "Holiday package deleted", tone: "success" });
    } catch (error) {
      toast.push({
        title: "Could not delete package",
        description: error instanceof Error ? error.message : "Please try again.",
        tone: "danger",
      });
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  if (mode === "form") {
    return (
      <form onSubmit={submit} className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-700">
              {editingId ? "Edit Holiday Package" : "New Holiday Package"}
            </p>
            <h1 className="mt-1 text-3xl font-black text-ink">
              {editingId ? form.title || "Edit package" : "Create a holiday package"}
            </h1>
          </div>
          <Button type="button" variant="ghost" onClick={backToList} disabled={saving}>Back</Button>
        </div>

        <Section title="Basics">
          <Input id="hp-title" label="Title" value={form.title} onChange={(e) => setField("title", e.target.value)} placeholder="Goa Beach Holiday 4D/5N" />
          <Select id="hp-type" label="Package type" value={form.packageType} onChange={(e) => setField("packageType", e.target.value)}>
            {PACKAGE_TYPES.map((p) => (<option key={p} value={p}>{titleCase(p)}</option>))}
          </Select>
          <Select id="hp-status" label="Status" value={form.status} onChange={(e) => setField("status", e.target.value as HolidayPackageFormState["status"])}>
            <option value="draft">Draft</option>
            <option value="active">Active (still needs admin approval to go live)</option>
          </Select>
          <TextArea id="hp-desc" label="Description" value={form.description} onChange={(v) => setField("description", v)} />
          <Input id="hp-highlights" label="Highlights (comma separated)" value={form.highlights} onChange={(e) => setField("highlights", e.target.value)} />
          <Input id="hp-tags" label="Tags (comma separated)" value={form.tags} onChange={(e) => setField("tags", e.target.value)} />
        </Section>

        <Section title="Route">
          <Input id="hp-origin" label="Origin" value={form.origin} onChange={(e) => setField("origin", e.target.value)} placeholder="Delhi" />
          <Input id="hp-dests" label="Destinations (comma separated)" value={form.destinations} onChange={(e) => setField("destinations", e.target.value)} placeholder="Goa" />
          <div className="sm:col-span-2">
            <p className="mb-1 text-[13px] font-medium text-ink-soft">Origin location (start of the route map)</p>
            <LocationPickerField
              lat={form.originLat} lng={form.originLng} address={form.originAddress}
              onChange={(v) => setForm((c) => ({ ...c, originLat: v.lat, originLng: v.lng, originAddress: v.address ?? c.originAddress }))}
            />
          </div>
          <div className="sm:col-span-2">
            <p className="mb-1 text-[13px] font-medium text-ink-soft">Destination location (end of the route map)</p>
            <LocationPickerField
              lat={form.destinationLat} lng={form.destinationLng} address={form.destinationAddress}
              onChange={(v) => setForm((c) => ({ ...c, destinationLat: v.lat, destinationLng: v.lng, destinationAddress: v.address ?? c.destinationAddress }))}
            />
          </div>
          <StateSelect value={form.state} onChange={(v) => setField("state", v)} />
          <Input id="hp-days" label="Duration (days)" type="number" min="1" value={form.durationDays} onChange={(e) => setField("durationDays", e.target.value)} />
          <Input id="hp-nights" label="Duration (nights)" type="number" min="0" value={form.durationNights} onChange={(e) => setField("durationNights", e.target.value)} />
        </Section>

        <Section title="Includes (your own listings)">
          <Select id="hp-inc-taxi" label="Taxi (optional)" value={form.includeTaxi} onChange={(e) => setField("includeTaxi", e.target.value)}>
            <option value="">No taxi</option>
            {taxis.map((t) => (
              <option key={t.id} value={t.id}>{t.vehicle.make} {t.vehicle.model}{t.vehicle.registrationNumber ? ` • ${t.vehicle.registrationNumber}` : ""}</option>
            ))}
          </Select>
          <div />
          <IncludePicker label="Hotels" empty="No hotels listed yet." items={hotels.map((h) => ({ id: h.id, label: `${h.name}${h.address?.city ? ` • ${h.address.city}` : ""}` }))} selected={form.includeHotels} onToggle={(id) => toggleInclude("includeHotels", id)} />
          <IncludePicker label="Tours" empty="No tours listed yet." items={tours.map((t) => ({ id: t.id, label: `${t.title} • ${t.basedIn}` }))} selected={form.includeTours} onToggle={(id) => toggleInclude("includeTours", id)} />
        </Section>

        <Section title="Itinerary">
          <div className="space-y-4 sm:col-span-2">
            {form.itinerary.map((row, index) => (
              <div key={index} className="rounded-xl border border-border-soft bg-surface-muted p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-semibold text-ink">Day {row.day || index + 1}</p>
                  {form.itinerary.length > 1 ? (
                    <Button type="button" variant="ghost" onClick={() => setForm((c) => ({ ...c, itinerary: c.itinerary.filter((_, i) => i !== index) }))}>Remove</Button>
                  ) : null}
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input id={`hp-it-day-${index}`} label="Day" type="number" min="1" value={row.day} onChange={(e) => setItinerary(index, "day", e.target.value)} />
                  <Input id={`hp-it-title-${index}`} label="Title" value={row.title} onChange={(e) => setItinerary(index, "title", e.target.value)} />
                  <Input id={`hp-it-acc-${index}`} label="Accommodation" value={row.accommodation} onChange={(e) => setItinerary(index, "accommodation", e.target.value)} />
                  <Input id={`hp-it-act-${index}`} label="Activities (comma separated)" value={row.activities} onChange={(e) => setItinerary(index, "activities", e.target.value)} />
                  <ItineraryDescriptionField id={`hp-it-desc-${index}`} value={row.description} onChange={(v) => setItinerary(index, "description", v)} />
                  <div className="flex flex-wrap items-end gap-3">
                    <Checkbox id={`hp-it-b-${index}`} label="Breakfast" checked={row.breakfast} onChange={(e) => setItinerary(index, "breakfast", e.target.checked)} />
                    <Checkbox id={`hp-it-l-${index}`} label="Lunch" checked={row.lunch} onChange={(e) => setItinerary(index, "lunch", e.target.checked)} />
                    <Checkbox id={`hp-it-d-${index}`} label="Dinner" checked={row.dinner} onChange={(e) => setItinerary(index, "dinner", e.target.checked)} />
                  </div>
                  <LocationPickerField
                    lat={row.locationLat} lng={row.locationLng} address={row.locationAddress}
                    onChange={(v) => patchItinerary(index, { locationLat: v.lat, locationLng: v.lng, locationAddress: v.address })}
                  />
                </div>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={() => setForm((c) => ({ ...c, itinerary: [...c.itinerary, emptyItineraryRow(c.itinerary.length + 1)] }))}>Add day</Button>
          </div>
        </Section>

        <Section title="Room tiers">
          <p className="text-[13px] text-ink-muted sm:col-span-2">
            Price this package by room category, the way MakeMyTrip/Yatra do — add one row per tier (e.g. Standard, Deluxe, Luxury) with its own meal plan and price.
          </p>
          <div className="space-y-4 sm:col-span-2">
            {form.roomTiers.map((row, index) => (
              <div key={index} className="grid gap-3 rounded-xl border border-border-soft bg-surface-muted p-4 sm:grid-cols-3">
                <Select id={`hp-rt-type-${index}`} label="Room type" value={row.roomType} onChange={(e) => setRoomTier(index, "roomType", e.target.value)}>
                  {HOLIDAY_ROOM_TYPES.map((t) => (<option key={t} value={t}>{titleCase(t)}</option>))}
                </Select>
                <Select id={`hp-rt-meal-${index}`} label="Meal plan" value={row.mealPlan} onChange={(e) => setRoomTier(index, "mealPlan", e.target.value)}>
                  {HOLIDAY_MEAL_PLANS.map((m) => (<option key={m} value={m}>{titleCase(m)}</option>))}
                </Select>
                <Input id={`hp-rt-price-${index}`} label="Price per person" type="number" min="0" value={row.price} onChange={(e) => setRoomTier(index, "price", e.target.value)} />
                <Input id={`hp-rt-occ-${index}`} label="Max occupancy" type="number" min="1" value={row.maxOccupancy} onChange={(e) => setRoomTier(index, "maxOccupancy", e.target.value)} />
                <Input id={`hp-rt-child-${index}`} label="Child price (optional)" type="number" min="0" value={row.childPrice} onChange={(e) => setRoomTier(index, "childPrice", e.target.value)} />
                <Input id={`hp-rt-bed-${index}`} label="Extra bed price (optional)" type="number" min="0" value={row.extraBedPrice} onChange={(e) => setRoomTier(index, "extraBedPrice", e.target.value)} />
                {form.roomTiers.length > 1 ? (
                  <div className="flex items-end">
                    <Button type="button" variant="ghost" onClick={() => setForm((c) => ({ ...c, roomTiers: c.roomTiers.filter((_, i) => i !== index) }))}>Remove tier</Button>
                  </div>
                ) : null}
              </div>
            ))}
            <Button type="button" variant="outline" onClick={() => setForm((c) => ({ ...c, roomTiers: [...c.roomTiers, emptyRoomTierRow()] }))}>Add room tier</Button>
          </div>
          <Select id="hp-cur" label="Currency" value={form.currency} onChange={(e) => setField("currency", e.target.value)}>
            {PACKAGE_CURRENCIES.map((c) => (<option key={c} value={c}>{c}</option>))}
          </Select>
          <Input id="hp-single" label="Single supplement (optional)" type="number" min="0" value={form.singleSupplement} onChange={(e) => setField("singleSupplement", e.target.value)} />
        </Section>

        <Section title="Discounts">
          <div className="space-y-4 sm:col-span-2">
            {form.discounts.map((row, index) => (
              <div key={index} className="grid gap-3 rounded-xl border border-border-soft bg-surface-muted p-4 sm:grid-cols-[1fr_120px_160px_auto]">
                <Input id={`hp-dc-l-${index}`} label="Label" value={row.label} onChange={(e) => setDiscount(index, "label", e.target.value)} placeholder="Early Bird" />
                <Input id={`hp-dc-p-${index}`} label="Percent" type="number" min="0" max="100" value={row.percent} onChange={(e) => setDiscount(index, "percent", e.target.value)} />
                <Input id={`hp-dc-v-${index}`} label="Valid until" type="date" value={row.validUntil} onChange={(e) => setDiscount(index, "validUntil", e.target.value)} />
                <div className="flex items-end">
                  <Button type="button" variant="ghost" onClick={() => setForm((c) => ({ ...c, discounts: c.discounts.filter((_, i) => i !== index) }))}>Remove</Button>
                </div>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={() => setForm((c) => ({ ...c, discounts: [...c.discounts, { label: "", percent: "", validUntil: "" }] }))}>Add discount</Button>
          </div>
        </Section>

        <Section title="Departures">
          <div className="space-y-4 sm:col-span-2">
            {form.departures.map((row, index) => (
              <div key={index} className="grid gap-3 rounded-xl border border-border-soft bg-surface-muted p-4 sm:grid-cols-[180px_140px_180px_auto]">
                <Input id={`hp-dp-date-${index}`} label="Date" type="date" value={row.date} onChange={(e) => setDeparture(index, "date", e.target.value)} />
                <Input id={`hp-dp-seats-${index}`} label="Seats total" type="number" min="0" value={row.seatsTotal} onChange={(e) => setDeparture(index, "seatsTotal", e.target.value)} />
                <Select id={`hp-dp-status-${index}`} label="Status" value={row.status} onChange={(e) => setDeparture(index, "status", e.target.value)}>
                  {DEPARTURE_STATUS.map((s) => (<option key={s} value={s}>{titleCase(s)}</option>))}
                </Select>
                <div className="flex items-end">
                  <Button type="button" variant="ghost" onClick={() => setForm((c) => ({ ...c, departures: c.departures.filter((_, i) => i !== index) }))}>Remove</Button>
                </div>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={() => setForm((c) => ({ ...c, departures: [...c.departures, { date: "", seatsTotal: "", status: "open" }] }))}>Add departure</Button>
          </div>
        </Section>

        <Section title="Inclusions & Media">
          <TextArea id="hp-inc" label="Custom inclusions (comma or newline)" value={form.customInclusions} onChange={(v) => setField("customInclusions", v)} />
          <TextArea id="hp-exc" label="Exclusions (comma or newline)" value={form.exclusions} onChange={(v) => setField("exclusions", v)} />
          <Input id="hp-video" label="Video URL" value={form.videoUrl} onChange={(e) => setField("videoUrl", e.target.value)} />
          <div />
          <label className="flex flex-col gap-1">
            <span className="text-[13px] font-medium text-ink-soft">Thumbnail (cover)</span>
            <input type="file" accept="image/*" onChange={(e) => setFiles((c) => ({ ...c, thumbnail: e.target.files?.[0] ?? null }))} />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[13px] font-medium text-ink-soft">Gallery images</span>
            <input type="file" accept="image/*" multiple onChange={(e) => setFiles((c) => ({ ...c, images: e.target.files ? Array.from(e.target.files) : [] }))} />
          </label>
          {editingId ? (
            <p className="text-[13px] text-ink-muted sm:col-span-2">Leave media empty to keep current images; choosing files replaces them.</p>
          ) : null}
        </Section>

        <div className="flex items-center justify-end gap-3 border-t border-border-soft pt-4">
          <Button type="button" variant="ghost" onClick={backToList} disabled={saving}>Cancel</Button>
          <Button type="submit" loading={saving}>{editingId ? "Save changes" : "Create package"}</Button>
        </div>
      </form>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-border-soft bg-white p-5 shadow-(--shadow-xs)">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-700">Partner Holiday Packages</p>
            <h1 className="mt-2 text-3xl font-black text-ink">Holiday Packages</h1>
            <p className="mt-2 max-w-2xl text-sm text-ink-muted">
              Author a full itinerary-driven holiday package priced by room category (Standard/Deluxe/Luxury), with departures, discounts, and your own taxi / hotel / tour listings.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <StatCard label="Packages" value={String(packages.length)} />
            <StatCard label="Active" value={String(packages.filter((p) => p.status === "active").length)} />
            <Button type="button" variant="accent" onClick={openCreate}>Create package</Button>
          </div>
        </div>
      </section>

      {loading ? (
        <section className="rounded-xl border border-border-soft bg-white p-10 text-center shadow-(--shadow-xs)">
          <p className="text-sm text-ink-muted">Loading your holiday packages…</p>
        </section>
      ) : packages.length === 0 ? (
        <section className="rounded-xl border border-border-soft bg-white shadow-(--shadow-xs)">
          <EmptyState
            title="No holiday packages yet"
            subtitle="Author a full holiday package with itinerary, room tiers, and departures."
            cta={<Button type="button" variant="accent" onClick={openCreate}>Create package</Button>}
          />
        </section>
      ) : (
        <section className="grid gap-4 md:grid-cols-2">
          {packages.map((pkg) => {
            const fromTier = pkg.roomTiers.length > 0 ? Math.min(...pkg.roomTiers.map((t) => t.price)) : null;
            return (
              <article key={pkg.id} className="overflow-hidden rounded-xl border border-border-soft bg-white shadow-(--shadow-xs)">
                {pkg.thumbnail ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={pkg.thumbnail} alt={pkg.title} className="h-40 w-full object-cover" />
                ) : (
                  <div className="flex h-40 w-full items-center justify-center bg-surface-muted text-sm text-ink-muted">No cover image</div>
                )}
                <div className="space-y-3 p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={pkg.status} />
                    <Badge tone="accent" size="sm">{titleCase(pkg.packageType)}</Badge>
                    <Badge tone="brand" size="sm">{pkg.route.durationDays}D/{pkg.route.durationNights}N</Badge>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-ink">{pkg.title}</h2>
                    <p className="mt-1 text-sm text-ink-muted">
                      {pkg.route.origin ? `${pkg.route.origin} → ` : ""}{pkg.route.destinations.join(" → ")}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-ink">
                      {fromTier != null ? `From ${pkg.currency} ${fromTier.toLocaleString("en-IN")} /person` : "No room tiers priced"}
                    </p>
                    <span className="text-[13px] text-ink-muted">{pkg.roomTiers.length} tier{pkg.roomTiers.length === 1 ? "" : "s"} · {pkg.departures.length} departures</span>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <Button type="button" variant="secondary" onClick={() => openEdit(pkg)}>Edit</Button>
                    {SUBMITTABLE_STATUSES.includes(pkg.status) && (
                      <Button type="button" variant="primary" loading={submittingId === pkg.id} onClick={() => submitForReview(pkg.id)}>
                        Submit for review
                      </Button>
                    )}
                    <Button type="button" variant="danger" onClick={() => removePackage(pkg)}>Delete</Button>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
}

function IncludePicker({
  label,
  empty,
  items,
  selected,
  onToggle,
}: {
  label: string;
  empty: string;
  items: { id: string; label: string }[];
  selected: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <div className="sm:col-span-1">
      <p className="mb-2 text-[13px] font-medium text-ink-soft">{label}</p>
      {items.length === 0 ? (
        <p className="text-[13px] text-ink-muted">{empty}</p>
      ) : (
        <div className="max-h-44 space-y-2 overflow-y-auto rounded-md border border-border-soft p-3">
          {items.map((it) => (
            <Checkbox key={it.id} id={`inc-${label}-${it.id}`} label={it.label} checked={selected.includes(it.id)} onChange={() => onToggle(it.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-[20px] border border-border-soft bg-white p-6 shadow-(--shadow-xs)">
      <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-brand-700">{title}</p>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border-soft bg-surface-muted px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-muted">{label}</p>
      <p className="mt-1 text-xl font-extrabold text-ink">{value}</p>
    </div>
  );
}

function TextArea({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1 sm:col-span-2">
      <span className="text-[13px] font-medium text-ink-soft">{label}</span>
      <textarea id={id} rows={3} value={value} onChange={(e) => onChange(e.target.value)} className="rounded-md border border-border bg-white px-3.5 py-3 text-[14px] text-ink outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20" />
    </label>
  );
}
