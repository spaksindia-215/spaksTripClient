import { cn } from "@/lib/cn";

const STEPS = [
  { key: "review", label: "Review" },
  { key: "traveler", label: "Travellers" },
  { key: "payment", label: "Payment" },
  { key: "confirmation", label: "Confirmation" },
];

export default function BookingStepper({ active }: { active: (typeof STEPS)[number]["key"] }) {
  const activeIdx = STEPS.findIndex((s) => s.key === active);
  return (
    <div className="bg-white border-b border-border-soft">
      <div className="mx-auto max-w-5xl px-4 md:px-6 py-3">
        <ol className="flex items-center gap-2">
          {STEPS.map((s, i) => {
            const done = i < activeIdx;
            const current = i === activeIdx;
            return (
              <li key={s.key} className="flex items-center gap-2 flex-1">
                <span
                  className={cn(
                    "grid h-7 w-7 place-items-center rounded-full text-[12px] font-bold",
                    done && "bg-success-500 text-white",
                    current && "bg-brand-600 text-white",
                    !done && !current && "bg-surface-sunken text-ink-muted",
                  )}
                >
                  {done ? (
                    <svg viewBox="0 0 24 24" width={12} height={12} fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    i + 1
                  )}
                </span>
                <span
                  className={cn(
                    "text-[12px] md:text-[13px] font-semibold",
                    current ? "text-brand-700" : done ? "text-ink-soft" : "text-ink-muted",
                  )}
                >
                  {s.label}
                </span>
                {i < STEPS.length - 1 && (
                  <span
                    className={cn(
                      "flex-1 h-px",
                      i < activeIdx ? "bg-success-500" : "bg-border",
                    )}
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
