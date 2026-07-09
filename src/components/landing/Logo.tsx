"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";
import { useAgentBranding } from "@/lib/agentBranding";

type LogoProps = {
  variant?: "header" | "footer";
  className?: string;
};

const LOGO_STYLES = {
  header: {
    link: "shrink-0",
    frame:
      "flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-transparent p-1.5 shadow-sm ",
    image: "h-full w-full object-contain",
  },
  footer: {
    link: "shrink-0",
    frame:
      "flex h-24 w-24 items-center justify-center overflow-hidden rounded-[28px] bg-transparent p-2 shadow-[0_px_40px_-24px_rgba(15,23,42,0.45)] ring-1 ring-slate-200/80",
    image: "h-full w-full object-contain",
  },
} as const;

export default function Logo({ variant = "footer", className }: LogoProps) {
  const styles = LOGO_STYLES[variant];
  const { companyName, logo, logoDark } = useAgentBranding();

  // On an agent subdomain, show the agent's logo + name; on apex, the platform's.
  const isAgent = Boolean(companyName || logo);
  const src = (variant === "footer" ? logoDark ?? logo : logo) ?? "/logo.png";
  const alt = isAgent ? `${companyName ?? "Agency"} logo` : "Spakstrip logo";
  const label = isAgent ? `${companyName ?? "Agency"} home` : "Spakstrip home";

  return (
    <Link href="/" aria-label={label} className={cn(styles.link, className)}>
      <div className={styles.frame}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className={styles.image} />
      </div>
    </Link>
  );
}
