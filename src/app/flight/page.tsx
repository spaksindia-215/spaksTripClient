import FlightHero from "@/components/flight/FlightHero";
import AboutUs from "@/components/landing/AboutUs";
import BackToTop from "@/components/landing/BackToTop";
import Destinations from "@/components/landing/Destinations";
import Footer from "@/components/landing/Footer";
import Header from "@/components/landing/Header";
import Testimonials from "@/components/landing/Testimonials";
import TopHotelDeals from "@/components/landing/TopHotelDeals";
import WhyChooseUs from "@/components/landing/WhyChooseUs";

export default function FlightPage() {
  return (
    <div className="min-h-screen bg-surface text-ink">
      <Header />
      <main>
        <FlightHero />
        <Destinations />
        <WhyChooseUs />
        <TopHotelDeals />
        <AboutUs />
        <Testimonials />
      </main>
      <Footer />
      <BackToTop />
    </div>
  );
}
