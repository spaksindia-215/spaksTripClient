import Link from "next/link";
import type { TourListItem } from "@/lib/mock/tourPackages";

type Props = {
  pkg: TourListItem;
};

export default function PackageListCard({ pkg }: Props) {
  const detailsHref = `/${pkg.categoryType}-tour-details/${pkg.id}`;

  return (
    <article className="flex flex-col md:flex-row gap-4 rounded-xl border border-border-soft bg-white shadow-sm overflow-hidden">
      {/* Image */}
      <div className="w-full md:w-[260px] shrink-0 overflow-hidden">
        <img
          src={pkg.image}
          alt={pkg.title}
          className="w-full h-auto md:h-full object-cover"
          loading="lazy"
        />
      </div>

      {/* Content */}
      <div className="flex flex-col justify-between gap-3 py-4 pr-4 flex-1 min-w-0">
        {/* Title + Location */}
        <div>
          <h3 className="text-[17px] font-bold text-[#0E1E3A] leading-snug mb-1">
            {pkg.title}
          </h3>
          <p className="flex items-center gap-1 text-[13px] text-ink-soft">
            <svg
              viewBox="0 0 24 24"
              width={13}
              height={13}
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {pkg.location}
          </p>
        </div>

        {/* Labels + Rating */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="inline-flex items-center gap-1.5 rounded border border-border-soft px-2 py-0.5 text-[12px] text-ink-soft">
            <svg
              viewBox="0 0 24 24"
              width={12}
              height={12}
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            {pkg.locationLabel}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="rounded bg-[#f5a623] px-2 py-0.5 text-[12px] font-bold text-white">
              {pkg.rating.toFixed(1)}
            </span>
            <span className="text-[12px] text-ink-soft">({pkg.reviews} Reviews)</span>
          </span>
        </div>

        {/* Duration + Price + Button */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4 text-[13px] text-ink-soft">
            <span className="flex items-center gap-1">
              <svg
                viewBox="0 0 24 24"
                width={13}
                height={13}
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              {pkg.duration}
            </span>
            <span className="flex items-center gap-1">
              <svg
                viewBox="0 0 24 24"
                width={13}
                height={13}
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                <circle cx="9" cy="7" r="4" />
              </svg>
              Per Person
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-[17px] font-extrabold text-[#e53e2a] leading-tight">
                ₹ {pkg.price.toLocaleString("en-IN")}/-
              </p>
              <p className="text-[12px] text-ink-muted line-through">
                {pkg.originalPrice.toLocaleString("en-IN")}/-
              </p>
            </div>
            <Link
              href={detailsHref}
              className="rounded-md bg-[#e53e2a] px-4 py-2 text-[13px] font-bold text-white hover:bg-[#c0392b] transition-colors whitespace-nowrap"
            >
              View Details
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
