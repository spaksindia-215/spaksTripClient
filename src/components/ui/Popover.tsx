"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/cn";

type Props = {
  trigger: (args: { open: boolean; toggle: () => void; ref: React.RefObject<HTMLButtonElement | null> }) => ReactNode;
  children: (args: { close: () => void }) => ReactNode;
  placement?: "bottom-start" | "bottom-end" | "bottom-center";
  className?: string;
  panelClassName?: string;
  offset?: number;
};

export default function Popover({
  trigger,
  children,
  placement = "bottom-start",
  className,
  panelClassName,
  offset = 8,
}: Props) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const id = useId();

  const toggle = () => setOpen((v) => !v);
  const close = () => setOpen(false);

  const computeCoords = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return null;
    const r = el.getBoundingClientRect();
    let left: number;
    if (placement === "bottom-end") {
      left = r.right - (panelRef.current?.offsetWidth ?? 240);
    } else if (placement === "bottom-center") {
      left = r.left + r.width / 2 - (panelRef.current?.offsetWidth ?? 240) / 2;
    } else {
      left = r.left;
    }
    // Keep panel on-screen.
    const panelW = panelRef.current?.offsetWidth ?? 240;
    left = Math.max(8, Math.min(left, window.innerWidth - panelW - 8));
    return { top: r.bottom + offset, left };
  }, [placement, offset]);

  useEffect(() => {
    if (!open) return;
    // Recompute after panel renders so offsetWidth is available.
    const frame = requestAnimationFrame(() => setCoords(computeCoords()));

    const onOutside = (e: MouseEvent) => {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t) || panelRef.current?.contains(t)) return;
      close();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    const onDismiss = () => close();

    document.addEventListener("mousedown", onOutside);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onDismiss, { capture: true, passive: true });
    window.addEventListener("resize", onDismiss, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("mousedown", onOutside);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onDismiss, { capture: true });
      window.removeEventListener("resize", onDismiss);
    };
  }, [open, computeCoords]);

  return (
    <div className={cn("relative", className)}>
      {trigger({ open, toggle, ref: triggerRef })}
      {open && createPortal(
        <div
          ref={panelRef}
          id={id}
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            top: coords?.top ?? -9999,
            left: coords?.left ?? -9999,
            zIndex: 9999,
          }}
          className={cn(
            "min-w-[220px] rounded-lg bg-white shadow-[var(--shadow-pop)] border border-border-soft animate-pop-in",
            panelClassName,
          )}
        >
          {children({ close })}
        </div>,
        document.body
      )}
    </div>
  );
}
