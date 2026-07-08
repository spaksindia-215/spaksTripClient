"use client";

import { useState } from "react";

type Tab = "stays" | "flights";

export default function ExpediaSearch() {
  const [tab, setTab] = useState<Tab>("stays");

  return (
    <section
      aria-label="Search stays and flights"
      className="mx-auto -mt-20 max-w-7xl px-6 relative z-10"
    >
      <div className="grid grid-cols-1 gap-6 rounded-2xl bg-white p-6 shadow-[0_10px_40px_-10px_rgba(10,30,60,0.18)] md:grid-cols-[360px_1fr] md:p-8">
        <ExpediaCard />

        <div>
          <div
            role="tablist"
            aria-label="Search type"
            className="flex border-b border-zinc-200"
          >
            <TabButton
              active={tab === "stays"}
              onClick={() => setTab("stays")}
              label="Stays"
            />
            <TabButton
              active={tab === "flights"}
              onClick={() => setTab("flights")}
              label="Flights"
            />
          </div>

          <form
            className="mt-6 grid grid-cols-1 gap-4"
            onSubmit={(e) => e.preventDefault()}
          >
            <Field
              icon={<PinIcon />}
              placeholder={tab === "stays" ? "Going to" : "From — To"}
              type="text"
              ariaLabel={tab === "stays" ? "Destination" : "Route"}
            />

            <div className="grid grid-cols-2 gap-4">
              <Field
                icon={<CalendarIcon />}
                placeholder="Check-in"
                type="text"
                ariaLabel="Check-in date"
              />
              <Field
                icon={<CalendarIcon />}
                placeholder="Check-out"
                type="text"
                ariaLabel="Check-out date"
              />
            </div>

            <div className="mt-2 flex items-end justify-between gap-6">
              <PoweredByExpedia />
              <button
                type="submit"
                className="inline-flex h-12 items-center justify-center rounded-md bg-[#1668E3] px-8 text-sm font-semibold text-white shadow hover:bg-[#0f58c7] transition-colors"
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

function TabButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      role="tab"
      aria-selected={active}
      type="button"
      onClick={onClick}
      className={`flex-1 px-4 py-3 text-base font-medium transition-colors ${
        active
          ? "border-b-2 border-[#1668E3] text-[#1668E3]"
          : "border-b-2 border-transparent text-zinc-500 hover:text-zinc-700"
      }`}
    >
      {label}
    </button>
  );
}

function Field({
  icon,
  placeholder,
  type,
  ariaLabel,
}: {
  icon: React.ReactNode;
  placeholder: string;
  type: string;
  ariaLabel: string;
}) {
  return (
    <label className="flex items-center gap-3 rounded-md border border-zinc-300 px-3 h-12 focus-within:border-[#1668E3] focus-within:ring-2 focus-within:ring-[#1668E3]/15">
      <span className="text-zinc-500">{icon}</span>
      <input
        aria-label={ariaLabel}
        type={type}
        placeholder={placeholder}
        className="w-full bg-transparent text-[15px] text-zinc-800 placeholder:text-zinc-400 outline-none"
      />
    </label>
  );
}

function ExpediaCard() {
  return (
    <a
      href="https://www.expedia.com"
      target="_blank"
      rel="noopener noreferrer"
      className="relative flex flex-col overflow-hidden rounded-xl bg-[#0B2240] text-white"
    >
      <img
        src="https://images.unsplash.com/photo-1473186505569-9c61870c11f9?auto=format&fit=crop&w=800&q=80"
        alt="Sailboats at marina"
        className="h-36 w-full object-cover"
        loading="lazy"
      />
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-6 text-center">
        <div className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="grid h-7 w-7 place-items-center rounded-md bg-[#FFC72C] text-black"
          >
            <svg viewBox="0 0 24 24" width={16} height={16} fill="currentColor">
              <path d="M3 3h14l4 4v14H3z" opacity=".15" />
              <path d="M7 17 17 7M9 7h8v8" stroke="currentColor" strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span className="text-2xl font-extrabold tracking-tight">Expedia</span>
        </div>
        <p className="text-lg font-semibold leading-snug">
          Bye-bye bucket list,
          <br />
          hello adventure!
        </p>
        <span className="inline-flex items-center rounded-full bg-[#FFC72C] px-5 py-2 text-sm font-bold text-black">
          Start my journey
        </span>
      </div>
    </a>
  );
}

function PoweredByExpedia() {
  return (
    <div className="flex flex-col">
      <span className="text-xs text-zinc-500">Powered by</span>
      <span className="flex items-center gap-1 text-lg font-extrabold text-[#0B2240]">
        <span
          aria-hidden="true"
          className="grid h-5 w-5 place-items-center rounded-sm bg-[#FFC72C] text-black"
        >
          <svg viewBox="0 0 24 24" width={12} height={12} fill="currentColor">
            <path d="M7 17 17 7M9 7h8v8" stroke="currentColor" strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        Expedia
      </span>
    </div>
  );
}

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" width={18} height={18} fill="currentColor" aria-hidden="true">
      <path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" width={18} height={18} fill="currentColor" aria-hidden="true">
      <path d="M7 2v2H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2V2h-2v2H9V2H7Zm-2 8h14v9H5v-9Z" />
    </svg>
  );
}
