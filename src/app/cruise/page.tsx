import CruiseHero from "@/components/cruise/CruiseHero";
import PopularDestinations from "@/components/cruise/PopularDestinations";
import BackToTop from "@/components/landing/BackToTop";
import Footer from "@/components/landing/Footer";
import Header from "@/components/landing/Header";

export default function CruisePage() {
  return (
    <div className="min-h-screen bg-white text-[#0E1E3A]">
      <Header />
      <main>
        <CruiseHero />
        <PopularDestinations />
      </main>
      <Footer />
      <BackToTop />
    </div>
  );
}
