"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { cn } from "@/lib/cn";

type Tone = "info" | "success" | "warn" | "danger";
type Toast = { id: number; title: string; description?: string; tone: Tone };

type Ctx = {
  push: (t: Omit<Toast, "id">) => void;
};

const ToastCtx = createContext<Ctx | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);

  const push = useCallback((t: Omit<Toast, "id">) => {
    const id = Date.now() + Math.random();
    setItems((prev) => [...prev, { ...t, id }]);
    setTimeout(() => setItems((prev) => prev.filter((x) => x.id !== id)), 4200);
  }, []);

  return (
    <ToastCtx.Provider value={{ push }}>
      {children}
      <div className="pointer-events-none fixed top-4 right-4 z-[200] flex flex-col gap-2 w-[340px] max-w-[92vw]">
        {items.map((t) => (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto rounded-md bg-white border shadow-[var(--shadow-md)] p-3 animate-pop-in",
              t.tone === "success" && "border-l-4 border-success-500",
              t.tone === "warn" && "border-l-4 border-warn-500",
              t.tone === "danger" && "border-l-4 border-danger-500",
              t.tone === "info" && "border-l-4 border-info-500",
            )}
          >
            <div className="text-[14px] font-semibold text-ink">{t.title}</div>
            {t.description ? (
              <div className="text-[13px] text-ink-muted mt-0.5">{t.description}</div>
            ) : null}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast requires ToastProvider");
  return ctx;
}
