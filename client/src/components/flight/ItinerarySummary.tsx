import { getAirport } from "@/lib/mock/airports";
import { airlineName, type FlightOffer } from "@/lib/mock/flights";
import { formatDuration, formatTime, formatDayMonth, formatWeekday } from "@/lib/format";
import AirlineLogo from "./AirlineLogo";
import Badge from "@/components/ui/Badge";

export default function ItinerarySummary({
  offer,
  compact = false,
}: {
  offer: FlightOffer;
  compact?: boolean;
}) {
  const first = offer.segments[0];
  const last = offer.segments.at(-1)!;

  return (
    <div className="rounded-xl bg-white border border-border-soft p-5 shadow-[var(--shadow-xs)]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <AirlineLogo code={first.airlineCode} size={40} />
          <div>
            <div className="text-[15px] font-bold text-ink">{airlineName(first.airlineCode)}</div>
            <div className="text-[12px] text-ink-muted">
              {first.flightNumber} · {first.aircraft}
            </div>
          </div>
        </div>
        <Badge tone="info">{offer.cabin.replace("_", " ")}</Badge>
      </div>

      <div className="mt-4 flex items-center gap-4">
        <div>
          <div className="text-[10px] uppercase tracking-wide text-ink-muted">
            {formatWeekday(first.depart)}, {formatDayMonth(first.depart)}
          </div>
          <div className="text-[22px] font-extrabold text-ink leading-none">
            {formatTime(first.depart)}
          </div>
          <div className="text-[13px] font-semibold text-ink-soft">
            {first.from} · {getAirport(first.from)?.city}
          </div>
          {first.fromTerminal && (
            <div className="text-[11px] text-ink-muted">Terminal {first.fromTerminal}</div>
          )}
        </div>

        <div className="flex-1 flex flex-col items-center">
          <div className="text-[11px] text-ink-muted mb-1">
            {formatDuration(offer.totalDurationMin)} · {offer.stops === 0 ? "Non-stop" : `${offer.stops} stop${offer.stops > 1 ? "s" : ""}`}
          </div>
          <div className="w-full flex items-center">
            <span className="h-px flex-1 bg-border" />
            <svg viewBox="0 0 24 24" width={16} height={16} fill="currentColor" aria-hidden className="text-brand-500 mx-1">
              <path d="M22 16v-2l-8.5-5V3.5a1.5 1.5 0 0 0-3 0V9L2 14v2l8.5-2.5V19L8 20.5v1.5l4-1 4 1V20.5L13.5 19v-5.5L22 16z" />
            </svg>
            <span className="h-px flex-1 bg-border" />
          </div>
        </div>

        <div className="text-right">
          <div className="text-[10px] uppercase tracking-wide text-ink-muted">
            {formatWeekday(last.arrive)}, {formatDayMonth(last.arrive)}
          </div>
          <div className="text-[22px] font-extrabold text-ink leading-none">
            {formatTime(last.arrive)}
          </div>
          <div className="text-[13px] font-semibold text-ink-soft">
            {last.to} · {getAirport(last.to)?.city}
          </div>
          {last.toTerminal && (
            <div className="text-[11px] text-ink-muted">Terminal {last.toTerminal}</div>
          )}
        </div>
      </div>

      {!compact && offer.segments.length > 1 && (
        <div className="mt-4 border-t border-border-soft pt-4">
          <div className="text-[12px] font-semibold uppercase tracking-wide text-ink-muted mb-2">
            Flight details
          </div>
          <div className="flex flex-col gap-3">
            {offer.segments.map((s) => (
              <div key={s.id} className="flex items-center gap-3 text-[13px]">
                <AirlineLogo code={s.airlineCode} size={28} />
                <div className="flex-1">
                  <div className="font-semibold text-ink">
                    {s.from} {formatTime(s.depart)} → {s.to} {formatTime(s.arrive)}
                  </div>
                  <div className="text-ink-muted text-[11px]">
                    {airlineName(s.airlineCode)} · {s.flightNumber} · {formatDuration(s.durationMin)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
