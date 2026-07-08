import { cn } from "@/lib/cn";

type Step = "room" | "guest" | "payment" | "confirmation";

const STEPS: Array<{ id: Step; label: string }> = [
  { id: "room", label: "Select Room" },
  { id: "guest", label: "Guest Details" },
  { id: "payment", label: "Payment" },
  { id: "confirmation", label: "Confirmation" },
];

const ORDER: Step[] = ["room", "guest", "payment", "confirmation"];

export default function HotelBookingStepper({ active }: { active: Step }) {
  const activeIdx = ORDER.indexOf(active);

  return (
    <div className="bg-white border-b border-border-soft">
      <div className="mx-auto max-w-5xl px-4 md:px-6">
        <ol className="flex items-center" aria-label="Booking steps">
          {STEPS.map((step, i) => {
            const done = i < activeIdx;
            const current = i === activeIdx;
            return (
              <li key={step.id} className="flex flex-1 items-center">
                <div className="flex flex-col items-center gap-1 py-3 w-full">
                  <div
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-full text-[12px] font-bold transition-colors",
                      done && "bg-success-500 text-white",
                      current && "bg-brand-600 text-white",
                      !done && !current && "bg-surface-sunken text-ink-muted",
                    )}
                    aria-current={current ? "step" : undefined}
                  >
                    {done ? (
                      <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      i + 1
                    )}
                  </div>
                  <span
                    className={cn(
                      "hidden sm:block text-[11px] font-semibold",
                      current && "text-brand-700",
                      done && "text-success-600",
                      !done && !current && "text-ink-muted",
                    )}
                  >
                    {step.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={cn(
                      "h-0.5 flex-1 mx-1 rounded",
                      i < activeIdx ? "bg-success-500" : "bg-border-soft",
                    )}
                    aria-hidden
                  />
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
