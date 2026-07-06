import VisaSidebar from "./VisaSidebar";

const VISITOR_TYPES = [
  { num: "1", label: "Tourist Visa", text: "If you're planning to explore, sightsee, or relax in a new destination, this is the visa for you. It's usually valid for short stays, ranging from a few weeks to a couple of months." },
  { num: "2", label: "Business Visitor Visa", text: "The tourist or visitor visa from India is used if traveling to the country for a business meeting, conference, or to meet potential clients. Such a visa allows one to attend work-related events, but one cannot work for an employer in the country. It's for short-term business trips only." },
  { num: "3", label: "Family and Friend Visitor Visa", text: "This one is for the people you would like to visit, be it family, friends, or a special someone. It allows you to stay with them during your visit. You would probably need an invitation letter from the person you are visiting, showing that they will host you during your trip." },
  { num: "4", label: "Medical Treatment Visa", text: "This visa will allow you to enter the country in order to receive medical treatment. The proof of treatment received and any medical-related paperwork are requirements for this visa." },
  { num: "5", label: "Transit Visa", text: "If you are transiting through a country, on your way to some other destination, this visa allows you to stay for a few days; it is good for layovers of long hours or short stops in between flights." },
  { num: "6", label: "Study and Exchange Visitor Visa", text: "Some short-term educational programs or exchange programs may require a visitor visa rather than a full student visa." },
];

const ELIGIBILITY = [
  { label: "Valid Passport", text: "Your passport has to be valid for at least six months from your proposed date of leaving." },
  { label: "Proof of Financial Stability", text: "You must be able to demonstrate that you will be able to sustain yourself financially while you are there. This could mean bank statements, employment records, or other proof of funds." },
  { label: "Intent to Return Home", text: "You must be able to demonstrate that you intend to return to your home country upon the completion of your trip. This could be through proof of employment, a return ticket, or ties such as family or property." },
  { label: "Clean Criminal Record", text: "Many countries require a background check to ensure you do not have a criminal history." },
  { label: "Health", text: "Some countries require a medical exam, especially if you're applying for medical treatment or staying for a long time." },
];

const APPLY_STEPS = [
  { step: "Step 1: Know Which Visa You Need", text: "The first thing to do is determine what kind of visa you need. Are you visiting for leisure, business, or medical reasons? Be clear about your purpose, as this will determine the type of visa you apply for." },
  {
    step: "Step 2: Collect the Necessary Documents",
    text: "To avoid delays or confusion, ensure that you have all the necessary documents. Some common documents include:",
    bullets: [
      "A valid passport with at least six months of validity.",
      "Completed visa application form.",
      "Passport-sized photos that meet the requirements.",
      "Proof of financial stability, such as bank statements and pay slips.",
      "Travel itinerary, which may include flight bookings and hotel reservations.",
      "An invitation letter from the person you are visiting, if applicable.",
      "Evidence of your ties to your home country, including employment records and family details.",
      "Proof of medical treatment, if applying for a medical visa.",
      "Police clearance, if necessary.",
    ],
  },
  { step: "Step 3: Pay the Application Fee", text: "Most countries require a fee for a visa application. The fee varies by country and type of visa, so pay the correct amount when you submit your application." },
  { step: "Step 4: Attend a Visa Interview (If required)", text: "Sometimes, you might be required to attend an interview. Don't worry! All the consular officer will do is ask you questions about your trip to make sure everything is in order. Be honest and ready to answer any questions they might have." },
  { step: "Step 5: Wait for Processing", text: "The processing times differ from country to country. While some visas are processed in just a few days, others take a few weeks. Apply well in advance to avoid any last-minute stress!" },
];

const PROCESSING = [
  { country: "USA", text: "Processing time for a visitor visa can take around 3-5 weeks." },
  { country: "UK",  text: "A standard visitor visa takes about 15 working days." },
  { country: "Canada", text: "The processing time is around 2-3 weeks, though it can vary based on your application." },
];

