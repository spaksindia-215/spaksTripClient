"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Badge from "@/components/ui/Badge";
import { formatINR } from "@/lib/format";
import EnquiryModal from "./EnquiryModal";

export type TourPackage = {
  title: string;
  image: string;
  duration?: string;
  price?: number;
  highlights?: string[];
  category?: "Budget" | "Premium" | "Luxury";
  href?: string;
};

export default function TourPackageCard({ pkg }: { pkg: TourPackage }) {
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const router = useRouter();

  const handleCardClick = () => {
    if (pkg.href) router.push(pkg.href);
  };

  return (
    <>
      <article
        className={`flex flex-col rounded-xl border border-border-soft bg-white shadow-(--shadow-xs) hover:shadow-(--shadow-sm) transition-shadow overflow-hidden${pkg.href ? " cursor-pointer" : ""}`}
        onClick={pkg.href ? handleCardClick : undefined}
      >
        <div className="relative overflow-hidden">
          <img
            src={pkg.image}
            alt={pkg.title}
            className="h-52 w-full object-cover transition-transform duration-500 hover:scale-105"
            loading="lazy"
          />
          {pkg.category && (
            <span className="absolute top-2 left-2">
              <Badge tone={pkg.category === "Luxury" ? "brand" : pkg.category === "Premium" ? "accent" : "neutral"} size="sm">
                {pkg.category}
              </Badge>
            </span>
          )}
        </div>

        <div className="flex flex-col gap-2 p-4 flex-1">
          <h3 className="text-[15px] font-bold text-ink leading-snug">{pkg.title}</h3>

          <div className="flex flex-wrap gap-1.5">
            {pkg.duration && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-ink-muted">
                <svg viewBox="0 0 24 24" width={11} height={11} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                </svg>
                {pkg.duration}
              </span>
            )}
          </div>

          {pkg.highlights && pkg.highlights.length > 0 && (
            <ul className="flex flex-col gap-1 mt-1">
              {pkg.highlights.slice(0, 3).map((h) => (
                <li key={h} className="flex items-center gap-1.5 text-[12px] text-ink-soft">
                  <svg viewBox="0 0 24 24" width={11} height={11} fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden className="text-success-500 shrink-0">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {h}
                </li>
              ))}
            </ul>
          )}

          <div className="flex items-end justify-between gap-2 mt-auto pt-3 border-t border-border-soft">
            {pkg.price ? (
              <div>
                <p className="text-[11px] text-ink-muted">Starting from</p>
                <p className="text-[18px] font-extrabold text-ink leading-tight">
                  {formatINR(pkg.price)}
                  <span className="text-[12px] font-medium text-ink-muted"> /person</span>
                </p>
              </div>
            ) : <div />}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setEnquiryOpen(true); }}
              className="rounded-lg bg-accent-500 px-4 py-2 text-[13px] font-bold text-white hover:bg-accent-600 transition-colors"
            >
              Enquire Now
            </button>
          </div>
        </div>
      </article>

      <EnquiryModal open={enquiryOpen} onClose={() => setEnquiryOpen(false)} packageTitle={pkg.title} />
    </>
  );
}
