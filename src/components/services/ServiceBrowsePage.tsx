"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import EmptyState from "@/components/ui/EmptyState";
import {
  servicePublicApi,
  type ServiceModuleConfig,
  type ServiceListingApi,
} from "@/lib/serviceModules";
import { listPackages, type PackageKind, type PackageSummary } from "@/lib/packagesClient";
import { formatINR } from "@/lib/format";

type Props = {
  config: ServiceModuleConfig;
  // Optional heading override + a forced filter (e.g. visaType for the Visa landing).
  heading?: string;
  blurb?: string;
  forcedFilter?: Record<string, string>;
};

// A card shown in the unified grid — either a partner's typed listing or a
// marketplace package (curated/partner) of the same vertical, priced by operators.
type Card = {
  key: string;
  href: string;
  image?: string;
  title: string;
  subtitle?: string;
  footer: string;
};

export default function ServiceBrowsePage({ config, heading, blurb, forcedFilter }: Props) {
  const apiClient = servicePublicApi(config);
  const [items, setItems] = useState<ServiceListingApi[]>([]);
  const [packages, setPackages] = useState<PackageSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    // The vertical's typed listings and its marketplace packages feed one grid;
    // if either source fails the other still renders.
    const [listings, pkgs] = await Promise.allSettled([
      apiClient.browse({ ...forcedFilter }),
      listPackages({ kind: config.vertical as PackageKind, limit: 50 }),
    ]);
    if (listings.status === "fulfilled") setItems(listings.value.items);
    if (pkgs.status === "fulfilled") setPackages(pkgs.value.items);
    if (listings.status === "rejected" && pkgs.status === "rejected") {
      setError(listings.reason instanceof Error ? listings.reason.message : "Could not load listings.");
    }
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.basePath, config.vertical, JSON.stringify(forcedFilter)]);

  useEffect(() => {
    void load();
  }, [load]);

  const cards: Card[] = [
    ...packages.map((p): Card => ({
      key: `p-${p.id}`,
      href: `/packages/${p.slug}`,
      image: p.thumbnail ?? p.images?.[0]?.url,
      title: p.title,
      subtitle: p.description,
      footer: p.fromPrice != null ? `From ${formatINR(p.fromPrice)} · ${p.operatorCount ?? 0} operator${p.operatorCount === 1 ? "" : "s"}` : "Enquire for pricing",
    })),
    ...items.map((item): Card => ({
      key: `l-${item.id}`,
      href: `${config.detailBase}/${item.slug}`,
      image: item.images[0]?.url,
      title: item.title,
      subtitle: item.description,
      footer: "View details →",
    })),
  ];

  return (
    <div className="min-h-screen bg-white text-[#0E1E3A]">
      <Header />
      <main className="mx-auto max-w-7xl px-6 py-12">
        <h1 className="text-[28px] font-extrabold">{heading ?? config.label}</h1>
        <p className="mt-1 text-[14px] text-ink-muted">{blurb ?? config.blurb}</p>

        <section className="mt-8">
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-64 animate-pulse rounded-2xl bg-surface-sunken" />
              ))}
            </div>
          ) : error ? (
            <EmptyState title="Something went wrong" subtitle={error} />
          ) : cards.length === 0 ? (
            <EmptyState title="Nothing found" subtitle="Check back soon." />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {cards.map((card) => (
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
                    <h2 className="line-clamp-1 text-[16px] font-bold text-ink">{card.title}</h2>
                    {card.subtitle ? <p className="line-clamp-2 text-[13px] text-ink-muted">{card.subtitle}</p> : null}
                    <p className="pt-1 text-[13px] font-semibold text-brand-700">{card.footer}</p>
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
