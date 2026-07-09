import "server-only";
import {
  applyMarkup,
  AgentPricingUnavailableError,
  type MarkupRule,
  type TwoTierPricing,
} from "../../../../server/src/lib/markupEngine";
import { internalApiHeaders } from "./internalApi";

export type { TwoTierPricing, MarkupRule };
export { AgentPricingUnavailableError };

// Pricing is intentionally single-tier:
//   spakstrip.com (apex)       → TBO fare unchanged (platform margin comes from TBO wholesale rate)
//   agent.spakstrip.com (sub)  → TBO fare + agent markup  (L2 only)
//
// There is no platform-level L1 surcharge applied at runtime.
// The superadmin Platform Markup config exists for future use but is NOT wired here.
//
// The arithmetic (applyMarkup, TwoTierPricing) is imported from the Express
// app's server/src/lib/markupEngine.ts — the single shared pricing module —
// rather than duplicated here. That file is pure (zero I/O, zero framework
// imports), so importing it from this Next.js runtime pulls in nothing beyond
// plain TypeScript. See that file's header comment for the full rationale.

type PricingProduct = "flights" | "hotels" | "taxi";

type AgentConfigResponse = {
  markup?: Partial<Record<PricingProduct, MarkupRule>>;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:4000";

/**
 * Fetches the agent's markup rule for a product from the Express cache.
 * Throws AgentPricingUnavailableError if the fetch itself fails (network
 * error, non-2xx, malformed body) — a subdomain request whose markup can't be
 * resolved is NOT the same as "resolved, no rule configured" (a valid null).
 */
async function getAgentMarkup(
  product: PricingProduct,
  slug: string,
): Promise<MarkupRule | null> {
  let res: Response;
  try {
    res = await fetch(
      new URL(`/api/internal/agent-config?slug=${encodeURIComponent(slug)}`, API_BASE),
      { cache: "no-store", headers: { accept: "application/json", ...internalApiHeaders() } },
    );
  } catch (err) {
    throw new AgentPricingUnavailableError(slug, err);
  }
  if (!res.ok) throw new AgentPricingUnavailableError(slug, new Error(`HTTP ${res.status}`));

  try {
    const payload = (await res.json()) as AgentConfigResponse;
    return payload.markup?.[product] ?? null;
  } catch (err) {
    throw new AgentPricingUnavailableError(slug, err);
  }
}

const passthrough = (fare: number): number => fare;

/**
 * Returns a synchronous pricer for the current request:
 *   - Subdomain (x-agent-slug present): TBO fare + agent markup
 *   - Apex / agent portal / anonymous:  TBO fare unchanged
 *
 * Throws AgentPricingUnavailableError if a subdomain's markup genuinely
 * cannot be resolved — the caller decides whether that's fatal (a final price
 * quote) or safe to catch-and-passthrough (a search/listing result).
 */
export async function buildFarePricer(
  product: PricingProduct,
  request: Request,
): Promise<(fare: number) => number> {
  const slug = request.headers.get("x-agent-slug")?.trim();
  if (!slug) return passthrough;

  const rule = await getAgentMarkup(product, slug);
  return rule ? (fare) => applyMarkup(fare, rule) : passthrough;
}

/**
 * Returns the full pricing breakdown for a subdomain booking record.
 * Returns null when not a subdomain request.
 * platformMarkup is always 0 — stored as 0 for settlement schema compatibility.
 * Throws AgentPricingUnavailableError under the same conditions as buildFarePricer.
 */
export async function buildTwoTierPricing(
  tboFare: number,
  product: PricingProduct,
  request: Request,
): Promise<TwoTierPricing | null> {
  const slug = request.headers.get("x-agent-slug")?.trim();
  if (!slug) return null;

  const rule = await getAgentMarkup(product, slug);
  const customerPaid = rule ? applyMarkup(tboFare, rule) : tboFare;

  return {
    tboFare,
    platformMarkup: 0,
    agentNetRate:   tboFare,
    agentMarkup:    customerPaid - tboFare,
    customerPaid,
  };
}

// Re-export types used by call-sites in agentClient and superadmin.
export type { MarkupRule as AgentMarkupRule };
