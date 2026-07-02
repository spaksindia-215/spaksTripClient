"use client";

import { useState } from "react";
import PackageListCard from "./PackageListCard";
import type { TourListItem } from "@/lib/mock/tourPackages";

const PER_PAGE = 2;

type Props = {
  categoryTitle: string;
  packages: TourListItem[];
};

export default function TourListContent({ categoryTitle, packages }: Props) {
  const [sortBy, setSortBy] = useState<"price" | "rating">("price");
  const [currentPage, setCurrentPage] = useState(1);

  const sorted = [...packages].sort((a, b) =>
    sortBy === "price" ? a.price - b.price : b.rating - a.rating
  );

  const totalPages = Math.max(1, Math.ceil(sorted.length / PER_PAGE));
  const paginated = sorted.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  return (
    <div className="flex flex-col gap-5">
      {/* Filter bar */}
      <div className="flex items-center justify-between flex-wrap gap-3 rounded-lg border border-border-soft bg-white px-5 py-3">
        <p className="text-[14px] font-semibold text-ink">
          Showing {packages.length} {categoryTitle} Tours
        </p>
        <label className="flex items-center gap-2 text-[13px] font-semibold text-ink-soft">
          SORT BY:
          <select
            value={sortBy}
            onChange={(e) => { setSortBy(e.target.value as "price" | "rating"); setCurrentPage(1); }}
            className="rounded border border-border-soft px-2 py-1 text-[13px] text-ink bg-white focus:outline-none focus:ring-1 focus:ring-brand-400"
          >
            <option value="price">Price</option>
            <option value="rating">Rating</option>
          </select>
        </label>
      </div>

      {/* Package list */}
      <div className="flex flex-col gap-4">
        {paginated.length > 0 ? (
          paginated.map((pkg) => <PackageListCard key={pkg.id} pkg={pkg} />)
        ) : (
          <p className="py-16 text-center text-ink-muted">No packages found.</p>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border-soft text-ink-soft hover:bg-surface-muted disabled:opacity-40 transition-colors"
            aria-label="Previous page"
          >
            ‹
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              type="button"
              onClick={() => setCurrentPage(page)}
              className={`flex h-9 w-9 items-center justify-center rounded-full text-[14px] font-semibold transition-colors ${
                currentPage === page
                  ? "bg-[#e53e2a] text-white"
                  : "border border-border-soft text-ink hover:bg-surface-muted"
              }`}
            >
              {page}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border-soft text-ink-soft hover:bg-surface-muted disabled:opacity-40 transition-colors"
            aria-label="Next page"
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
}
