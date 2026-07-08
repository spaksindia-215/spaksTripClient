"use client";

import { useTranslate } from "@tolgee/react";
import SectionHeading from "./SectionHeading";

type Feature = {
  titleKey: string;
  icon: React.ReactNode;
};

const FEATURES: Feature[] = [
  { titleKey: "landing.best_review", icon: <ThumbsUpIcon /> },
  { titleKey: "landing.no_cost_emi", icon: <DiscountIcon /> },
  { titleKey: "landing.premium_tours", icon: <GlobeIcon /> },
  { titleKey: "landing.verified_drivers", icon: <DriverIcon /> },
  { titleKey: "landing.verified_hotels", icon: <HotelIcon /> },
  { titleKey: "landing.well_planned", icon: <RouteIcon /> },
  { titleKey: "landing.lowest_price", icon: <PriceIcon /> },
  { titleKey: "landing.support_24_7", icon: <SupportIcon /> },
];

export default function WhyChooseUs() {
  const { t } = useTranslate();
  return (
    <section className="bg-[#F4F6F9] py-20">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading title={t("landing.why_choose")} />

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <article
              key={f.titleKey}
              className="flex flex-col items-center justify-center gap-5 rounded-2xl bg-white px-6 py-10 text-center shadow-sm ring-1 ring-black/[0.03] hover:-translate-y-1 hover:shadow-lg transition"
            >
              <div aria-hidden="true" className="grid h-20 w-20 place-items-center">
                {f.icon}
              </div>
              <h3 className="text-base font-bold text-[#0E1E3A]">{t(f.titleKey)}</h3>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ThumbsUpIcon() {
  return (
    <svg viewBox="0 0 64 64" width={64} height={64} aria-hidden="true">
      <g>
        <polygon points="16,12 20,4 24,12" fill="#FFC72C" />
        <polygon points="32,8 36,0 40,8" fill="#FFC72C" />
        <polygon points="48,12 52,4 56,12" fill="#FFC72C" />
        <path d="M14 28h10v26H14a2 2 0 0 1-2-2V30a2 2 0 0 1 2-2Z" fill="#F7B2A8" />
        <path d="M24 28l6-12c1-2 4-2 5 0s1 4 0 6l-2 4h12c3 0 5 3 4 6l-4 14c-1 3-3 4-6 4H24Z" fill="#F78A6B" />
      </g>
    </svg>
  );
}

function DiscountIcon() {
  return (
    <svg viewBox="0 0 64 64" width={64} height={64} aria-hidden="true">
      <path d="M32 8 22 20h6v16h8V20h6L32 8Z" fill="#2ECC71" />
      <path d="M12 38c2-2 6-2 8 0l10 10c2 2 6 2 8 0l14-14c2-2 2-6 0-8" stroke="#F7B2A8" strokeWidth={4} fill="none" strokeLinecap="round" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg viewBox="0 0 64 64" width={64} height={64} aria-hidden="true">
      <circle cx={32} cy={32} r={22} fill="#4A90E2" />
      <path d="M10 32h44M32 10c8 8 8 36 0 44M32 10c-8 8-8 36 0 44" stroke="#fff" strokeWidth={2} fill="none" />
      <circle cx={18} cy={16} r={3} fill="#E74C3C" />
      <circle cx={48} cy={22} r={3} fill="#F1C40F" />
      <circle cx={44} cy={48} r={3} fill="#27AE60" />
    </svg>
  );
}

function DriverIcon() {
  return (
    <svg viewBox="0 0 64 64" width={64} height={64} aria-hidden="true">
      <rect x={14} y={10} width={36} height={18} rx={9} fill="#1F3A8A" />
      <rect x={18} y={14} width={28} height={6} rx={2} fill="#fff" />
      <rect x={12} y={28} width={40} height={22} rx={4} fill="#2C7BD9" />
      <circle cx={32} cy={42} r={8} fill="#F5D6B3" />
    </svg>
  );
}

function HotelIcon() {
  return (
    <svg viewBox="0 0 64 64" width={64} height={64} aria-hidden="true">
      <rect x={10} y={18} width={44} height={36} fill="#E74C3C" />
      <rect x={14} y={10} width={36} height={10} fill="#fff" stroke="#2C3E50" strokeWidth={1} />
      <text x={32} y={18} textAnchor="middle" fontSize="7" fontWeight="bold" fill="#2C3E50">HOTEL</text>
      {[0, 1, 2].map((r) =>
        [0, 1, 2].map((c) => (
          <rect key={`${r}-${c}`} x={16 + c * 12} y={24 + r * 8} width={8} height={5} fill="#5DADE2" />
        ))
      )}
    </svg>
  );
}

function RouteIcon() {
  return (
    <svg viewBox="0 0 64 64" width={64} height={64} aria-hidden="true">
      <path d="M16 14c6 0 6 10 0 10s-6-10 0-10Z" fill="#FF3B30" />
      <circle cx={16} cy={19} r={2} fill="#fff" />
      <path d="M48 34c6 0 6 10 0 10s-6-10 0-10Z" fill="#FF3B30" />
      <circle cx={48} cy={39} r={2} fill="#fff" />
      <path d="M16 28c4 8 20 0 32 14" stroke="#4A90E2" strokeWidth={2} fill="none" strokeDasharray="3 3" />
    </svg>
  );
}

function PriceIcon() {
  return (
    <svg viewBox="0 0 64 64" width={64} height={64} aria-hidden="true">
      <path d="M32 10a22 22 0 1 1-20 30" stroke="#1F3A8A" strokeWidth={4} fill="none" strokeLinecap="round" />
      <polygon points="12,40 6,34 16,34" fill="#1F3A8A" />
      <text x={32} y={38} textAnchor="middle" fontSize="18" fontWeight="bold" fill="#E91E63">$</text>
    </svg>
  );
}

function SupportIcon() {
  return (
    <svg viewBox="0 0 64 64" width={64} height={64} aria-hidden="true">
      <circle cx={32} cy={22} r={12} fill="#F5A623" />
      <path d="M16 54c0-10 8-16 16-16s16 6 16 16Z" fill="#E74C3C" />
      <rect x={18} y={22} width={6} height={10} rx={3} fill="#333" />
      <rect x={40} y={22} width={6} height={10} rx={3} fill="#333" />
      <path d="M18 22c0-8 6-14 14-14s14 6 14 14" stroke="#333" strokeWidth={2} fill="none" />
    </svg>
  );
}
