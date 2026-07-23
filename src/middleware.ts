import { type NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rateLimit";
import { internalApiHeaders } from "@/lib/server/internalApi";

// Configurable via env so staging domains work without a code change.
const APEX    = process.env.NEXT_PUBLIC_APEX_DOMAIN ?? "elitesyatra.com";
const API_BASE = process.env.NEXT_PUBLIC_API_BASE   ?? "http://localhost:4000";

interface AgentBrandingConfig {
  companyName?:  string;
  tagline?:      string;
  primaryColor?: string;
  logo?:         string;
  logoDark?:     string;
  favicon?:      string;
  fontKey?:      string;
  contactEmail?: string;
  contactPhone?: string;
}

interface AgentConfigResponse {
  _id:      string;
  slug:     string;
  status:   string;
  branding?: AgentBrandingConfig;
}

export async function middleware(req: NextRequest): Promise<NextResponse> {
  const { pathname } = req.nextUrl;

  // Rate-limit the API surface (best-effort, per-instance) before any other
  // work. Express enforces the authoritative limit for proxied traffic; this
  // covers routes that run inline in Next (hotel payments, bus search, etc.).
  if (pathname.startsWith("/api/")) {
    const limited = rateLimit(req, pathname);
    if (limited) return limited;
  }

  const host     = req.headers.get("host") ?? "";
  const hostname = host.split(":")[0].toLowerCase();

  // Apex domain, www, localhost, or any non-subdomain host → no-op
  if (
    hostname === APEX ||
    hostname === `www.${APEX}` ||
    !hostname.endsWith(`.${APEX}`)
  ) {
    return NextResponse.next();
  }

  const slug = hostname.slice(0, hostname.length - `.${APEX}`.length);
  if (!slug) return NextResponse.next();

  // Fetch agent config from Express internal route.
  // Express holds the in-memory cache, so repeated calls within 5 min are instant.
  let agent: AgentConfigResponse | null = null;
  try {
    const res = await fetch(
      `${API_BASE}/api/internal/agent-config?slug=${encodeURIComponent(slug)}`,
      { signal: AbortSignal.timeout(3000), headers: internalApiHeaders() },
    );
    if (res.ok) agent = (await res.json()) as AgentConfigResponse;
  } catch {
    // Express unreachable (cold start, deploy) — fail open so subdomain still loads.
    return NextResponse.next();
  }

  if (!agent) {
    // Slug not in DB → redirect browser to apex homepage
    const target = new URL("/", `https://${APEX}`);
    return NextResponse.redirect(target);
  }

  if (agent.status !== "active") {
    // Suspended agent → rewrite to /suspended (no browser redirect, no URL change)
    const url = req.nextUrl.clone();
    url.pathname = "/suspended";
    return NextResponse.rewrite(url);
  }

  // Forward agent identity as request headers so Server Components and API
  // route handlers can read them via next/headers or req.headers.
  // x-agent-slug / x-agent-id are consumed by the pricer (agentMarkup.ts); the
  // legacy scalar branding headers stay for back-compat. The full branding set
  // (incl. logoDark, favicon, fontKey, contact) travels as one base64-JSON
  // header so the layout can derive the theme without re-fetching.
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-agent-id",    agent._id);
  requestHeaders.set("x-agent-slug",  agent.slug);
  requestHeaders.set("x-agent-name",  agent.branding?.companyName  ?? agent.slug);
  requestHeaders.set("x-agent-color", agent.branding?.primaryColor ?? "#185FA5");
  requestHeaders.set("x-agent-logo",  agent.branding?.logo         ?? "");

  const themePayload = JSON.stringify({
    id:   agent._id,
    slug: agent.slug,
    branding: agent.branding ?? {},
  });
  // Edge-runtime safe base64 (no Buffer): encodeURIComponent first so any
  // non-Latin1 char (e.g. an accented company name) survives btoa. The layout
  // decodes with decodeURIComponent(atob(...)).
  requestHeaders.set("x-agent-theme", btoa(encodeURIComponent(themePayload)));

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico).*)"],
};
