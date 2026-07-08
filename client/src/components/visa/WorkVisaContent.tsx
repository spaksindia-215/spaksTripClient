import VisaSidebar from "./VisaSidebar";

const WORK_TYPES = [
  { label: "Temporary Work Visas", text: "For a term employment contract. These work if one needs seasonal jobs or other temporary work." },
  { label: "Permanent Work Visas", text: "They are usually granted for full or permanent employment. They mostly refer to categories of skilled laborers." },
  { label: "Skilled worker visas", text: "Target individuals with specific skills and competencies that the host nation lacks." },
  { label: "Seasonal Work visas", text: "These apply, among others, in agricultural fields, tourism, or in constructions, where a surge usually occurs during the specified time." },
  { label: "Intra Company Transferee visa", text: "People will be transferring across the international boundary within the same enterprise." },
  { label: "Investor / entrepreneur visa", text: "One should target individuals who will begin up, or invest, overseas." },
  { label: "Job-Seeker Visas", text: "You can enter a country with a job-search visa without an existing employment offer in that country." },
];

const ELIGIBILITY = [
  { label: "Valid Job Offer", text: "Letter of employment from a known employer in the host country. Often, it contains your role, salary, and length of contract." },
  { label: "Educational Qualifications", text: "Proof of academic credentials relevant to the employment, such as degrees, diplomas, or certificates." },
  { label: "Work Experience", text: "Proof of previous experience related to the role. Most countries require a certain number of years of experience to qualify." },
  { label: "Language Proficiency", text: "This should meet the language requirements for an English-speaking country or its equivalent test for any other language." },
  { label: "Health and Background Checks", text: "Medical clearance that confirms you are fit for work and a clean criminal record to meet the security standards of the host country." },
  { label: "Financial Proof", text: "Sufficient funds to support you until you start earning." },
];

export default function WorkVisaContent() {
  return (
    <section className="bg-white py-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="flex-1 min-w-0">
            <div className="rounded-xl border border-zinc-200 p-6">
              <div className="rounded-lg overflow-hidden mb-6 h-64">
                <img
                  src="https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=900&q=80"
                  alt="Work visa application on desk"
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>

              <h2 className="text-2xl font-bold text-[#0E1E3A] mb-3">What is a work visa ?</h2>
              <p className="text-sm text-[#1a6fa8] leading-relaxed mb-6">
                A work visa is an official document or endorsement allowing people to enter, stay, and work in a foreign country for a specific period. Work visas are usually issued by the immigration department of the host country and are an essential requirement for foreign nationals planning to take up employment.
              </p>

              <h2 className="text-2xl font-bold text-[#0E1E3A] mb-3">Why Do You Need a Work Visa ?</h2>
              <p className="text-sm text-[#1a6fa8] leading-relaxed mb-6">
                Having a work visa is not only an absolute need in terms of legality; it also ensures that employment is protected and recognized by the host country. Working without having a valid visa can invite a range of severe penalties that include deportation and bans to enter the country in future. Moreover, a work visa gives you access to a number of social security benefits, healthcare services, and in many cases, structured pathways to permanent residency. It is an essential step for individuals who wish to succeed for a long period in international premises.
              </p>

              <h2 className="text-2xl font-bold text-[#0E1E3A] mb-2">Types of Work Visa</h2>
              <p className="text-sm text-zinc-600 mb-3">Work visas change with the country, the job, and the employment length. The most common forms include:</p>
              <ul className="flex flex-col gap-2 mb-4 list-disc list-inside">
                {WORK_TYPES.map((t) => (
                  <li key={t.label} className="text-sm leading-relaxed">
                    <span className="font-bold text-[#0E1E3A]">{t.label}: </span>
                    <span className="text-[#1a6fa8]">{t.text}</span>
                  </li>
                ))}
              </ul>
              <p className="text-sm text-[#1a6fa8] leading-relaxed mb-6">
                All of these visa categories have different criteria, advantages, and disadvantages. Knowing what category best describes you is the beginning to a smooth application process.
              </p>

              <h2 className="text-2xl font-bold text-[#0E1E3A] mb-2">General Eligibility Requirements</h2>
              <p className="text-sm text-zinc-600 mb-3">The eligibility criteria for a work visa vary by country but generally include some of the following factors:</p>
              <ul className="flex flex-col gap-2 list-disc list-inside">
                {ELIGIBILITY.map((e) => (
                  <li key={e.label} className="text-sm leading-relaxed">
                    <span className="font-bold text-[#0E1E3A]">{e.label}: </span>
                    <span className="text-[#1a6fa8]">{e.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <VisaSidebar activeVisa="Work Visa" visaType="Work Visa" />
        </div>
      </div>
    </section>
  );
}
