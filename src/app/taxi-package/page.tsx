import type { Metadata } from "next";
import PackagePageHero from "@/components/holiday-packages/PackagePageHero";
import MarketplaceGrid from "@/components/holiday-packages/MarketplaceGrid";
import BackToTop from "@/components/landing/BackToTop";
import Footer from "@/components/landing/Footer";
import Header from "@/components/landing/Header";
import { generateServiceMetadata } from "@/lib/seo/metadata";
import { ServiceSchema } from "@/lib/seo/schemas";

export const metadata: Metadata = generateServiceMetadata("taxi");

export default function TaxiPackagePage() {
  return (
    <div className="min-h-screen bg-white text-ink">
      <ServiceSchema
        serviceType="Taxi Package Booking"
        url="https://www.elitesyatra.com/taxi-package"
        description="Fixed-route multi-day cab packages with transparent fares and verified drivers."
      />
      <Header />
      <main>
        <PackagePageHero title="Taxi Packages" image="/forest.jpg" />
        <section className="mx-auto max-w-7xl px-6 py-16">
          <MarketplaceGrid kind="taxi_package" emptyHint="Taxi packages will appear here once operators list them." />
        </section>
      </main>
      <Footer />
      <BackToTop />
    </div>
  );
}
