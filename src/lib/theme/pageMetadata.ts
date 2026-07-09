import "server-only";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { readAgentTheme } from "./readAgentTheme";

// Next merges metadata per-FIELD across segments: whichever segment (root
// layout vs. a page) defines a field wins for that field — it does not fall
// back automatically. Any route that exports its own static `metadata` (title,
// description, openGraph) therefore silently overrides the root layout's
// agent-branded title/OG on a subdomain, even though favicon/theme CSS vars
// (set only in the layout) are unaffected.
//
// Routes that care about being on-brand on a subdomain should wrap their own
// metadata with this helper instead of exporting a static `metadata` const:
//
//   export async function generateMetadata(): Promise<Metadata> {
//     return buildAgentAwareMetadata(generateBaseMetadata());
//   }
export async function buildAgentAwareMetadata(base: Metadata): Promise<Metadata> {
  const h = await headers();
  const { branding } = readAgentTheme(h.get("x-agent-theme"));
  if (!branding.companyName) return base;

  const title = `${branding.companyName} — Flights, Hotels & More`;
  const description = branding.tagline ?? base.description ?? undefined;
  const favicon = branding.favicon ?? branding.logo ?? undefined;
  const baseOg = typeof base.openGraph === "object" && base.openGraph ? base.openGraph : {};

  return {
    ...base,
    title,
    description,
    ...(favicon ? { icons: { icon: favicon } } : {}),
    openGraph: {
      ...baseOg,
      title,
      description,
      siteName: branding.companyName,
      ...(branding.logo ? { images: [{ url: branding.logo }] } : {}),
    },
  };
}
