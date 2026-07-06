"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import BackToTop from "@/components/landing/BackToTop";
import Chip from "@/components/ui/Chip";
import Badge from "@/components/ui/Badge";

type OfferCategory = "all" | "flights" | "hotels" | "packages";

type Deal = {
  id: string;
  title: string;
  subtitle: string;
  discount: string;
  validity: string;
  category: Exclude<OfferCategory, "all">;
  image: string;
  href: string;
};

const DEALS: Deal[] = [
  { id: "1", title: "Delhi → Goa", subtitle: "Non-stop flights starting ₹2,799", discount: "Upto 35% off", validity: "Valid till 30 Apr", category: "flights", image: "https://images.unsplash.com/photo-1544477468-9e4d0b5e6c0e?w=600&q=80", href: "/flight" },
  { id: "2", title: "Dubai Beach Resort", subtitle: "5-star luxury from ₹6,499/night", discount: "Upto 40% off", validity: "Valid till 15 May", category: "hotels", image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&q=80", href: "/hotel" },
  { id: "3", title: "Rajasthan Heritage Tour", subtitle: "7-night package with meals included", discount: "₹5,000 off", validity: "Valid till 10 May", category: "packages", image: "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=600&q=80", href: "/national-tour-packages" },
  { id: "4", title: "Mumbai → Singapore", subtitle: "Business class from ₹39,999", discount: "Upto 20% off", validity: "Valid till 1 Jun", category: "flights", image: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=600&q=80", href: "/flight" },
  { id: "5", title: "Maldives Water Villa", subtitle: "Overwater bungalow from ₹22,000/night", discount: "Upto 25% off", validity: "Valid till 20 May", category: "hotels", image: "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=600&q=80", href: "/hotel" },
  { id: "6", title: "Bali Adventure Package", subtitle: "10 nights with adventure activities", discount: "₹8,000 off", validity: "Valid till 31 May", category: "packages", image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&q=80", href: "/international-tour-packages" },
  { id: "7", title: "Chennai → Bangkok", subtitle: "Direct flights from ₹5,999", discount: "Upto 30% off", validity: "Valid till 25 Apr", category: "flights", image: "https://images.unsplash.com/photo-1508009603885-50cf7c8dd0d5?w=600&q=80", href: "/flight" },
  { id: "8", title: "Jaipur Palace Hotel", subtitle: "Heritage stay from ₹3,299/night", discount: "Upto 50% off", validity: "Valid till 30 Apr", category: "hotels", image: "https://images.unsplash.com/photo-1561501900-3701fa6a0864?w=600&q=80", href: "/hotel" },
  { id: "9", title: "Kerala Backwaters Tour", subtitle: "4-night houseboat experience", discount: "₹3,500 off", validity: "Valid till 15 Jun", category: "packages", image: "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?w=600&q=80", href: "/national-tour-packages" },
];

const FILTER_ITEMS: Array<{ value: OfferCategory; label: string }> = [
  { value: "all", label: "All Offers" },
  { value: "flights", label: "Flights" },
  { value: "hotels", label: "Hotels" },
  { value: "packages", label: "Packages" },
];

function DealCard({ deal }: { deal: Deal }) {
  return (
    <Link
      href={deal.href}
      className="group relative flex flex-col overflow-hidden rounded-2xl shadow-(--shadow-sm) hover:shadow-(--shadow-md) transition-shadow"
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={deal.image}
          alt={deal.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-linear-to-t from-ink/70 via-ink/20 to-transparent" />
        <span className="absolute right-3 top-3 rounded-full bg-accent-500 px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">
          {deal.discount}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-1.5 rounded-b-2xl bg-white p-4">
        <p className="text-[15px] font-extrabold text-ink group-hover:text-brand-700 transition-colors">{deal.title}</p>
        <p className="text-[12px] text-ink-muted">{deal.subtitle}</p>
        <div className="mt-auto flex items-center justify-between pt-2">
          <Badge tone="info" size="sm">{deal.validity}</Badge>
          <span className="text-[12px] font-semibold text-brand-600 group-hover:underline">Book Now →</span>
        </div>
      </div>
    </Link>
  );
}

export default function OffersPage() {
  const [filter, setFilter] = useState<OfferCategory>("all");

  const displayed = filter === "all" ? DEALS : DEALS.filter((d) => d.category === filter);

  return (
    <div className="min-h-screen bg-surface-muted">
      <Header />

      <div className="bg-brand-900 text-white">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <h1 className="text-[30px] font-extrabold">Exclusive Offers</h1>
          <p className="mt-2 text-[15px] text-white/70">Limited-time deals on flights, hotels and holiday packages.</p>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex flex-wrap gap-2">
          {FILTER_ITEMS.map((f) => (
            <Chip key={f.value} active={filter === f.value} onClick={() => setFilter(f.value)}>
              {f.label}
            </Chip>
          ))}
        </div>

        <div
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
          aria-live="polite"
        >
          {displayed.map((deal) => (
            <DealCard key={deal.id} deal={deal} />
          ))}
        </div>
      </main>

      <Footer />
      <BackToTop />
    </div>
  );
}
