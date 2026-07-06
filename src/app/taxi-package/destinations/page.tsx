import BackToTop from "@/components/landing/BackToTop";
import Footer from "@/components/landing/Footer";
import Header from "@/components/landing/Header";
import TaxiPackageDestinations from "@/components/transport/TaxiPackageDestinations";

export default function TaxiPackageDestinationsPage() {
  return (
    <div className="min-h-screen bg-white text-ink">
      <Header />
      <TaxiPackageDestinations />
      <Footer />
      <BackToTop />
    </div>
  );
}
