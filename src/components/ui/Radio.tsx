"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label?: string;
};

const Radio = forwardRef<HTMLInputElement, Props>(function Radio(
  { label, className, id, ...rest },
  ref,
) {
  return (
    <label
      htmlFor={id}
      className={cn("inline-flex items-center gap-2 cursor-pointer select-none", className)}
    >
      <span className="relative grid place-items-center">
        <input
          ref={ref}
          id={id}
          type="radio"
          className="peer appearance-none rounded-full border-2 border-border bg-white checked:border-brand-600 transition-colors"
          style={{ width: 18, height: 18 }}
          {...rest}
        />
        <span className="pointer-events-none absolute h-2.5 w-2.5 rounded-full bg-brand-600 scale-0 peer-checked:scale-100 transition-transform" />
      </span>
      {label ? (
        <span className="text-[14px] font-medium text-ink">{label}</span>
      ) : null}
    </label>
  );
});

export default Radio;
