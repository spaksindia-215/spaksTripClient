import Select from "@/components/ui/Select";
import { INTERNATIONAL_COUNTRIES } from "@/lib/countries";

// Shared "Country" dropdown for international-scope listings — the counterpart of
// StateSelect, which only makes sense for domestic ones. India is not an option:
// a listing in India is domestic and picks an Indian state instead.
export default function CountrySelect({
  value,
  onChange,
  label = "Country",
}: {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}) {
  return (
    <Select label={label} value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">Select a country…</option>
      {INTERNATIONAL_COUNTRIES.map((c) => (
        <option key={c} value={c}>{c}</option>
      ))}
    </Select>
  );
}
