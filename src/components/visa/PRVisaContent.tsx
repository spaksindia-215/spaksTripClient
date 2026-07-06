import Link from "next/link";
import VisaSidebar from "./VisaSidebar";

const STEPS = [
  { label: "Eligibility Assessment", text: "Most countries have specific eligibility criteria that applicants must meet. These criteria may include age, education, work experience, language proficiency, and more. Applicants must ensure they meet these requirements before proceeding. Immigration from India is not very complex if you have right guidance." },
  { label: "Choose the Right Visa Category", text: "Different countries offer various PR Visa categories, such as skilled worker visas, family reunification visas, and investor visas. Choose the one that best suits your qualifications and circumstances." },
  { label: "Gather Documentation", text: "Applicants need to compile a comprehensive set of documents, which often includes identity proof, educational certificates, work experience records, and proof of funds." },
  { label: "Submit an Expression of Interest (EOI) or Application", text: "Depending on the country's immigration system, applicants may need to submit an EOI or directly apply for a PR Visa. The application process can be done online or through a consulate/embassy." },
  { label: "Points-Based System (for some countries)", text: "Many countries employ a points-based system to assess PR Visa applications. Points are assigned based on factors like age, education, work experience, language skills, and job offers. Meeting or exceeding a certain point threshold is crucial for success." },
  { label: "Background Checks and Medical Examination", text: "Applicants may need to undergo background checks and a medical examination to ensure they meet health and character requirements." },
  { label: "Interview or Biometrics", text: "Some countries require applicants to attend interviews or provide biometric data as part of the application process." },
  { label: "Waiting Period", text: "Once the application is submitted, there is often a waiting period during which the authorities review and process the application." },
  { label: "Visa Grant", text: "If the application is successful, the immigration authorities will grant the PR Visa, allowing the applicant to live and work in the host country indefinitely." },
];

const BENEFITS = [
  { label: "Stability", text: "PR Visa holders have the security of knowing they can live in the host country without the uncertainty of visa renewals." },
  { label: "Work Freedom", text: "Most PR Visa holders have the right to work in any job or industry within the host country, offering a wide range of career opportunities." },
  { label: "Access to Social Services", text: "PR Visa holders are often eligible for social benefits such as healthcare and education, similar to citizens." },
  { label: "Education Opportunities", text: "Children of PR Visa holders usually have access to quality education in the host country, including public schools and universities." },
  { label: "Path to Citizenship", text: "In many cases, holding a PR Visa is a stepping stone to applying for citizenship in the host country." },
  { label: "Travel Flexibility", text: "PR Visa holders can usually travel in and out of the host country without the need for additional visas." },
  { label: "Investment Opportunities", text: "Some countries offer PR Visa programs to attract foreign investors, opening doors to business opportunities." },
];

export default function PRVisaContent() {
  return (
    <section className="bg-white py-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* ── Left article ── */}
          <div className="flex-1 min-w-0">
            <div className="rounded-xl border border-zinc-200 overflow-hidden p-6">
              <div className="rounded-lg overflow-hidden mb-6 h-64">
                <img src="https://images.unsplash.com/photo-1553484771-371a605b060b?auto=format&fit=crop&w=900&q=80" alt="Passport handover" className="h-full w-full object-cover" loading="lazy" />
              </div>

              <h2 className="text-2xl font-bold text-[#0E1E3A] mb-3">How to Apply for a Permanent Residence Visa ?</h2>
              <p className="text-sm text-zinc-600 mb-4">The process of applying for a PR Visa varies from country to country, but it generally involves several key steps:</p>
              <ol className="flex flex-col gap-3 mb-8">
                {STEPS.map((s, i) => (
                  <li key={s.label} className="text-sm leading-relaxed">
                    <span className="font-bold text-[#0E1E3A]">{i + 1}. {s.label}: </span>
                    <span className="text-[#1a6fa8]">{s.text}</span>
                  </li>
                ))}
              </ol>

              <h2 className="text-2xl font-bold text-[#0E1E3A] mb-2">Benefits of Permanent Residence Visa</h2>
              <p className="text-sm text-[#0E1E3A] font-medium mb-3">Acquiring a PR Visa comes with numerous benefits when it comes to immigration from India, including:</p>
              <ol className="flex flex-col gap-2 mb-8">
                {BENEFITS.map((b, i) => (
                  <li key={b.label} className="text-sm leading-relaxed">
                    <span className="font-bold text-[#0E1E3A]">{i + 1}. {b.label}: </span>
                    <span className="text-[#1a6fa8]">{b.text}</span>
                  </li>
                ))}
              </ol>

              <h2 className="text-2xl font-bold text-[#0E1E3A] mb-3">Conclusion</h2>
              <p className="text-sm text-zinc-600 leading-relaxed mb-3">
                A <span className="text-[#1a6fa8]">Permanent Residence Visa</span> is a valuable document that grants foreign nationals the opportunity to a stable life in a new country. Immigration from India is very much sorted because of PR visa. While the application process can be complex and competitive, the benefits of acquiring PR status are numerous, making it a goal worth pursuing for those looking to build a future in a foreign land.
              </p>
              <p className="text-sm text-zinc-600 leading-relaxed">
                Whether it&apos;s for career prospects, education, or a fresh start, a PR Visa can be the key to a brighter and more secure future.{" "}
                <Link href="#" className="font-bold text-[#0E1E3A]">Get in Touch With Us</Link>, Oasis Visas will provide you more information about{" "}
                <span className="text-[#1a6fa8]">immigration from India</span>. Oasis will also guide you regarding{" "}
                <span className="text-[#1a6fa8]">Easy PR Countries for Indians</span>.
              </p>
            </div>
          </div>

          <VisaSidebar activeVisa="PR Visa" visaType="PR Visa" />
        </div>
      </div>
    </section>
  );
}
