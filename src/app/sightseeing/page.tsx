"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import EmptyState from "@/components/ui/EmptyState";
import Pagination from "@/components/ui/Pagination";
import { fetchAllPages, pageSlice, pageCount } from "@/lib/pagination";
import { browseSightseeing } from "@/lib/sightseeingClient";
import type { SightseeingListingApi } from "@/lib/partnerClient";
import { CATEGORY_LABELS } from "@/lib/sightseeingForm";
import { listPackages, type PackageSummary, type PackageSightseeingSpecs } from "@/lib/packagesClient";
import { formatINR } from "@/lib/format";
import { ServiceSchema } from "@/lib/seo/schemas";

// One unified customer surface for sightseeing: partner-listed activities
// (SightseeingListing) AND marketplace sightseeing packages (admin- or
// partner-authored, priced by operator offers) render in the same grid. Both
// are "actual listings" — the only difference is which detail page they open.

function priceLabel(item: SightseeingListingApi): string {
  const v = item.pricing?.adult ?? item.pricing?.groupPrice;
  if (v === undefined) return "Enquire";
  return `From ${item.currency} ${v.toLocaleString("en-IN")}`;
}

type Card = {
  key: string;
  href: string;
  image?: string;
  category: string;
  title: string;
  location: string;
  price: string;
  operators?: number;
};

function listingCard(item: SightseeingListingApi): Card {
  return {
    key: `l-${item.id}`,
    href: `/sightseeing/${item.slug}`,
    image: item.images[0]?.url,
    category: CATEGORY_LABELS[item.category] ?? item.category,
    title: item.title,
    location: item.location?.island ?? "—",
    price: priceLabel(item),
  };
}

function packageCard(pkg: PackageSummary): Card {
  const specs = (pkg.specs ?? {}) as PackageSightseeingSpecs;
  const category = specs.category ? CATEGORY_LABELS[specs.category] ?? specs.category : "Sightseeing";
  return {
    key: `p-${pkg.id}`,
    href: `/packages/${pkg.slug}`,
    image: pkg.thumbnail ?? pkg.images?.[0]?.url,
    category,
    title: pkg.title,
    location: specs.location?.island ?? pkg.route.destinations[0] ?? "—",
    price: pkg.fromPrice != null ? `From ${formatINR(pkg.fromPrice)}` : "Enquire",
    operators: pkg.operatorCount,
  };
}

export default function SightseeingLandingPage() {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const totalPages = pageCount(cards.length);
  const safePage = Math.min(page, totalPages);

  const goToPage = (p: number) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    // Both sources feed one grid; if one fails the other still renders.
    // Both sources are drained fully, then paged client-side over the merged
    // array — server paging can't compose across two independent sources.
    Promise.allSettled([
      fetchAllPages((page, limit) => listPackages({ kind: "sightseeing", page, limit })),
      fetchAllPages((page, limit) => browseSightseeing({ sort: "newest", page, limit })),
    ])
      .then(([pkgs, listings]) => {
        if (!active) return;
        const out: Card[] = [];
        if (pkgs.status === "fulfilled") out.push(...pkgs.value.map(packageCard));
        if (listings.status === "fulfilled") out.push(...listings.value.map(listingCard));
        if (pkgs.status === "rejected" && listings.status === "rejected") {
          const reason = listings.reason;
          setError(reason instanceof Error ? reason.message : "Could not load activities.");
        }
        setCards(out);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-white text-[#0E1E3A]">
      <ServiceSchema
        serviceType="Sightseeing"
        url="https://www.elitesyatra.com/sightseeing"
        description="Book guided sightseeing tours in popular destinations."
      />
      <Header />
      <main className="mx-auto max-w-7xl px-6 py-12">
        <h1 className="text-[28px] font-extrabold">SightSeeing</h1>
        <p className="mt-1 text-[14px] text-ink-muted">
          Discover tours, activities and experiences. Enquire with the operator to book.
        </p>

        {/* Results */}
        <section className="mt-8">
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-72 animate-pulse rounded-2xl bg-surface-sunken" />
              ))}
            </div>
          ) : error ? (
            <EmptyState title="Something went wrong" subtitle={error} />
          ) : cards.length === 0 ? (
            <EmptyState title="No activities found" subtitle="Check back soon." />
          ) : (
            <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {pageSlice(cards, safePage).map((card) => (
                <Link
                  key={card.key}
                  href={card.href}
                  className="group overflow-hidden rounded-2xl border border-border-soft bg-white shadow-(--shadow-xs) transition hover:shadow-(--shadow-pop)"
                >
                  {card.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={card.image} alt={card.title} className="h-44 w-full object-cover" />
                  ) : (
                    <div className="flex h-44 w-full items-center justify-center bg-surface-muted text-sm text-ink-muted">No image</div>
                  )}
                  <div className="space-y-2 p-4">
                    <span className="inline-block rounded-full bg-accent-50 px-2.5 py-0.5 text-[11px] font-semibold text-accent-700">
                      {card.category}
                    </span>
                    <h2 className="line-clamp-1 text-[16px] font-bold text-ink">{card.title}</h2>
                    <p className="text-[13px] text-ink-muted">{card.location}</p>
                    <p className="pt-1 text-[15px] font-extrabold text-ink">
                      {card.price}
                      {card.operators ? <span className="ml-1 text-[11px] font-semibold text-ink-muted">· {card.operators} operator{card.operators === 1 ? "" : "s"}</span> : null}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
            <Pagination
              page={safePage}
              totalPages={totalPages}
              onChange={goToPage}
              className="mt-10"
            />
            </>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
