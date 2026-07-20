"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatINR } from "@/lib/format";
import EmptyState from "@/components/ui/EmptyState";
import Pagination from "@/components/ui/Pagination";
import { fetchAllPages, pageSlice, pageCount } from "@/lib/pagination";
import { stateToSlug } from "@/lib/indianStates";
import {
  listPackages,
  type PackageKind,
  type PackageScope,
  type PackageSummary,
} from "@/lib/packagesClient";

// Data-driven package grid backed by the marketplace API. Replaces the hardcoded
// marketing arrays on the tour/taxi/holiday listing pages. Each card links to the
// shared detail page (/packages/[slug]) where the operator list + enquiry live.

type Props = {
  kind?: PackageKind;
  // A surface backed by several kinds at once (e.g. the national/international
  // holiday pages run on tour_package + taxi_package + holiday). Takes precedence
  // over `kind`; results are fetched per kind and concatenated in the given order.
  kinds?: PackageKind[];
  scope?: PackageScope;
  emptyHint?: string;
  // Exact Indian state name (not the URL slug) to pre-filter server-side — set by
  // the /national-tour-packages/[state] browse-by-state page. When present, the
  // state-card directory is skipped and results render as a flat grid.
  state?: string;
};

function PackageCard({ pkg }: { pkg: PackageSummary }) {
  const img = pkg.thumbnail ?? pkg.images?.[0]?.url ?? "/placeholder.jpg";
  const duration =
    pkg.route.durationDays > 0
      ? `${pkg.route.durationNights}N / ${pkg.route.durationDays}D`
      : undefined;
  return (
    <Link
      href={`/packages/${pkg.slug}`}
      className="group/card flex flex-col overflow-hidden rounded-2xl border border-border-soft bg-white shadow-(--shadow-xs) transition-all duration-300 hover:-translate-y-1 hover:shadow-(--shadow-pop)"
    >
      <div className="relative aspect-4/3 overflow-hidden">
        <img
          src={img}
          alt={pkg.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover/card:scale-105"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-linear-to-t from-black/60 to-transparent" />
        {pkg.origin === "platform" && (
          <span className="absolute left-3 top-3 rounded-full bg-brand-600/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-(--shadow-xs)">
            Curated
          </span>
        )}
        {duration && (
          <span className="absolute bottom-2.5 left-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold text-ink shadow-(--shadow-xs)">
            <svg viewBox="0 0 16 16" className="h-3 w-3 text-brand-600" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <circle cx="8" cy="8" r="6.2" />
              <path d="M8 4.8V8l2.2 1.4" strokeLinecap="round" />
            </svg>
            {duration}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-2 text-[15px] font-bold leading-snug text-ink transition-colors group-hover/card:text-brand-700">
          {pkg.title}
        </h3>
        {pkg.route.destinations.length > 0 && (
          <p className="inline-flex items-center gap-1.5 text-[12px] font-medium text-ink-muted">
            <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 shrink-0 text-accent-500" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
              <path d="M8 14.5s-4.8-4.5-4.8-8A4.8 4.8 0 0 1 8 1.7a4.8 4.8 0 0 1 4.8 4.8c0 3.5-4.8 8-4.8 8Z" />
              <circle cx="8" cy="6.5" r="1.7" />
            </svg>
            <span className="line-clamp-1">{pkg.route.destinations.slice(0, 3).join(" · ")}</span>
          </p>
        )}
        <div className="mt-auto flex items-end justify-between gap-2 border-t border-border-soft pt-3">
          <div>
            {pkg.fromPrice != null ? (
              <>
                <p className="text-[11px] text-ink-muted">
                  From · {pkg.operatorCount} operator{pkg.operatorCount === 1 ? "" : "s"}
                </p>
                <p className="text-[18px] font-extrabold leading-tight text-ink">{formatINR(pkg.fromPrice)}</p>
              </>
            ) : (
              <>
                <p className="text-[11px] text-ink-muted">Price on request</p>
                <p className="text-[14px] font-bold leading-tight text-ink">Enquire now</p>
              </>
            )}
          </div>
          <span className="inline-flex items-center gap-1 rounded-lg bg-accent-500 px-4 py-2 text-[13px] font-bold text-white transition-colors group-hover/card:bg-accent-600">
            View
            <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 transition-transform group-hover/card:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M3 8h9M8.5 4.5 12 8l-3.5 3.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}

// "Other destinations" bucket key for items with no state set (international
// listings, or ones a partner/admin hasn't tagged yet) — always sorted last.
const OTHER = "Other destinations";

// A state's browse-by-state directory card. Uses the first listing's image as a
// representative thumbnail so the directory doesn't read as a bare text list.
function StateCard({ state, count, thumbnail }: { state: string; count: number; thumbnail?: string }) {
  return (
    <Link
      href={`/national-tour-packages/${stateToSlug(state)}`}
      className="group/card relative flex h-36 flex-col justify-end overflow-hidden rounded-2xl border border-border-soft bg-surface-muted shadow-(--shadow-xs) transition-all duration-300 hover:-translate-y-1 hover:shadow-(--shadow-pop)"
    >
      {thumbnail ? (
        <img
          src={thumbnail}
          alt=""
          aria-hidden="true"
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover/card:scale-105"
        />
      ) : (
        <div className="absolute inset-0 bg-linear-to-br from-brand-100 to-accent-100" />
      )}
      <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/75 via-black/15 to-transparent" />
      <div className="relative z-10 flex items-end justify-between gap-2 p-4">
        <span className="text-[15px] font-extrabold leading-snug text-white drop-shadow">{state}</span>
        <span className="shrink-0 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold text-ink">
          {count}
        </span>
      </div>
    </Link>
  );
}

export default function MarketplaceGrid({ kind, kinds, scope, emptyHint, state }: Props) {
  const [items, setItems] = useState<PackageSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  // Serialized so the effect doesn't refire on a new array identity each render.
  const kindsKey = kinds?.join(",");

  // A different kind/scope/state is a different result set — restart at page 1.
  useEffect(() => {
    setPage(1);
  }, [kind, kindsKey, scope, state]);

  const goToPage = (p: number) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    const kindList = kindsKey ? (kindsKey.split(",") as PackageKind[]) : [kind];
    // Every page of every kind is drained: the "browse by state" directory below
    // derives its per-state counts from the full set, so a truncated fetch would
    // under-report them. Paging happens client-side over the merged array.
    Promise.all(
      kindList.map((k) =>
        fetchAllPages((page, limit) => listPackages({ kind: k, scope, state, page, limit })),
      ),
    )
      .then((results) => {
        if (cancelled) return;
        // Concatenate per-kind results, de-duped by id (defensive — kinds are disjoint).
        const seen = new Set<string>();
        setItems(results.flat().filter((p) => !seen.has(p.id) && seen.add(p.id)));
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load packages");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [kind, kindsKey, scope, state]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-2xl border border-border-soft bg-white">
            <div className="aspect-4/3 animate-pulse bg-border-soft/60" />
            <div className="space-y-2.5 p-4">
              <div className="h-4 w-4/5 animate-pulse rounded bg-border-soft/60" />
              <div className="h-3 w-3/5 animate-pulse rounded bg-border-soft/60" />
              <div className="h-8 w-full animate-pulse rounded bg-border-soft/40" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return <p className="rounded-lg border border-danger-200 bg-danger-50 px-4 py-3 text-[13px] text-danger-700">{error}</p>;
  }

  if (items.length === 0) {
    return (
      <EmptyState
        title="No listings found"
        emoji="🍂"
        subtitle={emptyHint ?? "Try adjusting your search or category filters."}
      />
    );
  }

  // International listings have no Indian state — flat grid, no directory.
  // Same once a state has already been chosen (server-filtered) — every result
  // matches, so there's nothing left to group.
  if (scope === "international" || state) {
    // Clamped during render: the page-1 reset lands an effect later, so one
    // render can still hold a page index past the end of a shrunken result set.
    const totalPages = pageCount(items.length);
    const safePage = Math.min(page, totalPages);
    return (
      <>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {pageSlice(items, safePage).map((pkg) => (
            <PackageCard key={pkg.id} pkg={pkg} />
          ))}
        </div>
        <Pagination
          page={safePage}
          totalPages={totalPages}
          onChange={goToPage}
          className="mt-10"
        />
      </>
    );
  }

  const stateCounts = new Map<string, number>();
  const stateThumbnail = new Map<string, string>();
  const other: PackageSummary[] = [];
  for (const pkg of items) {
    if (pkg.state) {
      stateCounts.set(pkg.state, (stateCounts.get(pkg.state) ?? 0) + 1);
      if (!stateThumbnail.has(pkg.state)) {
        const img = pkg.thumbnail ?? pkg.images?.[0]?.url;
        if (img) stateThumbnail.set(pkg.state, img);
      }
    } else {
      other.push(pkg);
    }
  }
  const availableStates = Array.from(stateCounts.keys()).sort();

  // Only the ungrouped "other" list pages; the state directory is a compact
  // index of every state and is meant to be seen whole.
  const otherTotalPages = pageCount(other.length);
  const otherSafePage = Math.min(page, otherTotalPages);

  return (
    <div className="flex flex-col gap-8">
      {availableStates.length > 0 && (
        <div>
          <h2 className="mb-4 text-[17px] font-extrabold text-ink">Browse by state</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {availableStates.map((s) => (
              <StateCard key={s} state={s} count={stateCounts.get(s)!} thumbnail={stateThumbnail.get(s)} />
            ))}
          </div>
        </div>
      )}
      {other.length > 0 && (
        <div>
          {availableStates.length > 0 && (
            <h2 className="mb-4 text-[17px] font-extrabold text-ink">{OTHER}</h2>
          )}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {pageSlice(other, otherSafePage).map((pkg) => (
              <PackageCard key={pkg.id} pkg={pkg} />
            ))}
          </div>
          <Pagination
            page={otherSafePage}
            totalPages={otherTotalPages}
            onChange={goToPage}
            className="mt-10"
          />
        </div>
      )}
    </div>
  );
}
