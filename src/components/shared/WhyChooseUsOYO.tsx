import SectionHeading from "@/components/landing/SectionHeading";

const FEATURES = [
  "Best Review",
  "No Cost EMI Facility",
  "Premium Tours",
  "Verified Drivers",
  "Verified Hotels",
  "Well Planned Itineraries",
  "Lowest Price Challenges",
  "24*7 Call & WhatsApp Support",
];

export default function WhyChooseUsOYO() {
  return (
    <section className="bg-[#F4F6F9] py-20">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading title="Why Choose Us OYO Tours" />
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <div
              key={f}
              className="flex items-center justify-center rounded-2xl bg-white px-6 py-10 text-center shadow-sm ring-1 ring-black/[0.04]"
            >
              <h3 className="text-base font-bold text-[#0E1E3A]">{f}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
