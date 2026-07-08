import type { ItineraryDay } from "@/lib/mock/tourPackages";

type Props = {
  days: ItineraryDay[];
};

export default function ItineraryBlock({ days }: Props) {
  return (
    <section className="mt-8">
      <h2 className="text-[20px] font-bold text-ink mb-4">Itinerary</h2>
      <div className="rounded-xl border border-border-soft overflow-hidden">
        <div className="bg-[#f0f8f6] px-5 py-3 border-b border-border-soft">
          <h3 className="text-[15px] font-bold text-[#2a7c6f]">Itinerary Overview:</h3>
        </div>

        <div className="divide-y divide-border-soft">
          {days.map((day, idx) => (
            <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-0">
              {/* Text side */}
              <div className="p-5">
                <div className="flex items-stretch gap-3 mb-3">
                  <div className="rounded bg-[#e8f4f1] border border-[#2a7c6f]/20 px-3 py-1 flex-1">
                    <p className="text-[13px] font-semibold text-ink">
                      {day.day} {day.title}
                    </p>
                  </div>
                  <div className="w-1 bg-[#2a7c6f] rounded-full shrink-0" />
                </div>
                <p className="text-[13px] text-ink-soft leading-relaxed text-justify">
                  {day.content}
                </p>
              </div>

              {/* Image side */}
              <div className="h-56 md:h-auto overflow-hidden">
                <img
                  src={day.image}
                  alt={day.title}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
