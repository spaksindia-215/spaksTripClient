import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import BackToTop from "@/components/landing/BackToTop";
import TrainSearchLanding from "@/components/rail/TrainSearchLanding";

export default function TrainSearchPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <TrainSearchLanding />
      </main>
      <Footer />
      <BackToTop />
    </div>
  );
}
