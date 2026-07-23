import type { Metadata } from "next";
import PackagePageHero from "@/components/holiday-packages/PackagePageHero";
import MarketplaceGrid from "@/components/holiday-packages/MarketplaceGrid";
import BackToTop from "@/components/landing/BackToTop";
import Footer from "@/components/landing/Footer";
import Header from "@/components/landing/Header";
import { generateServiceMetadata } from "@/lib/seo/metadata";
import { ServiceSchema } from "@/lib/seo/schemas";

export const metadata: Metadata = generateServiceMetadata("cruise");

export default function CruisePage() {
  return (
    <div className="min-h-screen bg-white text-[#0E1E3A]">
      <ServiceSchema
        serviceType="Cruise Booking"
        url="https://www.elitesyatra.com/cruise"
        description="Explore cruise vacations and island getaways."
      />
      <Header />
      <main>
        <PackagePageHero title="Cruises" image="/forest.jpg" />
        <section className="mx-auto max-w-7xl px-6 py-16">
          <MarketplaceGrid kind="cruise" emptyHint="Cruise packages will appear here once operators list them." />
        </section>
      </main>
      <Footer />
      <BackToTop />
    </div>
  );
}
