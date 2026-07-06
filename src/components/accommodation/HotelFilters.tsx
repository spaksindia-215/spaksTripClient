"use client";

import Checkbox from "@/components/ui/Checkbox";
import Chip from "@/components/ui/Chip";
import RangeSlider  from "@/components/ui/Slider";
import type { HotelFilters } from "@/services/hotels";
import { formatINR } from "@/lib/format";

const AMENITY_OPTIONS = [
  { value: "wifi", label: "Free WiFi" },
  { value: "pool", label: "Swimming Pool" },
  { value: "gym", label: "Gym / Fitness" },
  { value: "spa", label: "Spa" },
  { value: "restaurant", label: "Restaurant" },
  { value: "breakfast", label: "Breakfast Included" },
  { value: "parking", label: "Free Parking" },
  { value: "airport_shuttle", label: "Airport Shuttle" },
];

const PROPERTY_TYPES = [
  { value: "hotel", label: "Hotel" },
  { value: "resort", label: "Resort" },
  { value: "boutique", label: "Boutique" },
  { value: "apartment", label: "Apartment" },
  { value: "budget", label: "Budget" },
];

type Props = {
  filters: HotelFilters;
  priceRange: [number, number];
  onChange: (f: HotelFilters) => void;
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 pb-4 border-b border-border-soft last:border-0 last:pb-0">
      <h3 className="text-[13px] font-bold text-ink uppercase tracking-wide">{title}</h3>
      {children}
    </div>
  );
}

export default function HotelFilters({ filters, priceRange, onChange }: Props) {
  const toggleStar = (star: number) => {
    const cur = filters.stars ?? [];
    onChange({
      ...filters,
      stars: cur.includes(star) ? cur.filter((s) => s !== star) : [...cur, star],
    });
  };

  const togglePropertyType = (type: string) => {
    const cur = filters.propertyTypes ?? [];
    onChange({
      ...filters,
      propertyTypes: cur.includes(type) ? cur.filter((t) => t !== type) : [...cur, type],
    });
  };

  const toggleAmenity = (amenity: string) => {
    const cur = (filters.amenities ?? []) as string[];
    onChange({
      ...filters,
      amenities: (cur.includes(amenity) ? cur.filter((a) => a !== amenity) : [...cur, amenity]) as typeof filters.amenities,
    });
  };

  const maxPrice = filters.maxPrice ?? priceRange[1];

  return (
    <div className="flex flex-col gap-4">
      <Section title="Star Rating">
        <div className="flex flex-wrap gap-2">
          {[2, 3, 4, 5].map((star) => (
            <Chip
              key={star}
              active={(filters.stars ?? []).includes(star)}
              onClick={() => toggleStar(star)}
            >
              {"★".repeat(star)}
            </Chip>
          ))}
        </div>
      </Section>

      <Section title="Price per Night">
        <div className="px-1">
          <RangeSlider
            min={priceRange[0]}
            max={priceRange[1]}
            value={[priceRange[0], maxPrice]}
            onChange={([, hi]) => onChange({ ...filters, maxPrice: hi })}
          />
          <div className="mt-2 flex items-center justify-between text-[12px] text-ink-muted">
            <span>{formatINR(priceRange[0])}</span>
            <span className="font-semibold text-ink">Up to {formatINR(maxPrice)}</span>
            <span>{formatINR(priceRange[1])}</span>
          </div>
        </div>
      </Section>

      <Section title="Property Type">
        <div className="flex flex-wrap gap-2">
          {PROPERTY_TYPES.map((pt) => (
            <Chip
              key={pt.value}
              active={(filters.propertyTypes ?? []).includes(pt.value)}
              onClick={() => togglePropertyType(pt.value)}
            >
              {pt.label}
            </Chip>
          ))}
        </div>
      </Section>

      <Section title="Amenities">
        <div className="flex flex-col gap-2">
          {AMENITY_OPTIONS.map((a) => (
            <Checkbox
              key={a.value}
              id={`amenity-${a.value}`}
              label={a.label}
              checked={((filters.amenities ?? []) as string[]).includes(a.value)}
              onChange={() => toggleAmenity(a.value)}
            />
          ))}
        </div>
      </Section>

      <Section title="Cancellation">
        <Checkbox
          id="refundable-only"
          label="Free cancellation only"
          checked={filters.refundableOnly ?? false}
          onChange={(e) => onChange({ ...filters, refundableOnly: e.target.checked })}
        />
      </Section>
    </div>
  );
}
