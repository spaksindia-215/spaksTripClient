import type { GroupTour } from "@/lib/mock/tourPackages";

type Props = {
  tour: GroupTour;
  onJoin: (tour: GroupTour) => void;
};

const TYPE_STYLES: Record<GroupTour["type"], { bg: string; text: string }> = {
  Backpacking: { bg: "bg-blue-100",   text: "text-blue-700"   },
  Luxury:      { bg: "bg-purple-100", text: "text-purple-700" },
  Family:      { bg: "bg-green-100",  text: "text-green-700"  },
  Adventure:   { bg: "bg-orange-100", text: "text-orange-700" },
  Cultural:    { bg: "bg-teal-100",   text: "text-teal-700"   },
};

function formatDate(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const PERSON_ICONS = ["👤", "👤", "👤", "👤"];

export default function GroupTourCard({ tour, onJoin }: Props) {
  const typeStyle = TYPE_STYLES[tour.type];
  const isUrgent = tour.seats_left < 5;
  const filledSeats = tour.group_size - tour.seats_left;
  const fillPct = (filledSeats / tour.group_size) * 100;

  return (
    <article className="rounded-xl border border-border-soft bg-white p-5 shadow-sm flex flex-col sm:flex-row sm:items-start gap-4 hover:shadow-md transition-shadow">
      {/* Left: date block */}
      <div className="flex flex-col items-center justify-center rounded-lg bg-[#1e3a5f] text-white px-4 py-3 min-w-[80px] text-center shrink-0">
        <span className="text-[11px] font-semibold uppercase opacity-80">
          {new Date(tour.start_date + "T00:00:00").toLocaleDateString("en-IN", { month: "short" })}
        </span>
        <span className="text-[26px] font-extrabold leading-tight">
          {new Date(tour.start_date + "T00:00:00").getDate()}
        </span>
        <span className="text-[11px] opacity-80">
          {new Date(tour.start_date + "T00:00:00").getFullYear()}
        </span>
      </div>

      {/* Center: details */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${typeStyle.bg} ${typeStyle.text}`}>
            {tour.type}
          </span>
          {isUrgent && (
            <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-[11px] font-bold text-red-600 animate-pulse">
              🔥 Only {tour.seats_left} seats left!
            </span>
          )}
        </div>

        <p className="text-[14px] font-bold text-ink">
          {formatDate(tour.start_date)} → {formatDate(tour.end_date)}
        </p>

        {/* Group avatar dots */}
        <div className="flex items-center gap-1.5 mt-2">
          <div className="flex -space-x-1.5">
            {PERSON_ICONS.slice(0, Math.min(4, filledSeats)).map((icon, i) => (
              <span
                key={i}
                className="flex h-6 w-6 items-center justify-center rounded-full bg-[#e8f0fb] border border-white text-[11px]"
              >
                {icon}
              </span>
            ))}
            {filledSeats > 4 && (
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#dde7f9] border border-white text-[10px] font-bold text-[#1a5ba8]">
                +{filledSeats - 4}
              </span>
            )}
          </div>
          <span className="text-[12px] text-ink-soft">
            {filledSeats} / {tour.group_size} joined
          </span>
        </div>

        {/* Fill bar */}
        <div className="mt-2 h-1.5 w-full max-w-[200px] rounded-full bg-surface-muted overflow-hidden">
          <div
            className={`h-full rounded-full ${fillPct >= 80 ? "bg-[#e53e2a]" : fillPct >= 50 ? "bg-orange-400" : "bg-green-500"}`}
            style={{ width: `${fillPct}%` }}
          />
        </div>
      </div>

      {/* Right: price + CTA */}
      <div className="flex flex-col items-end gap-2 shrink-0">
        <div className="text-right">
          <p className="text-[11px] text-ink-muted">per person</p>
          <p className="text-[18px] font-extrabold text-[#1a5ba8]">
            ₹ {tour.price.toLocaleString("en-IN")}/-
          </p>
        </div>
        <button
          type="button"
          onClick={() => onJoin(tour)}
          className={`rounded-lg px-4 py-2 text-[13px] font-bold text-white transition-colors ${
            isUrgent
              ? "bg-[#e53e2a] hover:bg-[#c0392b]"
              : "bg-[#1e3a5f] hover:bg-[#162d4a]"
          }`}
        >
          Join Group
        </button>
      </div>
    </article>
  );
}
