"use client";

import { useState } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { formatINR } from "@/lib/format";
import { useToast } from "@/components/ui/Toast";
import { sleep } from "@/services/delay";

type Plan = { id: string; name: string; price: number };

type Props = {
  plan: Plan;
  onSuccess: () => void;
};

export default function InsuranceBuyForm({ plan, onSuccess }: Props) {
  const toast = useToast();

  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [travelFrom, setTravelFrom] = useState("");
  const [travelTo, setTravelTo] = useState("");
  const [destination, setDestination] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async () => {
    if (!name.trim()) { toast.push({ title: "Enter traveler name", tone: "warn" }); return; }
    if (!email.trim() || !email.includes("@")) { toast.push({ title: "Enter a valid email", tone: "warn" }); return; }
    if (!travelFrom || !travelTo) { toast.push({ title: "Enter trip dates", tone: "warn" }); return; }
    setSubmitting(true);
    await sleep(1300);
    const ref = `INS${Math.floor(Math.random() * 900000 + 100000)}`;
    toast.push({
      title: "Insurance purchased!",
      description: `Policy ID: ${ref}`,
      tone: "success",
    });
    setSubmitting(false);
    onSuccess();
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Plan summary */}
      <div className="rounded-lg bg-brand-50 border border-brand-200 p-4">
        <p className="text-[13px] text-ink-muted">Selected plan</p>
        <p className="text-[18px] font-extrabold text-brand-700">{plan.name}</p>
        <p className="text-[22px] font-black text-ink">{formatINR(plan.price)}<span className="text-[13px] font-medium text-ink-muted"> per trip</span></p>
      </div>

      {/* Traveler info */}
      <div className="flex flex-col gap-3">
        <Input label="Traveler Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name as on passport" />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Date of Birth" type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        </div>
        <Input label="Phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" />
      </div>

      {/* Trip info */}
      <div className="flex flex-col gap-3 pt-2 border-t border-border-soft">
        <p className="text-[13px] font-bold text-ink">Trip Details</p>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Travel Start" type="date" value={travelFrom} onChange={(e) => setTravelFrom(e.target.value)} />
          <Input label="Travel End" type="date" value={travelTo} onChange={(e) => setTravelTo(e.target.value)} />
        </div>
        <Input label="Destination" value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="e.g. Dubai, Thailand" />
      </div>

      <div className="rounded-lg bg-warn-50 text-warn-600 text-[12px] font-medium px-3 py-2.5 flex items-start gap-2 mt-1">
        <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden className="mt-0.5 shrink-0">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
        Policy issuance will be confirmed after insurer processing is connected.
      </div>

      <Button variant="accent" size="lg" onClick={onSubmit} loading={submitting} fullWidth>
        Buy for {formatINR(plan.price)}
      </Button>
    </div>
  );
}
