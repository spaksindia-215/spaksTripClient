"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import Checkbox from "@/components/ui/Checkbox";
import { useToast } from "@/components/ui/Toast";
import { partnerPackagesClient as client, type PartnerOffer, type OfferInput } from "@/lib/partnerPackagesClient";

// The partner's operating-price form for a marketplace package. Shared by the
// partner dashboard's "Browse & Offer" catalog and the public listing page
// (/packages/[slug]) where a logged-in partner reviews the listing as a customer
// sees it and then attaches their price.
export default function OfferModal({
  open, onClose, packageId, packageLabel, existing, onSaved,
}: {
  open: boolean;
  onClose: () => void;
  packageId: string;
  packageLabel: string;
  existing?: PartnerOffer | null;
  onSaved: (offer: PartnerOffer) => void;
}) {
  const toast = useToast();
  const [price, setPrice] = useState("");
  const [perPerson, setPerPerson] = useState(true);
  const [pricingNote, setPricingNote] = useState("");
  const [showContact, setShowContact] = useState(false);
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setPrice(existing ? String(existing.price) : "");
    setPerPerson(existing ? existing.perPerson : true);
    setPricingNote(existing?.pricingNote ?? "");
    setShowContact(existing?.showDirectContact ?? false);
    setPhone(existing?.directContact?.phone ?? "");
    setWhatsapp(existing?.directContact?.whatsapp ?? "");
    setEmail(existing?.directContact?.email ?? "");
  }, [open, existing]);

  const save = async () => {
    const n = Number(price);
    if (!Number.isFinite(n) || n < 0) { toast.push({ title: "Enter a valid price", tone: "warn" }); return; }
    setSaving(true);
    try {
      const payload: OfferInput = {
        packageId,
        price: n,
        perPerson,
        pricingNote: pricingNote.trim() || undefined,
        showDirectContact: showContact,
        directContact: showContact ? { phone: phone.trim() || undefined, whatsapp: whatsapp.trim() || undefined, email: email.trim() || undefined } : undefined,
      };
      const saved = existing ? await client.updateOffer(existing.id, payload) : await client.upsertOffer(payload);
      toast.push({ title: "Offer saved", tone: "success" });
      onSaved(saved);
      onClose();
    } catch (e) {
      toast.push({ title: "Could not save offer", description: e instanceof Error ? e.message : undefined, tone: "danger" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={`Your offer · ${packageLabel}`} size="md"
      footer={<div className="flex justify-end gap-3"><Button variant="ghost" onClick={onClose}>Cancel</Button><Button variant="accent" onClick={save} loading={saving}>Save Offer</Button></div>}>
      <div className="flex flex-col gap-3 p-1">
        <div className="grid gap-3 sm:grid-cols-2">
          <Input label="Your operating price (₹)" type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="e.g. 24999" />
          <div className="flex items-end pb-1"><Checkbox label="Per person" checked={perPerson} onChange={(e) => setPerPerson(e.target.checked)} /></div>
        </div>
        <Input label="Pricing note (optional)" value={pricingNote} onChange={(e) => setPricingNote(e.target.value)} placeholder="e.g. up to 4 pax, includes tolls" />
        <Checkbox label="Share my direct contact with customers" checked={showContact} onChange={(e) => setShowContact(e.target.checked)} />
        {showContact && (
          <div className="grid gap-3 sm:grid-cols-3">
            <Input label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <Input label="WhatsApp" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
            <Input label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
        )}
      </div>
    </Modal>
  );
}
