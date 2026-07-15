import Select from "@/components/ui/Select";
import { INDIAN_STATES } from "@/lib/indianStates";

// Shared "State" dropdown for domestic itinerary-bearing listings (tour,
// tour_package, taxi_package, holiday) — powers state-wise browse categories.
export default function StateSelect({
  value,
  onChange,
  label = "State",
}: {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}) {
  return (
    <Select label={label} value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">Select a state…</option>
      {INDIAN_STATES.map((s) => (
        <option key={s} value={s}>{s}</option>
      ))}
    </Select>
  );
}
