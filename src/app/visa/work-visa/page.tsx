import VisaHero from "@/components/visa/VisaHero";
import WorkVisaContent from "@/components/visa/WorkVisaContent";
import DocumentChecklist from "@/components/visa/DocumentChecklist";
import VisaFAQ from "@/components/visa/VisaFAQ";
import BackToTop from "@/components/landing/BackToTop";
import Footer from "@/components/landing/Footer";
import Header from "@/components/landing/Header";

export default function WorkVisaPage() {
  return (
    <div className="min-h-screen bg-white text-[#0E1E3A]">
      <Header />
      <main>
        <VisaHero title="Work Visa" />
        <DocumentChecklist type="work-visa" />
        <WorkVisaContent />
        <VisaFAQ title="PR" />
      </main>
      <Footer />
      <BackToTop />
    </div>
  );
}
