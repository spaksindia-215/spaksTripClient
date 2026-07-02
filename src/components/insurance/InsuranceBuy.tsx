"use client";

import { useState } from "react";

type Tab = "buy" | "renew";

const TYPES = [
  {
    label: "Lic",
    icon: (
      <svg viewBox="0 0 24 24" width={28} height={28} fill="none" stroke="#14b8a6" strokeWidth={1.8} strokeLinecap="round" aria-hidden="true">
        <rect x="4" y="3" width="16" height="18" rx="2" />
        <path d="M8 7h8M8 11h8M8 15h5" />
      </svg>
    ),
  },
  {
    label: "Car Insurance",
    icon: (
      <svg viewBox="0 0 24 24" width={28} height={28} fill="none" stroke="#14b8a6" strokeWidth={1.8} strokeLinecap="round" aria-hidden="true">
        <path d="M5 11l1.5-4.5h11L19 11" />
        <rect x="2" y="11" width="20" height="6" rx="2" />
        <circle cx="7" cy="17" r="2" />
        <circle cx="17" cy="17" r="2" />
      </svg>
    ),
  },
  {
    label: "2 Wheeler Insurance",
    icon: (
      <svg viewBox="0 0 24 24" width={28} height={28} fill="none" stroke="#14b8a6" strokeWidth={1.8} strokeLinecap="round" aria-hidden="true">
        <circle cx="5.5" cy="16" r="3" />
        <circle cx="18.5" cy="16" r="3" />
        <path d="M8.5 16l3-7h4l2 7" />
        <path d="M15 9l1.5-3H19" />
        <path d="M8.5 16h10" />
      </svg>
    ),
  },
  {
    label: "Health Insurance",
    icon: (
      <svg viewBox="0 0 24 24" width={28} height={28} fill="none" stroke="#14b8a6" strokeWidth={1.8} strokeLinecap="round" aria-hidden="true">
        <path d="M12 21C12 21 4 14.5 4 9a5 5 0 0 1 8-4 5 5 0 0 1 8 4c0 5.5-8 12-8 12z" />
        <path d="M9 10h6M12 7v6" />
      </svg>
    ),
  },
  {
    label: "Travel Insurance",
    icon: (
      <svg viewBox="0 0 24 24" width={28} height={28} fill="none" stroke="#14b8a6" strokeWidth={1.8} strokeLinecap="round" aria-hidden="true">
        <path d="M3 17l3-9 5 3 4-7 3 2" />
        <path d="M2 20h20" />
      </svg>
    ),
  },
  {
    label: "Term Life Insurance",
    icon: (
      <svg viewBox="0 0 24 24" width={28} height={28} fill="none" stroke="#14b8a6" strokeWidth={1.8} strokeLinecap="round" aria-hidden="true">
        <path d="M12 3l7 4v5c0 4-3 7.5-7 9-4-1.5-7-5-7-9V7l7-4z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
  },
];

export default function InsuranceBuy() {
  const [tab, setTab] = useState<Tab>("buy");

  return (
    <section className="bg-[#F4F6F9] py-16">
      <div className="mx-auto max-w-4xl px-6">
        <h1 className="text-center text-3xl font-extrabold text-[#0E1E3A] mb-8">Insurance Buy</h1>

        {/* BUY / RENEW bar */}
        <div className="relative flex h-12 rounded-sm overflow-hidden bg-[#16a34a]">
          <button
            type="button"
            onClick={() => setTab("buy")}
            className="relative flex-1 flex items-center justify-center text-base font-bold transition-colors"
            style={tab === "buy" ? { background: "#E8A020", color: "#0E1E3A" } : { background: "transparent", color: "#fff" }}
          >
            BUY
            {tab === "buy" && (
              <span
                aria-hidden="true"
                className="absolute -bottom-3 left-1/2 -translate-x-1/2 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent"
                style={{ borderTopColor: "#E8A020" }}
              />
            )}
          </button>
          <button
            type="button"
            onClick={() => setTab("renew")}
            className="relative flex-1 flex items-center justify-center text-base font-bold transition-colors"
            style={tab === "renew" ? { background: "#E8A020", color: "#0E1E3A" } : { background: "transparent", color: "#fff" }}
          >
            RENEW
            {tab === "renew" && (
              <span
                aria-hidden="true"
                className="absolute -bottom-3 left-1/2 -translate-x-1/2 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent"
                style={{ borderTopColor: "#E8A020" }}
              />
            )}
          </button>
        </div>

        {/* Insurance type circles */}
        <div className="mt-12 flex flex-wrap justify-center gap-10">
          {TYPES.map((t) => (
            <button
              key={t.label}
              type="button"
              className="flex flex-col items-center gap-3 group"
            >
              <span className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-[#14b8a6] bg-white group-hover:bg-teal-50 transition-colors">
                {t.icon}
              </span>
              <span className="text-sm font-medium text-[#0E1E3A] text-center max-w-[90px]">{t.label}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
