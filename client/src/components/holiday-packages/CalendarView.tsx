"use client";

import { useState, useMemo } from "react";
import type { CalendarDate, Availability } from "@/lib/mock/tourPackages";

// ── helpers ─────────────────────────────────────────────────────────────────

function extractNights(duration: string): number {
  const m = duration.match(/(\d+)\s*(?:nights?|NIGHT)/i);
  return m ? parseInt(m[1], 10) : 5;
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

function formatDisplayDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// ── availability styles ──────────────────────────────────────────────────────

const availStyle: Record<Availability, { cell: string; dot: string; label: string; text: string }> = {
  available: {
    cell: "bg-green-50 border-green-300 hover:bg-green-100 cursor-pointer",
    dot: "bg-green-500",
    label: "Available",
    text: "text-green-700",
  },
  limited: {
    cell: "bg-orange-50 border-orange-300 hover:bg-orange-100 cursor-pointer",
    dot: "bg-orange-500",
    label: "Limited",
    text: "text-orange-700",
  },
  sold_out: {
    cell: "bg-gray-100 border-gray-200 cursor-not-allowed",
    dot: "bg-gray-400",
    label: "Sold Out",
    text: "text-gray-400",
  },
};

// ── key inclusions (static) ──────────────────────────────────────────────────

const KEY_INCLUSIONS = [
  "🏨 Hotel Stay (as per nights)",
  "🍽️ Breakfast & Dinner daily",
  "🚌 All transfers & sightseeing",
  "✈️ Airport pick-up & drop",
  "🎫 Entry fees to monuments",
];

// ── types ─────────────────────────────────────────────────────────────────────

type Props = {
  calendarDates: CalendarDate[];
  pkgTitle: string;
  duration: string;
  onDateSelect?: (checkIn: string, checkOut: string) => void;
};

// ── component ─────────────────────────────────────────────────────────────────

export default function CalendarView({ calendarDates, pkgTitle, duration, onDateSelect }: Props) {
  const nights = extractNights(duration);
  const today = todayStr();

  // find first available date after today
  const nearestAvailable = useMemo(
    () =>
      calendarDates
        .filter((d) => d.availability !== "sold_out" && d.date >= today)
        .sort((a, b) => a.date.localeCompare(b.date))[0]?.date ?? null,
    [calendarDates, today]
  );

  // default display month = month of nearest available date, fallback to current
  const defaultDate = nearestAvailable ? new Date(nearestAvailable + "T00:00:00") : new Date();
  const [displayYear, setDisplayYear] = useState(defaultDate.getFullYear());
  const [displayMonth, setDisplayMonth] = useState(defaultDate.getMonth()); // 0-indexed
  const [selectedDate, setSelectedDate] = useState<string | null>(nearestAvailable);

  // build fast lookup map
  const calMap = useMemo<Map<string, CalendarDate>>(() => {
    const m = new Map<string, CalendarDate>();
    calendarDates.forEach((d) => m.set(d.date, d));
    return m;
  }, [calendarDates]);

  // build calendar grid cells
  const daysInMonth = new Date(displayYear, displayMonth + 1, 0).getDate();
  const firstDow = new Date(displayYear, displayMonth, 1).getDay(); // 0=Sun
  const cells: (number | null)[] = [
    ...Array<null>(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  function pad(n: number) {
    return n.toString().padStart(2, "0");
  }
  function cellDateStr(day: number): string {
    return `${displayYear}-${pad(displayMonth + 1)}-${pad(day)}`;
  }

  function prevMonth() {
    if (displayMonth === 0) { setDisplayMonth(11); setDisplayYear((y) => y - 1); }
    else setDisplayMonth((m) => m - 1);
  }
  function nextMonth() {
    if (displayMonth === 11) { setDisplayMonth(0); setDisplayYear((y) => y + 1); }
    else setDisplayMonth((m) => m + 1);
  }

  function handleDayClick(day: number) {
    const ds = cellDateStr(day);
    const cal = calMap.get(ds);
    if (!cal || cal.availability === "sold_out") return;
    setSelectedDate(ds);
  }

  const selectedCal = selectedDate ? calMap.get(selectedDate) : null;
  const checkOutDate = selectedDate ? addDays(selectedDate, nights) : null;

  function handleProceed() {
    if (selectedDate && checkOutDate && onDateSelect) {
      onDateSelect(selectedDate, checkOutDate);
    }
  }

  return (
    <div className="mt-6 flex flex-col lg:flex-row gap-6">
      {/* ── Calendar panel ─────────────────────────────────────────────── */}
      <div className="flex-1 rounded-xl border border-border-soft bg-white p-5 shadow-sm">

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mb-4">
          {(["available", "limited", "sold_out"] as Availability[]).map((a) => (
            <span key={a} className="flex items-center gap-1.5 text-[12px] text-ink-soft">
              <span className={`h-2.5 w-2.5 rounded-full ${availStyle[a].dot}`} />
              {availStyle[a].label}
            </span>
          ))}
        </div>

        {/* Month nav */}
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={prevMonth}
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-surface-muted transition-colors text-ink-soft font-bold text-lg"
            aria-label="Previous month"
          >
            ‹
          </button>
          <h3 className="text-[15px] font-bold text-ink">
            {MONTH_NAMES[displayMonth]} {displayYear}
          </h3>
          <button
            type="button"
            onClick={nextMonth}
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-surface-muted transition-colors text-ink-soft font-bold text-lg"
            aria-label="Next month"
          >
            ›
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 mb-1">
          {DAY_LABELS.map((d) => (
            <div key={d} className="text-center text-[11px] font-semibold text-ink-muted py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 gap-1">
          {cells.map((day, idx) => {
            if (day === null) {
              return <div key={`e-${idx}`} />;
            }
            const ds = cellDateStr(day);
            const cal = calMap.get(ds);
            const isToday = ds === today;
            const isSelected = ds === selectedDate;
            const isPast = ds < today;
            const style = cal ? availStyle[cal.availability] : null;

            return (
              <button
                key={ds}
                type="button"
                disabled={!cal || cal.availability === "sold_out" || isPast}
                onClick={() => handleDayClick(day)}
                className={[
                  "relative flex flex-col items-center rounded-lg border p-1 text-center transition-all min-h-[62px]",
                  isPast && !cal
                    ? "border-transparent text-ink-subtle cursor-default opacity-40"
                    : !cal
                    ? "border-transparent text-ink-soft cursor-default"
                    : style!.cell,
                  isSelected ? "ring-2 ring-[#1a5ba8] ring-offset-1" : "",
                  isToday && !isSelected ? "ring-2 ring-brand-400 ring-offset-1" : "",
                ].join(" ")}
              >
                <span className={`text-[12px] font-semibold leading-tight ${cal ? style!.text : "text-ink-muted"}`}>
                  {day}
                </span>
                {cal && (
                  <>
                    <span className={`text-[10px] font-bold leading-tight ${style!.text}`}>
                      ₹{(cal.price / 1000).toFixed(0)}k
                    </span>
                    <span className={`h-1.5 w-1.5 rounded-full mt-0.5 ${style!.dot}`} />
                  </>
                )}
              </button>
            );
          })}
        </div>

        {/* Calendar footer note */}
        <p className="mt-3 text-[11px] text-ink-muted text-center">
          Prices shown are per person · Click a date to see full details
        </p>
      </div>

      {/* ── Date details panel ─────────────────────────────────────────── */}
      <div className="w-full lg:w-[300px] shrink-0">
        {selectedCal && selectedDate && checkOutDate ? (
          <div className="rounded-xl border border-border-soft bg-white p-5 shadow-sm flex flex-col gap-4 sticky top-24">
            <div>
              <p className="text-[11px] font-semibold text-ink-muted uppercase tracking-wide mb-1">
                Selected Departure
              </p>
              <h4 className="text-[15px] font-bold text-ink">{pkgTitle}</h4>
            </div>

            {/* Date range */}
            <div className="flex items-center gap-2 rounded-lg bg-surface-muted px-3 py-2">
              <svg viewBox="0 0 24 24" width={15} height={15} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="text-brand-500 shrink-0"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              <span className="text-[13px] font-semibold text-ink">
                {formatDisplayDate(selectedDate)} → {formatDisplayDate(checkOutDate)}
              </span>
            </div>

            {/* Price */}
            <div>
              <p className="text-[11px] text-ink-muted">Price per person</p>
              <p className="text-[22px] font-extrabold text-[#1a5ba8] leading-tight">
                ₹ {selectedCal.price.toLocaleString("en-IN")}/-
              </p>
            </div>

            {/* Seats progress */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-[12px] text-ink-soft">Seats Available</span>
                <span className={`text-[12px] font-bold ${selectedCal.seats_left <= 3 ? "text-[#e53e2a]" : selectedCal.seats_left <= 7 ? "text-orange-600" : "text-green-700"}`}>
                  {selectedCal.seats_left} / {selectedCal.total_seats} left
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-surface-muted overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${selectedCal.seats_left <= 3 ? "bg-[#e53e2a]" : selectedCal.seats_left <= 7 ? "bg-orange-400" : "bg-green-500"}`}
                  style={{ width: `${(selectedCal.seats_left / selectedCal.total_seats) * 100}%` }}
                />
              </div>
              {selectedCal.seats_left <= 5 && selectedCal.seats_left > 0 && (
                <p className="mt-1 text-[11px] font-semibold text-[#e53e2a]">
                  🔥 Hurry! Only {selectedCal.seats_left} seats left
                </p>
              )}
            </div>

            {/* Inclusions */}
            <div>
              <p className="text-[12px] font-semibold text-ink mb-2">Key Inclusions</p>
              <ul className="flex flex-col gap-1">
                {KEY_INCLUSIONS.map((inc) => (
                  <li key={inc} className="flex items-start gap-1.5 text-[12px] text-ink-soft">
                    <svg viewBox="0 0 24 24" width={11} height={11} fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="text-green-500 shrink-0 mt-0.5"><polyline points="20 6 9 17 4 12"/></svg>
                    {inc}
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA */}
            <button
              type="button"
              onClick={handleProceed}
              className="w-full rounded-full bg-[#e53e2a] py-2.5 text-[14px] font-bold text-white hover:bg-[#c0392b] transition-colors"
            >
              Proceed to Booking
            </button>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border-soft bg-surface-muted flex flex-col items-center justify-center gap-3 p-8 text-center min-h-[260px]">
            <svg viewBox="0 0 24 24" width={36} height={36} fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="text-ink-muted"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            <p className="text-[13px] text-ink-muted">
              Select a departure date from the calendar to see pricing and seat details
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
