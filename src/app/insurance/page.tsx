import InsuranceBuy from "@/components/insurance/InsuranceBuy";
import InsurancePlansTable from "@/components/insurance/InsurancePlansTable";
import InsuranceCredentials from "@/components/insurance/InsuranceCredentials";
import InsuranceReviews from "@/components/insurance/InsuranceReviews";
import InsuranceFAQ from "@/components/insurance/InsuranceFAQ";
import BackToTop from "@/components/landing/BackToTop";
import Footer from "@/components/landing/Footer";
import Header from "@/components/landing/Header";

export default function InsurancePage() {
  return (
    <div className="min-h-screen bg-white text-[#0E1E3A]">
      <Header />
      <main>
        <InsuranceBuy />
        <InsurancePlansTable />
        <InsuranceCredentials />
        <InsuranceReviews />
        <InsuranceFAQ />
      </main>
      <Footer />
      <BackToTop />
    </div>
  );
}
