"use client";

import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import BackToTop from "@/components/landing/BackToTop";
import PackagePageHero from "@/components/holiday-packages/PackagePageHero";
import InventoryUnavailable from "@/components/shared/InventoryUnavailable";

export default function InternationalTourListPage() {
  return (
    <div className="min-h-screen bg-white text-[#0E1E3A]">
      <Header />
      <main>
        <PackagePageHero title="International Tour Packages" image="/forest.jpg" />
        <section className="mx-auto max-w-5xl px-6 py-12">
          <InventoryUnavailable
            title="Tour package inventory is currently unavailable"
            subtitle="These package lists no longer render generated itineraries. Connect a live package source to restore listings."
            href="/international-tour-packages"
            ctaLabel="Back to Tour Categories"
          />
        </section>
      </main>
      <Footer />
      <BackToTop />
    </div>
  );
}
