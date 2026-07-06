"use client";

import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import BackToTop from "@/components/landing/BackToTop";
import InventoryUnavailable from "@/components/shared/InventoryUnavailable";

export default function InternationalTourDetailsPage() {
  return (
    <div className="min-h-screen bg-white text-[#0E1E3A]">
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-12">
        <InventoryUnavailable
          title="Tour package details are currently unavailable"
          subtitle="This package page no longer renders generated itinerary data. Connect a live package source to restore details."
          href="/international-tour-packages"
          ctaLabel="Back to Tour Categories"
        />
      </main>
      <Footer />
      <BackToTop />
    </div>
  );
}
