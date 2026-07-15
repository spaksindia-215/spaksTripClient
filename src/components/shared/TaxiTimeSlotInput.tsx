"use client";

import { useState } from "react";

// Free-entry time slot picker for taxi listings. Taxis are short point-to-point
// rides (airport/intercity), not multi-day itineraries, so instead of picking
// from a fixed set of 4-hour buckets, an owner/admin enters the exact pickup
// window(s) they operate. Shared across the partner dashboard, the public
// "list your taxi" onboarding form, and the My Taxis editor.
export default function TaxiTimeSlotInput({
  slots,
  onChange,
  error,
}: {
  slots: string[];
  onChange: (next: string[]) => void;
  error?: string;
}) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  function add() {
    if (!from || !to) return;
    const slot = `${from} - ${to}`;
    if (!slots.includes(slot)) onChange([...slots, slot]);
    setFrom("");
    setTo("");
  }

  function remove(slot: string) {
    onChange(slots.filter((s) => s !== slot));
  }

  return (
    <div className="flex flex-col gap-2 sm:col-span-2">
      <span className="text-[13px] font-medium text-ink-soft">Time slots</span>
      <div className="flex flex-wrap items-end gap-2">
        <label className="flex flex-col gap-1">
          <span className="text-[11px] text-ink-muted">From</span>
          <input
            type="time"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="rounded-md border border-border bg-white px-2.5 py-1.5 text-[13px] text-ink outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[11px] text-ink-muted">To</span>
          <input
            type="time"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="rounded-md border border-border bg-white px-2.5 py-1.5 text-[13px] text-ink outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
          />
        </label>
        <button
          type="button"
          onClick={add}
          disabled={!from || !to}
          className="rounded-md border border-brand-500 bg-brand-50 px-3 py-1.5 text-[13px] font-semibold text-brand-700 transition-colors hover:bg-brand-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Add slot
        </button>
      </div>
      {slots.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {slots.map((slot) => (
            <span
              key={slot}
              className="inline-flex items-center gap-1.5 rounded-full border border-brand-500 bg-brand-50 px-3 py-1.5 text-[12px] font-semibold text-brand-700"
            >
              {slot}
              <button
                type="button"
                onClick={() => remove(slot)}
                aria-label={`Remove ${slot}`}
                className="text-brand-700/70 transition-colors hover:text-brand-900"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
      {error && <p className="text-[12px] font-medium text-danger-600">{error}</p>}
    </div>
  );
}
