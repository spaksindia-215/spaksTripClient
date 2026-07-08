import VisaSidebar from "./VisaSidebar";

const APPLY_STEPS = [
  "Check the website of the embassy or consulate of the country you plan to visit to find out the specific requirements for a business visa. This may include documentation such as a passport, visa application form, invitation letter, and proof of financial means.",
  "Complete the visa application form, providing accurate and up-to-date information.",
  "Collect all the documents required for your visa application, including your passport, invitation letter, proof of financial means, and any other required documents.",
  "Schedule an appointment at the consulate or embassy for submitting your application and supporting documents. Online visa applications may also be allowed by some countries.",
  "Pay the visa application fee. The cost can vary depending on the country you are visiting and the type of visa you are applying for.",
  "Attend any required interview, if applicable, and provide any additional information or documents that may be requested.",
  "Wait for the processing of your application. Processing times can vary depending on the country, so it is important to apply well in advance of your intended travel dates.",
  "Once your application is approved, you will receive your visa, typically in the form of a stamp in your passport.",
];

const BENEFITS = [
  "One of the biggest advantages of moving overseas with the help of a business visa is the availability of infrastructure. The best part about investing overseas is that you will be provided with the latest tools to run your business smoothly.",
  "Another important advantage of setting up a business overseas is that you will have access to world markets like the USA, Mexico, and European countries. It can turn your business profit manifolds.",
  "Availability of resources is also one of the advantages to move overseas with a business visa, so many countries are extremely rich in resources which can be convenient for your business to grow significantly.",
  "You have the opportunity to settle as a permanent resident if you are entering any country as an entrepreneur. You can later apply for citizenship in that country.",
  "Business Immigration visa can also help you to move along with the whole family to Canada, family members such as your spouse and children can come with you.",
];

export default function InvestorVisaContent() {
  return (
    <section className="bg-white py-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="flex-1 min-w-0">
            <div className="rounded-xl border border-zinc-200 p-6">
              <div className="rounded-lg overflow-hidden mb-6 h-64">
                <img
                  src="https://images.unsplash.com/photo-1573497620053-ea5300f94f21?auto=format&fit=crop&w=900&q=80"
                  alt="Business investor meeting"
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>

              <h2 className="text-2xl font-bold text-[#0E1E3A] mb-3">What is a work visa ?</h2>
              <p className="text-sm text-[#1a6fa8] leading-relaxed mb-3">
                A business visa is a type of visa that allows individuals to enter a foreign country for the purpose of conducting business activities. Business visas are typically issued to individuals who are traveling to another country to attend meetings, negotiate contracts, or engage in other commercial activities.
              </p>
              <p className="text-sm text-[#1a6fa8] leading-relaxed mb-6">
                The specific requirements and restrictions associated with obtaining a business visa vary depending on the country being visited and the purpose of the visit. In general, business visas may require proof of a business relationship with a company in the country being visited, evidence of sufficient funds to cover expenses, and a valid passport with at least six months of validity remaining. It is important to note that a business visa does not allow individuals to work or engage in employment activities in a foreign country.
              </p>

              <h2 className="text-2xl font-bold text-[#0E1E3A] mb-2">How to Apply for a an Investor Visa ?</h2>
              <p className="text-sm text-zinc-600 mb-3">The process for applying for a business visa can vary depending on the country you are traveling to. Some general steps are mentioned below which you can follow:</p>
              <ul className="flex flex-col gap-2 mb-3 list-disc list-inside">
                {APPLY_STEPS.map((step, i) => (
                  <li key={i} className="text-sm text-[#1a6fa8] leading-relaxed">{step}</li>
                ))}
              </ul>
              <p className="text-sm text-[#1a6fa8] leading-relaxed mb-6">
                It is important to note that specific requirements and procedures for applying for a business visa can vary depending on the country and consulate or embassy you are applying through. It is recommended to check with the relevant authorities for the most up-to-date and accurate information.
              </p>

              <h2 className="text-2xl font-bold text-[#0E1E3A] mb-2">Benefits of Obtaining an Investor Visa</h2>
              <p className="text-sm text-zinc-600 mb-3">There are several benefits of obtaining a business visa from better infrastructure to having access to world markets, which are mentioned below:</p>
              <ul className="flex flex-col gap-2 list-disc list-inside">
                {BENEFITS.map((b, i) => (
                  <li key={i} className="text-sm text-[#1a6fa8] leading-relaxed">{b}</li>
                ))}
              </ul>
              <p className="text-sm text-[#1a6fa8] leading-relaxed mt-3">
                Overall, obtaining a business visa provides you with a lot of advantages, like the availability of resources, access to world markets, and availability of infrastructure.
              </p>
            </div>
          </div>

          <VisaSidebar activeVisa="Investor Visa" visaType="Investor Visa" showTags />
        </div>
      </div>
    </section>
  );
}
