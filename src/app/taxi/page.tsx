import type { Metadata } from "next";
import PackagePageHero from "@/components/holiday-packages/PackagePageHero";
import MarketplaceGrid from "@/components/holiday-packages/MarketplaceGrid";
import TaxiPartnerCTA from "@/components/transport/TaxiPartnerCTA";
import WhyChooseUsOYO from "@/components/shared/WhyChooseUsOYO";
import BackToTop from "@/components/landing/BackToTop";
import Footer from "@/components/landing/Footer";
import Header from "@/components/landing/Header";
import { generateServiceMetadata } from "@/lib/seo/metadata";
import { ServiceSchema } from "@/lib/seo/schemas";

export const metadata: Metadata = generateServiceMetadata("cabs");

export default function CabsPage() {
  return (
    <div className="min-h-screen bg-white text-[#0E1E3A]">
      <ServiceSchema
        serviceType="Taxi Booking"
        url="https://www.elitesyatra.com/taxi"
        description="Book cabs for local rides and point-to-point transfers."
      />
      <Header />
      <main>
        <PackagePageHero title="Taxi Booking" image="/forest.jpg" />
        <section className="mx-auto max-w-7xl px-6 py-16">
          <MarketplaceGrid kind="taxi" emptyHint="Taxi listings will appear here once operators list them." />
        </section>
        <TaxiPartnerCTA />
        <WhyChooseUsOYO />
      </main>
      <Footer />
      <BackToTop />
    </div>
  );
}
