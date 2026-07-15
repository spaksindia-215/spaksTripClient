"use client";

import Textarea from "@/components/ui/Textarea";

// Shared itinerary-day/stop description field: a multi-line Textarea with a live
// character-count hint guiding the partner toward a 200-300 char "spot + activities"
// blurb — long enough to read well in the expandable itinerary card on the customer
// detail page, short enough to stay scannable. Guidance only, not enforced.
export default function ItineraryDescriptionField({
  id,
  value,
  onChange,
  label = "Description",
  placeholder,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
}) {
  const len = value.length;
  const hint =
    len === 0
      ? "Aim for 200–300 characters — describe the spot and what happens there."
      : len < 200
        ? `${len}/300 chars — a bit more detail reads better in the itinerary card.`
        : len <= 300
          ? `${len}/300 chars — good length.`
          : `${len}/300 chars — a little long; consider trimming.`;

  return (
    <div className="sm:col-span-2">
      <Textarea id={id} label={label} value={value} onChange={(e) => onChange(e.target.value)} rows={3} placeholder={placeholder} hint={hint} />
    </div>
  );
}
