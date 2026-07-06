"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import EmptyState from "@/components/ui/EmptyState";
import { browseSightseeing } from "@/lib/sightseeingClient";
import type { SightseeingListingApi } from "@/lib/partnerClient";
import { CATEGORY_LABELS } from "@/lib/sightseeingForm";
import { ServiceSchema } from "@/lib/seo/schemas";

function priceLabel(item: SightseeingListingApi): string {
  const v = item.pricing?.adult ?? item.pricing?.groupPrice;
  if (v === undefined) return "Enquire";
  return `From ${item.currency} ${v.toLocaleString("en-IN")}`;
}

export default function SightseeingLandingPage() {
  const [items, setItems] = useState<SightseeingListingApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    browseSightseeing({ sort: "newest" })
      .then((res) => {
        if (active) setItems(res.items);
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : "Could not load activities.");
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
        url="https://www.spakstrip.com/sightseeing"
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
          ) : items.length === 0 ? (
            <EmptyState title="No activities found" subtitle="Check back soon." />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <Link
                  key={item.id}
                  href={`/sightseeing/${item.slug}`}
                  className="group overflow-hidden rounded-2xl border border-border-soft bg-white shadow-(--shadow-xs) transition hover:shadow-(--shadow-pop)"
                >
                  {item.images[0]?.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.images[0].url} alt={item.title} className="h-44 w-full object-cover" />
                  ) : (
                    <div className="flex h-44 w-full items-center justify-center bg-surface-muted text-sm text-ink-muted">No image</div>
                  )}
                  <div className="space-y-2 p-4">
                    <span className="inline-block rounded-full bg-accent-50 px-2.5 py-0.5 text-[11px] font-semibold text-accent-700">
                      {CATEGORY_LABELS[item.category] ?? item.category}
                    </span>
                    <h2 className="line-clamp-1 text-[16px] font-bold text-ink">{item.title}</h2>
                    <p className="text-[13px] text-ink-muted">{item.location?.island ?? "—"}</p>
                    <p className="pt-1 text-[15px] font-extrabold text-ink">{priceLabel(item)}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
