"use client";

import { useState } from "react";
import Drawer from "@/components/ui/Drawer";
import InsuranceBuyForm from "./InsuranceBuyForm";
import { formatINR } from "@/lib/format";

type Plan = {
  id: string;
  name: string;
  price: number;
  color: string;
  badge?: string;
  coverage: Record<string, string | false>;
};

const COVERAGE_ROWS: Array<{ key: string; label: string }> = [
  { key: "medical", label: "Medical emergencies" },
  { key: "evacuation", label: "Emergency evacuation" },
  { key: "trip_cancel", label: "Trip cancellation" },
  { key: "trip_delay", label: "Trip delay" },
  { key: "baggage", label: "Baggage loss / delay" },
  { key: "flight_miss", label: "Missed flight" },
  { key: "passport_loss", label: "Passport loss" },
  { key: "personal_accident", label: "Personal accident" },
  { key: "adventure_sports", label: "Adventure sports cover" },
];

const PLANS: Plan[] = [
  {
    id: "basic",
    name: "Basic",
    price: 499,
    color: "border-border",
    coverage: {
      medical: "Up to ₹5L",
      evacuation: "Up to ₹2L",
      trip_cancel: false,
      trip_delay: false,
      baggage: "Up to ₹15,000",
      flight_miss: false,
      passport_loss: "Up to ₹5,000",
      personal_accident: "Up to ₹5L",
      adventure_sports: false,
    },
  },
  {
    id: "standard",
    name: "Standard",
    price: 999,
    color: "border-brand-500",
    badge: "Popular",
    coverage: {
      medical: "Up to ₹15L",
      evacuation: "Up to ₹5L",
      trip_cancel: "Up to ₹1L",
      trip_delay: "₹2,000/day",
      baggage: "Up to ₹30,000",
      flight_miss: "Up to ₹10,000",
      passport_loss: "Up to ₹10,000",
      personal_accident: "Up to ₹10L",
      adventure_sports: false,
    },
  },
  {
    id: "premium",
    name: "Premium",
    price: 1999,
    color: "border-accent-500",
    badge: "Best Cover",
    coverage: {
      medical: "Up to ₹50L",
      evacuation: "Up to ₹20L",
      trip_cancel: "Up to ₹5L",
      trip_delay: "₹5,000/day",
      baggage: "Up to ₹1L",
      flight_miss: "Up to ₹25,000",
      passport_loss: "Up to ₹25,000",
      personal_accident: "Up to ₹25L",
      adventure_sports: "Included",
    },
  },
];

export default function InsurancePlansTable() {
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  return (
    <>
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center mb-10">
            <h2 className="text-[28px] font-extrabold text-ink">Compare Plans</h2>
            <p className="text-[15px] text-ink-muted mt-2">Choose the right coverage for your trip</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-left text-[13px] font-semibold text-ink-muted pb-4 pr-4 w-48">Coverage</th>
                  {PLANS.map((plan) => (
                    <th key={plan.id} className="pb-4 px-3">
                      <div className={`relative flex flex-col items-center gap-2 rounded-xl border-2 ${plan.color} p-4`}>
                        {plan.badge && (
                          <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent-500 px-3 py-0.5 text-[11px] font-bold text-white whitespace-nowrap">
                            {plan.badge}
                          </span>
                        )}
                        <span className="text-[16px] font-extrabold text-ink">{plan.name}</span>
                        <span className="text-[22px] font-black text-brand-700">{formatINR(plan.price)}</span>
                        <span className="text-[11px] text-ink-muted">per trip</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COVERAGE_ROWS.map((row, i) => (
                  <tr key={row.key} className={i % 2 === 0 ? "bg-surface-muted/50" : ""}>
                    <td className="py-3 pr-4 text-[13px] font-semibold text-ink">{row.label}</td>
                    {PLANS.map((plan) => {
                      const val = plan.coverage[row.key];
                      return (
                        <td key={plan.id} className="py-3 px-3 text-center text-[12px]">
                          {val === false ? (
                            <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" className="text-border mx-auto" aria-hidden>
                              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                          ) : (
                            <span className="font-medium text-ink">{val}</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
                <tr>
                  <td className="pt-6" />
                  {PLANS.map((plan) => (
                    <td key={plan.id} className="pt-6 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => setSelectedPlan(plan)}
                        className={`w-full rounded-lg py-2.5 text-[14px] font-bold text-white transition-colors ${
                          plan.id === "standard"
                            ? "bg-brand-600 hover:bg-brand-700"
                            : plan.id === "premium"
                            ? "bg-accent-500 hover:bg-accent-600"
                            : "bg-ink-soft hover:bg-ink"
                        }`}
                      >
                        Buy {plan.name}
                      </button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <Drawer
        open={!!selectedPlan}
        onClose={() => setSelectedPlan(null)}
        side="right"
        width="min(420px, 92vw)"
        title={`Buy ${selectedPlan?.name ?? ""} Plan`}
      >
        {selectedPlan && (
          <InsuranceBuyForm plan={selectedPlan} onSuccess={() => setSelectedPlan(null)} />
        )}
      </Drawer>
    </>
  );
}
