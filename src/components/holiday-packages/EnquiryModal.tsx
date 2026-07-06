"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { sleep } from "@/services/delay";

type Props = {
  open: boolean;
  onClose: () => void;
  packageTitle: string;
};

export default function EnquiryModal({ open, onClose, packageTitle }: Props) {
  const toast = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [travelers, setTravelers] = useState("2");
  const [travelDate, setTravelDate] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async () => {
    if (!name.trim()) { toast.push({ title: "Enter your name", tone: "warn" }); return; }
    if (!email.trim() || !email.includes("@")) { toast.push({ title: "Enter a valid email", tone: "warn" }); return; }
    if (!phone.trim()) { toast.push({ title: "Enter your phone number", tone: "warn" }); return; }
    setSubmitting(true);
    await sleep(1200);
    toast.push({
      title: "Enquiry sent!",
      description: "We'll contact you within 24 hours.",
      tone: "success",
    });
    setSubmitting(false);
    setName(""); setEmail(""); setPhone(""); setTravelDate(""); setMessage("");
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Enquire: ${packageTitle}`}
      size="md"
      footer={
        <div className="flex gap-3 justify-end">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="accent" onClick={onSubmit} loading={submitting}>Send Enquiry</Button>
        </div>
      }
    >
      <div className="flex flex-col gap-3 p-1">
        <Input label="Full Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
        <div className="grid sm:grid-cols-2 gap-3">
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          <Input label="Phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" />
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <Input label="Travel Date" type="date" value={travelDate} onChange={(e) => setTravelDate(e.target.value)} />
          <Input label="No. of Travelers" type="number" value={travelers} onChange={(e) => setTravelers(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[12px] font-medium text-ink-muted">Message (optional)</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            placeholder="Any special requirements or questions…"
            className="rounded-lg border border-border px-3 py-2 text-[13px] text-ink placeholder:text-ink-subtle focus:border-brand-500 focus:outline-none resize-none transition-colors"
          />
        </div>
      </div>
    </Modal>
  );
}
