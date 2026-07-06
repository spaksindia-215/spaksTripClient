"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { cn } from "@/lib/cn";

export type ComboOption = {
  value: string;
  label: string;
  sublabel?: string;
  badge?: string;
  group?: string;
};

type Props = {
  label?: string;
  placeholder?: string;
  value: ComboOption | null;
  onChange: (v: ComboOption | null) => void;
  search: (q: string) => Promise<ComboOption[]> | ComboOption[];
  leading?: ReactNode;
  renderOption?: (o: ComboOption, active: boolean) => ReactNode;
  renderValue?: (o: ComboOption) => ReactNode;
  minQuery?: number;
  emptyText?: string;
  className?: string;
  inputClassName?: string;
  autoFocus?: boolean;
};

export default function Combobox({
  label,
  placeholder,
  value,
  onChange,
  search,
  leading,
  renderOption,
  renderValue,
  minQuery = 0,
  emptyText = "No matches",
  className,
  inputClassName,
  autoFocus,
}: Props) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [opts, setOpts] = useState<ComboOption[]>([]);
  const [hover, setHover] = useState(0);
  const [busy, setBusy] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const id = useId();

  useEffect(() => {
    if (!open) return;
    if (query.length < minQuery) {
      setOpts([]);
      return;
    }
    let cancelled = false;
    setBusy(true);
    Promise.resolve(search(query)).then((result) => {
      if (cancelled) return;
      setOpts(result);
      setHover(0);
      setBusy(false);
    });
    return () => {
      cancelled = true;
    };
  }, [query, open, search, minQuery]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const select = (o: ComboOption) => {
    onChange(o);
    setOpen(false);
    setQuery("");
    inputRef.current?.blur();
  };

  const grouped = (() => {
    const g = new Map<string, ComboOption[]>();
    for (const o of opts) {
      const k = o.group ?? "";
      if (!g.has(k)) g.set(k, []);
      g.get(k)!.push(o);
    }
    return g;
  })();

  let flatIndex = -1;

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      {label ? (
        <label htmlFor={id} className="text-[12px] font-medium text-ink-muted">
          {label}
        </label>
      ) : null}
      <div
        className={cn(
          "flex items-center gap-2 rounded-md bg-white border border-border px-3 h-11 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20",
          inputClassName,
        )}
      >
        {leading ? <span className="text-ink-muted">{leading}</span> : null}
        {value && !open ? (
          <button
            type="button"
            onClick={() => {
              setOpen(true);
              setTimeout(() => inputRef.current?.focus(), 0);
            }}
            className="flex-1 min-w-0 text-left"
          >
            {renderValue ? (
              renderValue(value)
            ) : (
              <span className="flex flex-col">
                <span className="text-[14px] font-semibold text-ink truncate">
                  {value.label}
                </span>
                {value.sublabel ? (
                  <span className="text-[11px] text-ink-muted truncate">
                    {value.sublabel}
                  </span>
                ) : null}
              </span>
            )}
          </button>
        ) : (
          <input
            id={id}
            ref={inputRef}
            autoFocus={autoFocus}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setHover((h) => Math.min(opts.length - 1, h + 1));
              }
              if (e.key === "ArrowUp") {
                e.preventDefault();
                setHover((h) => Math.max(0, h - 1));
              }
              if (e.key === "Enter" && opts[hover]) {
                e.preventDefault();
                select(opts[hover]);
              }
              if (e.key === "Escape") setOpen(false);
            }}
            placeholder={placeholder}
            className="flex-1 min-w-0 bg-transparent outline-none text-[14px] text-ink placeholder:text-ink-subtle"
          />
        )}
        {value && (
          <button
            type="button"
            onClick={() => {
              onChange(null);
              setQuery("");
              setOpen(true);
              setTimeout(() => inputRef.current?.focus(), 0);
            }}
            aria-label="Clear"
            className="text-ink-muted hover:text-ink"
          >
            <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" aria-hidden>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>

      {open && (
        <div
          role="listbox"
          className="absolute z-50 mt-1.5 w-full min-w-[280px] rounded-lg bg-white shadow-[var(--shadow-pop)] border border-border-soft max-h-[340px] overflow-y-auto scrollbar-thin animate-pop-in"
        >
          {busy ? (
            <div className="px-4 py-3 text-[13px] text-ink-muted">Searching…</div>
          ) : opts.length === 0 ? (
            <div className="px-4 py-3 text-[13px] text-ink-muted">{emptyText}</div>
          ) : (
            Array.from(grouped.entries()).map(([gk, list]) => (
              <div key={gk}>
                {gk ? (
                  <div className="px-3 pt-2 pb-1 text-[11px] font-semibold uppercase tracking-wide text-ink-subtle">
                    {gk}
                  </div>
                ) : null}
                {list.map((o) => {
                  flatIndex += 1;
                  const active = flatIndex === hover;
                  return (
                    <button
                      key={o.value}
                      type="button"
                      role="option"
                      aria-selected={active}
                      onMouseEnter={() => setHover(flatIndex)}
                      onClick={() => select(o)}
                      className={cn(
                        "flex w-full items-center gap-3 px-3 py-2 text-left",
                        active ? "bg-brand-50" : "hover:bg-surface-muted",
                      )}
                    >
                      {renderOption ? (
                        renderOption(o, active)
                      ) : (
                        <>
                          <span className="flex-1 min-w-0">
                            <span className="block text-[14px] font-semibold text-ink truncate">
                              {o.label}
                            </span>
                            {o.sublabel ? (
                              <span className="block text-[12px] text-ink-muted truncate">
                                {o.sublabel}
                              </span>
                            ) : null}
                          </span>
                          {o.badge ? (
                            <span className="text-[11px] font-semibold text-ink-muted bg-surface-sunken px-2 py-0.5 rounded">
                              {o.badge}
                            </span>
                          ) : null}
                        </>
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
