import VisaHero from "@/components/visa/VisaHero";
import PRVisaContent from "@/components/visa/PRVisaContent";
import DocumentChecklist from "@/components/visa/DocumentChecklist";
import VisaFAQ from "@/components/visa/VisaFAQ";
import BackToTop from "@/components/landing/BackToTop";
import Footer from "@/components/landing/Footer";
import Header from "@/components/landing/Header";

export default function PRVisaPage() {
  return (
    <div className="min-h-screen bg-white text-[#0E1E3A]">
      <Header />
      <main>
        <VisaHero title="PR Visa" />
        <DocumentChecklist type="pr-visa" />
        <PRVisaContent />
        <VisaFAQ title="PR" />
      </main>
      <Footer />
      <BackToTop />
    </div>
  );
}
