import VisaSidebar from "./VisaSidebar";

const APPLY_STEPS = [
  "Visit the website of the embassy or consulate of the country you plan to study in and review the visa requirements for students. Make sure you understand what documents are needed and the deadlines for submitting them.",
  "Different countries may have different types of student visas, such as short-term or long-term visas. You need to select one that fits your needs.",
  "You must first be accepted by an educational institution in the country you plan to study in. Make sure you have all the necessary admission documents.",
  "You will need to gather various documents such as a passport, proof of financial support, an acceptance letter from the educational institution, and evidence of language proficiency. Make sure you have all the necessary documents before applying for the visa.",
  "Carefully fill out the visa application form, provide complete and accurate information. Be sure to answer all questions truthfully and to the best of your knowledge.",
  "Some countries require a visa interview. You will need to schedule an appointment with the embassy or consulate of the country you plan to study in, best study abroad consultants in India can help you out with this.",
  "Attend the interview with all required documents, dress appropriately, and be prepared to answer questions related to your study plans.",
  "You will need to wait for a decision on your application after the interview. This can take several weeks to several months, depending on the country.",
  "The application process for a study visa can be complex, and it's important to start the process well in advance of your planned departure date. If you are still confused, you can take the help of Best Study Abroad Consultants in India, Oasis Resource Management.",
];

const TOP_COUNTRIES = ["Canada", "Australia", "UK", "USA", "Germany", "Ireland", "France", "Europe"];

const BENEFITS = [
  "A study visa grants you legal authorization to study in the country of your choice. This means you can attend classes and pursue your education without fear of being deported or fined for violating immigration laws.",
  "A study visa opens the door to a wide range of educational opportunities, including access to top-ranked universities and colleges, specialized programs, and unique academic experiences.",
  "Studying abroad allows you to immerse yourself in a new culture, learn new languages, and gain a deeper understanding of different customs and traditions.",
  "Studying abroad provides opportunities to connect with peers and professionals from around the world, building valuable professional networks and gaining access to new career opportunities.",
  "Studying abroad in a country where the primary language is different from your own can improve your language skills and make you more marketable to employers.",
  "Studying abroad can be a life-changing experience that exposes you to new ideas, perspectives, ways of life, fostering personal growth and self-discovery.",
  "Overall, a study visa can provide you with a unique opportunity to enhance your education, broaden your horizons, and gain valuable skills and experiences that can benefit you personally and professionally in the long run.",
];

export default function StudyVisaContent() {
  return (
    <section className="bg-white py-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="flex-1 min-w-0">
            <div className="rounded-xl border border-zinc-200 p-6">
              <div className="rounded-lg overflow-hidden mb-6 h-64">
                <img
                  src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=900&q=80"
                  alt="Students studying abroad"
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>

              <h2 className="text-2xl font-bold text-[#0E1E3A] mb-3">What is Study Visa ?</h2>
              <p className="text-sm text-[#1a6fa8] leading-relaxed mb-3">
                A study visa, also known as a student visa or a student permit, is a type of visa that allows an individual to enter a country for the purpose of pursuing their studies. This type of visa is typically required for individuals who are not citizens or permanent residents of the country in which they wish to study.
              </p>
              <p className="text-sm text-[#1a6fa8] leading-relaxed mb-6">
                The specific requirements and restrictions associated with obtaining a business visa vary depending on the country being visited and the purpose of the visit. In general, business visas may require proof of a business relationship with a company in the country being visited, evidence of sufficient funds to cover expenses, and a valid passport with at least six months of validity remaining. It is important to note that a business visa does not allow individuals to work or engage in employment activities in a foreign country.
              </p>

              <h2 className="text-2xl font-bold text-[#0E1E3A] mb-2">How to Apply for a Study Visa from India ?</h2>
              <p className="text-sm text-zinc-600 mb-1">The application process for a study visa varies depending on the country you plan to study in.</p>
              <p className="text-sm text-zinc-600 mb-3">However, there are some general steps that you can follow:</p>
              <ul className="flex flex-col gap-2 mb-6 list-disc list-inside">
                {APPLY_STEPS.map((step, i) => (
                  <li key={i} className="text-sm text-[#1a6fa8] leading-relaxed">{step}</li>
                ))}
              </ul>

              <h2 className="text-2xl font-bold text-[#0E1E3A] mb-2">Best Countries to Migrate from India as an International Student</h2>
              <p className="text-sm text-zinc-600 mb-3">
                Below mentioned countries are recommended for a newcomer who want to study abroad, as these nations have outstanding academic facilities.
              </p>
              <ul className="flex flex-col gap-1 mb-6 list-disc list-inside">
                {TOP_COUNTRIES.map((c) => (
                  <li key={c} className="text-sm text-[#1a6fa8]">{c}</li>
                ))}
              </ul>

              <h2 className="text-2xl font-bold text-[#0E1E3A] mb-2">Benefits of Obtaining a Study Visa</h2>
              <p className="text-sm text-[#1a6fa8] mb-3">There are several benefits of obtaining a study visa, including:</p>
              <ul className="flex flex-col gap-2 mb-4 list-disc list-inside">
                {BENEFITS.map((b, i) => (
                  <li key={i} className="text-sm text-[#1a6fa8] leading-relaxed">{b}</li>
                ))}
              </ul>
              <p className="text-sm text-[#1a6fa8] leading-relaxed mb-1">
                If you are struggling to know whether you will be eligible or not for the Study Visa, or what kind of requirements there are, contact Oasis, Best Study Abroad Consultants in India.
              </p>
              <p className="text-sm text-[#1a6fa8]">or more information <span className="underline cursor-pointer">consult with us.</span></p>
            </div>
          </div>

          <VisaSidebar activeVisa="Study Visa" visaType="Study Visa" showTags />
        </div>
      </div>
    </section>
  );
}
