"use client";

import { useState } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { sleep } from "@/services/delay";

const STATES = [
  "--Select State--", "Andhra Pradesh", "Delhi", "Gujarat", "Karnataka",
  "Kerala", "Maharashtra", "Punjab", "Rajasthan", "Tamil Nadu",
  "Telangana", "Uttar Pradesh", "West Bengal",
];

export default function ConsultForm({ visaType }: { visaType: string }) {
  const toast = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [state, setState] = useState(STATES[0]);
  const [destination, setDestination] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { toast.push({ title: "Enter your full name", tone: "warn" }); return; }
    if (!email.trim() || !email.includes("@")) { toast.push({ title: "Enter a valid email", tone: "warn" }); return; }
    if (!phone.trim()) { toast.push({ title: "Enter your phone number", tone: "warn" }); return; }
    setSubmitting(true);
    await sleep(1200);
    toast.push({ title: "Request sent!", description: "Our visa expert will call you within 24h.", tone: "success" });
    setName(""); setEmail(""); setPhone(""); setState(STATES[0]); setDestination("");
    setSubmitting(false);
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <Input label="Full Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="As on passport" />
      <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
      <Input label="Phone No" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" />

      <div>
        <label className="mb-1 block text-[13px] font-semibold text-ink">Select State</label>
        <select
          value={state}
          onChange={(e) => setState(e.target.value)}
          className="w-full rounded-lg border border-border bg-white px-3 py-2 text-[13px] text-ink outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
        >
          {STATES.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input label="Immigrate to" value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="e.g. Canada" />
        <div>
          <label className="mb-1 block text-[13px] font-semibold text-ink">Visa Type</label>
          <input
            readOnly
            value={visaType}
            className="w-full rounded-lg border border-border bg-surface-muted px-3 py-2 text-[13px] text-ink-muted outline-none cursor-default"
          />
        </div>
      </div>

      <Button type="submit" variant="primary" size="md" fullWidth loading={submitting}>
        Send Message
      </Button>
    </form>
  );
}
