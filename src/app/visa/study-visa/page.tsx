import VisaHero from "@/components/visa/VisaHero";
import StudyVisaContent from "@/components/visa/StudyVisaContent";
import DocumentChecklist from "@/components/visa/DocumentChecklist";
import VisaFAQ from "@/components/visa/VisaFAQ";
import BackToTop from "@/components/landing/BackToTop";
import Footer from "@/components/landing/Footer";
import Header from "@/components/landing/Header";

export default function StudyVisaPage() {
  return (
    <div className="min-h-screen bg-white text-[#0E1E3A]">
      <Header />
      <main>
        <VisaHero title="Study Visa" />
        <DocumentChecklist type="study-visa" />
        <StudyVisaContent />
        <VisaFAQ title="PR" />
      </main>
      <Footer />
      <BackToTop />
    </div>
  );
}
