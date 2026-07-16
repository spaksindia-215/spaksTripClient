import type { Metadata } from "next";
import HotelHero from "@/components/accommodation/HotelHero";
import TopHotelChoices from "@/components/accommodation/TopHotelChoices";
import HotelPartnerCTA from "@/components/accommodation/HotelPartnerCTA";
import WhyChooseUsOYO from "@/components/shared/WhyChooseUsOYO";
import BackToTop from "@/components/landing/BackToTop";
import Footer from "@/components/landing/Footer";
import Header from "@/components/landing/Header";
import { generatePageMetadata } from "@/lib/seo/metadata";
import { ServiceSchema } from "@/lib/seo/schemas";

export const metadata: Metadata = generatePageMetadata(
  "Premium Hotels",
  "Book handpicked 4 & 5 star hotels and luxury resorts worldwide at the best prices.",
  "/premium-hotels",
);

export default function PremiumHotelsPage() {
  return (
    <div className="min-h-screen bg-white text-[#0E1E3A]">
      <ServiceSchema
        serviceType="Premium Hotel Booking"
        url="https://www.spakstrip.com/premium-hotels"
        description="Find and book 4 & 5 star hotels and luxury resorts online."
      />
      <Header />
      <main>
        <HotelHero premium />
        <TopHotelChoices />
        <HotelPartnerCTA />
        <WhyChooseUsOYO />
      </main>
      <Footer />
      <BackToTop />
    </div>
  );
}
