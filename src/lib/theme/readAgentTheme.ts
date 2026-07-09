import "server-only";
import type { AgentBranding } from "@/lib/agentBranding";

// Decodes the base64 x-agent-theme header set by middleware.ts into the branding
// object the layout renders from. Fail-open: any decode error yields all-null
// branding so the apex/unbranded page still renders (never a 500).

export interface DecodedAgentTheme {
  branding: AgentBranding;
}

const NULL_BRANDING: AgentBranding = {
  agentId: null,
  slug: null,
  companyName: null,
  tagline: null,
  primaryColor: null,
  logo: null,
  logoDark: null,
  favicon: null,
  fontKey: null,
  contactEmail: null,
  contactPhone: null,
};

export function readAgentTheme(headerValue: string | null): DecodedAgentTheme {
  if (!headerValue) return { branding: { ...NULL_BRANDING } };
  try {
    const json = decodeURIComponent(atob(headerValue));
    const parsed = JSON.parse(json) as {
      id?: string;
      slug?: string;
      branding?: Record<string, unknown>;
    };
    const b = parsed.branding ?? {};
    const str = (v: unknown): string | null =>
      typeof v === "string" && v.length > 0 ? v : null;
    return {
      branding: {
        agentId: str(parsed.id),
        slug: str(parsed.slug),
        companyName: str(b.companyName),
        tagline: str(b.tagline),
        primaryColor: str(b.primaryColor),
        logo: str(b.logo),
        logoDark: str(b.logoDark),
        favicon: str(b.favicon),
        fontKey: str(b.fontKey),
        contactEmail: str(b.contactEmail),
        contactPhone: str(b.contactPhone),
      },
    };
  } catch {
    return { branding: { ...NULL_BRANDING } };
  }
}
