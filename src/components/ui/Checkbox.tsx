"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label?: string;
  description?: string;
};

const Checkbox = forwardRef<HTMLInputElement, Props>(function Checkbox(
  { label, description, className, id, ...rest },
  ref,
) {
  return (
    <label
      htmlFor={id}
      className={cn(
        "group inline-flex items-start gap-2.5 cursor-pointer select-none",
        rest.disabled && "opacity-50 cursor-not-allowed",
        className,
      )}
    >
      <span className="relative mt-0.5 grid place-items-center">
        <input
          ref={ref}
          id={id}
          type="checkbox"
          className="peer h-4.5 w-4.5 appearance-none rounded border-2 border-border bg-white checked:bg-brand-600 checked:border-brand-600 focus:outline-none disabled:cursor-not-allowed transition-colors"
          style={{ width: 18, height: 18 }}
          {...rest}
        />
        <svg
          className="pointer-events-none absolute h-3 w-3 text-white opacity-0 peer-checked:opacity-100"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={3.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </span>
      {(label || description) && (
        <span className="flex flex-col">
          {label ? (
            <span className="text-[14px] font-medium text-ink group-hover:text-brand-700">
              {label}
            </span>
          ) : null}
          {description ? (
            <span className="text-[12px] text-ink-muted">{description}</span>
          ) : null}
        </span>
      )}
    </label>
  );
});

export default Checkbox;
