"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

type Props = {
  min: number;
  max: number;
  step?: number;
  value: [number, number];
  onChange: (v: [number, number]) => void;
  formatLabel?: (n: number) => string;
  className?: string;
};

export default function RangeSlider({
  min,
  max,
  step = 1,
  value,
  onChange,
  formatLabel,
  className,
}: Props) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [dragging, setDragging] = useState<"min" | "max" | null>(null);

  const clamp = useCallback(
    (n: number) => Math.min(max, Math.max(min, Math.round(n / step) * step)),
    [min, max, step],
  );

  const handlePointer = useCallback(
    (clientX: number, which: "min" | "max") => {
      const track = trackRef.current;
      if (!track) return;
      const r = track.getBoundingClientRect();
      const pct = Math.min(1, Math.max(0, (clientX - r.left) / r.width));
      const val = clamp(min + pct * (max - min));
      if (which === "min") onChange([Math.min(val, value[1]), value[1]]);
      else onChange([value[0], Math.max(val, value[0])]);
    },
    [clamp, min, max, onChange, value],
  );

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: PointerEvent) => handlePointer(e.clientX, dragging);
    const onUp = () => setDragging(null);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [dragging, handlePointer]);

  const pct = (v: number) => ((v - min) / (max - min)) * 100;

  return (
    <div className={cn("select-none", className)}>
      <div
        ref={trackRef}
        className="relative h-1.5 rounded-full bg-surface-sunken"
      >
        <div
          className="absolute h-1.5 rounded-full bg-brand-600"
          style={{ left: `${pct(value[0])}%`, right: `${100 - pct(value[1])}%` }}
        />
        <Thumb
          position={pct(value[0])}
          onPointerDown={() => setDragging("min")}
          label={formatLabel ? formatLabel(value[0]) : String(value[0])}
        />
        <Thumb
          position={pct(value[1])}
          onPointerDown={() => setDragging("max")}
          label={formatLabel ? formatLabel(value[1]) : String(value[1])}
        />
      </div>
      <div className="mt-2 flex items-center justify-between text-[12px] font-medium text-ink-muted">
        <span>{formatLabel ? formatLabel(value[0]) : value[0]}</span>
        <span>{formatLabel ? formatLabel(value[1]) : value[1]}</span>
      </div>
    </div>
  );
}

function Thumb({
  position,
  onPointerDown,
  label,
}: {
  position: number;
  onPointerDown: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onPointerDown={(e) => {
        (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
        onPointerDown();
      }}
      className="absolute -top-1.5 h-4.5 w-4.5 -translate-x-1/2 rounded-full border-2 border-brand-600 bg-white shadow-[var(--shadow-sm)] cursor-grab active:cursor-grabbing"
      style={{ left: `${position}%`, width: 18, height: 18 }}
    />
  );
}
