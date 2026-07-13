"use client";

import { useState } from "react";
import LocationPicker from "@/components/ui/LocationPicker";

// A pin-drop location field: collapsed by default (just a summary line + toggle),
// expands to the full interactive map on demand. Used per-row wherever a form has
// many location-bearing rows (itinerary stops/days), so a form doesn't mount a
// MapLibre instance per row at once; also used for single base-location fields.
// Shared across partner forms (TourManager, TourPackageManager) and the admin
// PackageTemplateModal so they all capture the exact same field.
export default function LocationPickerField({
  lat, lng, address, onChange,
}: {
  lat: string;
  lng: string;
  address?: string;
  onChange: (v: { lat: string; lng: string; address?: string }) => void;
}) {
  const [open, setOpen] = useState(false);
  const hasLocation = lat.trim() !== "" && lng.trim() !== "";

  return (
    <div className="sm:col-span-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[13px] text-ink-soft">
          {hasLocation ? <>📍 {address?.trim() || `${lat}, ${lng}`}</> : <span className="text-ink-muted">No location set</span>}
        </p>
        <button type="button" onClick={() => setOpen((o) => !o)} className="text-[12px] font-semibold text-brand-600 hover:text-brand-700">
          {open ? "Close map" : hasLocation ? "Change location" : "Set location ▾"}
        </button>
      </div>
      {open && (
        <div className="mt-2">
          <LocationPicker
            latitude={lat.trim() ? Number(lat) : undefined}
            longitude={lng.trim() ? Number(lng) : undefined}
            onChange={(v) => {
              const formatted = v.address
                ? [v.address.street, v.address.city, v.address.state, v.address.country].filter(Boolean).join(", ")
                : address;
              onChange({ lat: String(v.latitude), lng: String(v.longitude), address: formatted });
            }}
          />
        </div>
      )}
    </div>
  );
}
