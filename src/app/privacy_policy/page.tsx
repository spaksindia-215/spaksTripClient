import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import BackToTop from "@/components/landing/BackToTop";
import PrivacyPolicyLanding from "@/components/privacy/PrivacyPolicyLanding";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <PrivacyPolicyLanding />
      </main>
      <Footer />
      <BackToTop />
    </div>
  );
}
