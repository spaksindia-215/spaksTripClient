import "server-only";

// Shared secret sent on every call to Express's /api/internal/* router
// (agent-config, record-booking, record-customer-booking). Server-only (used
// inside Next.js middleware/route handlers on the nodejs/edge runtime — this
// is NOT NEXT_PUBLIC and never reaches the browser bundle).
//
// GRACEFUL DEGRADATION: if INTERNAL_API_SECRET is unset the header is simply
// omitted — the Express-side gate (server/src/middleware/internalAuth.ts) is
// then a no-op too, so behavior is unchanged from before this existed. Set
// the SAME INTERNAL_API_SECRET on this app and the Express server to close
// the /api/internal enumeration/abuse gap.
const SECRET = process.env.INTERNAL_API_SECRET ?? "";

/** Spread into a fetch `headers` object when calling /api/internal/*. */
export function internalApiHeaders(): Record<string, string> {
  return SECRET ? { "x-internal-secret": SECRET } : {};
}
