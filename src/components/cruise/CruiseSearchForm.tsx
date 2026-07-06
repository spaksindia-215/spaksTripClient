"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Button from "@/components/ui/Button";
import Chip from "@/components/ui/Chip";
import { useToast } from "@/components/ui/Toast";

const PORTS = [
  "Mumbai", "Goa", "Dubai", "Singapore", "Barcelona", "Athens", "Hong Kong", "Sydney",
];

const NIGHT_OPTIONS = [
  { label: "Any", value: "" },
  { label: "3N", value: "3" },
  { label: "5N", value: "5" },
  { label: "7N", value: "7" },
  { label: "10N", value: "10" },
  { label: "14N", value: "14" },
];

export default function CruiseSearchForm() {
  const router = useRouter();
  const toast = useToast();

  const [port, setPort] = useState("");
  const [month, setMonth] = useState("");
  const [nights, setNights] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSearch = () => {
    if (!port) { toast.push({ title: "Select a departure port", tone: "warn" }); return; }
    setSubmitting(true);
    const params = new URLSearchParams({ port, month: month || "any", nights: nights || "any" });
    router.push(`/cruise/results?${params.toString()}`);
  };

  return (
    <div className="w-full rounded-2xl bg-white p-5 shadow-(--shadow-lg)">
      <div className="flex flex-col gap-4">
        {/* Departure port */}
        <div>
          <p className="text-[12px] font-medium text-ink-muted mb-2">Departure Port</p>
          <div className="flex flex-wrap gap-2">
            {PORTS.map((p) => (
              <Chip key={p} active={port === p} onClick={() => setPort(p)}>{p}</Chip>
            ))}
          </div>
        </div>

        {/* Month */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <p className="text-[12px] font-medium text-ink-muted mb-1">Travel Month</p>
            <select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="h-11 w-full rounded-lg border border-border px-3 text-[14px] font-medium text-ink bg-white focus:border-brand-500 focus:outline-none transition-colors"
              aria-label="Select travel month"
            >
              <option value="">Any month</option>
              {["January","February","March","April","May","June","July","August","September","October","November","December"].map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {/* Nights filter */}
          <div>
            <p className="text-[12px] font-medium text-ink-muted mb-2">Duration</p>
            <div className="flex flex-wrap gap-2">
              {NIGHT_OPTIONS.map((n) => (
                <Chip key={n.value} active={nights === n.value} onClick={() => setNights(n.value)}>
                  {n.label}
                </Chip>
              ))}
            </div>
          </div>
        </div>

        <Button onClick={onSearch} loading={submitting} size="lg" variant="accent">
          Search Cruises
        </Button>
      </div>
    </div>
  );
}
