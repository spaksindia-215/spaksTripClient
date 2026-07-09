// Pricing module — synced copy of server/src/lib/markupEngine.ts.
//
// client/ and server/ deploy as SEPARATE repositories (Hostinger builds this
// app from a standalone "spaksTripClient" repo that does not contain server/
// at all) — a cross-repo relative import (../../../server/src/lib/...) only
// ever worked in the monorepo dev checkout and broke production builds. This
// file is a physical duplicate, not an import, so client/ is self-contained.
//
// SOURCE OF TRUTH IS server/src/lib/markupEngine.ts. Never hand-edit this
// file directly: edit the server copy, then run `npm run sync:markup-engine`
// (from server/) to regenerate this one, and commit both in the same change.
// `npm run guard:markup-sync` (server/) fails CI if the two ever drift apart.
//

export type MarkupType = "percent" | "flat";

export interface MarkupRule {
  type: MarkupType;
  value: number;
  cap?: number;
}

export interface TwoTierPricing {
  tboFare:        number; // TBO raw fare — never sent to any browser
  platformMarkup: number; // platform cut (₹) — never shown to agent
  agentNetRate:   number; // tboFare + platformMarkup — agent's "base price"
  agentMarkup:    number; // agent's cut (₹) — not shown to customer
  customerPaid:   number; // agentNetRate + agentMarkup — only this reaches browser
}

export function applyTwoTierMarkup(
  tboFare:      number,
  platformRule: MarkupRule,
  agentRule:    MarkupRule,
): TwoTierPricing {
  const agentNetRate = applyMarkup(tboFare, platformRule);
  const customerPaid = applyMarkup(agentNetRate, agentRule);
  return {
    tboFare,
    platformMarkup: agentNetRate - tboFare,
    agentNetRate,
    agentMarkup:    customerPaid - agentNetRate,
    customerPaid,
  };
}

/** Layer 1 only — used when an agent browses their own portal. */
export function applyPlatformMarkup(
  tboFare:      number,
  platformRule: MarkupRule,
): number {
  return applyMarkup(tboFare, platformRule);
}

/**
 * Applies an agent's markup rule to a net fare.
 * Returns the marked-up price the client sees.
 * Net fares must never be forwarded to the client after this call.
 *
 * applyMarkup(4500, {type:'percent',value:2})        === 4590
 * applyMarkup(4500, {type:'flat',value:50})           === 4550
 * applyMarkup(4500, {type:'percent',value:2,cap:50})  === 4550  (cap enforced)
 */
export function applyMarkup(netFare: number, rule: MarkupRule): number {
  const raw =
    rule.type === "percent"
      ? Math.round(netFare * (1 + rule.value / 100))
      : netFare + rule.value;

  if (rule.cap != null && rule.cap > 0) {
    return Math.min(raw, netFare + rule.cap);
  }
  return raw;
}

/** The markup amount in ₹ added on top of the net fare. */
export function markupAmount(netFare: number, markedFare: number): number {
  return markedFare - netFare;
}

/**
 * Thrown by an adapter (tboMarkup.ts / agentMarkup.ts) when a subdomain
 * request's agent markup genuinely could not be resolved (cache + DB both
 * failed, or an agent confirmed active moments ago by the routing layer has
 * vanished from this lookup) — as opposed to "agent found, no markup
 * configured for this product" (a valid, legitimate `null`).
 *
 * Callers on a final-price-quote path (fare-quote, hotel detail) MUST NOT
 * catch this and silently fall back to the raw fare — that undercharges the
 * customer relative to what the agent configured (fail CLOSED: surface an
 * explicit error). Search/listing paths may explicitly catch it and fail
 * OPEN, since no price has been quoted yet. Defined once here (not per
 * adapter) so `instanceof` checks work regardless of which adapter threw it.
 */
export class AgentPricingUnavailableError extends Error {
  constructor(slug: string, cause?: unknown) {
    super(`Agent pricing unavailable for slug "${slug}"`);
    this.name = "AgentPricingUnavailableError";
    if (cause !== undefined) this.cause = cause;
  }
}