export default function VisitVisaContent() {
  return (
    <section className="bg-white py-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="flex-1 min-w-0">
            <div className="rounded-xl border border-zinc-200 p-6">
              <div className="rounded-lg overflow-hidden mb-6 h-64">
                <img
                  src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=900&q=80"
                  alt="Family travelling at airport"
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>

              <h2 className="text-2xl font-bold text-[#0E1E3A] mb-3">What Is A Visitor Visa ?</h2>
              <p className="text-sm text-[#1a6fa8] leading-relaxed mb-6">
                In short, a visitor visa from India is a short-stay visa that grants access to another country for either tourism, visiting family or friends, attending a short-term business event, or seeking medical attention. It is not a long-stay visa for work or education purposes, so if those are your intentions, you might be looking for a different kind of visa. Think of the Visitor Visa as the ticket to stay temporarily in another country.
              </p>

              <h2 className="text-2xl font-bold text-[#0E1E3A] mb-2">Types of Visitor Visa from India</h2>
              <p className="text-sm text-zinc-600 mb-3">The first thing that you have to determine is which kind of Visitor Visa is necessary. Different countries have different kinds, depending on the purpose of your visit. Here&apos;s a breakdown of the most common kinds:</p>
              <div className="flex flex-col gap-4 mb-6">
                {VISITOR_TYPES.map((t) => (
                  <div key={t.num}>
                    <p className="text-sm font-bold text-[#0E1E3A] mb-1">{t.num}. {t.label}</p>
                    <p className="text-sm text-[#1a6fa8] leading-relaxed">{t.text}</p>
                  </div>
                ))}
              </div>

              <h2 className="text-2xl font-bold text-[#0E1E3A] mb-2">Do You Need a Visitor Visa ?</h2>
              <p className="text-sm text-[#1a6fa8] leading-relaxed mb-3">
                Most travelers will require a visitor visa from India to enter a country unless they are from a country that is visa-exempt. Countries such as the USA, UK, Australia, and Canada require visitors coming from many countries to first apply for a visa before making a visit.
              </p>
              <p className="text-sm text-[#1a6fa8] leading-relaxed mb-6">
                However, many countries have agreements where particular nations&apos; travelers are granted permission to visit for brief periods without having to present a visa (known as visa-exempt or visa-waiver agreements). Not sure if you need one? Our team at Oasis Visas can help you figure that out, so you&apos;re not left guessing!
              </p>

              <h2 className="text-2xl font-bold text-[#0E1E3A] mb-2">Eligibility for Visitor Visa from India</h2>
              <p className="text-sm text-zinc-600 mb-3">Each country has its rules but generally speaking, you need to meet the following minimum eligibility criteria:</p>
              <ul className="flex flex-col gap-2 mb-6 list-disc list-inside">
                {ELIGIBILITY.map((e) => (
                  <li key={e.label} className="text-sm leading-relaxed">
                    <span className="font-bold text-[#0E1E3A]">{e.label}: </span>
                    <span className="text-[#1a6fa8]">{e.text}</span>
                  </li>
                ))}
              </ul>

              <h2 className="text-2xl font-bold text-[#0E1E3A] mb-2">How to Apply for a Visitor Visa</h2>
              <p className="text-sm text-[#1a6fa8] mb-4">Applying for a Visitor Visa from India is pretty straightforward but requires some preparation. Here&apos;s how to make sure your application goes smoothly:</p>
              <div className="flex flex-col gap-4 mb-6">
                {APPLY_STEPS.map((s) => (
                  <div key={s.step}>
                    <p className="text-sm font-bold text-[#0E1E3A] mb-1">{s.step}</p>
                    <p className="text-sm text-[#1a6fa8] leading-relaxed">{s.text}</p>
                    {s.bullets && (
                      <ul className="mt-2 flex flex-col gap-1 list-disc list-inside">
                        {s.bullets.map((b) => (
                          <li key={b} className="text-sm text-[#1a6fa8]">{b}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>

              <h2 className="text-2xl font-bold text-[#0E1E3A] mb-2">Processing Times: What to Expect</h2>
              <p className="text-sm text-[#1a6fa8] mb-3">The processing time for your Visitor Visa from India depends on the country and the type of visa. On average, you can expect to wait anywhere from 7 days to 6 weeks for a decision.</p>
              <ul className="flex flex-col gap-2 list-disc list-inside">
                {PROCESSING.map((p) => (
                  <li key={p.country} className="text-sm leading-relaxed">
                    <span className="font-bold text-[#0E1E3A]">{p.country}: </span>
                    <span className="text-[#1a6fa8]">{p.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <VisaSidebar activeVisa="Visit Visa" visaType="Visit Visa" showTags />
        </div>
      </div>
    </section>
  );
}
