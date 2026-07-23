import { z } from "zod";

// Startup env validation for the Next.js app — invoked once from
// src/instrumentation.ts when the server boots (dev and production start).
// Fails fast with an error naming every missing/malformed var.
//
// Scope: only vars whose absence/corruption breaks the app in ways that are
// expensive to discover at request time. Rendering-path fallbacks in
// middleware.ts stay (branding must fail open); this guard exists so a
// misconfigured deploy dies at boot instead of mispricing or misrouting.
// Full var documentation: client/.env.example.

/** Origin-only URL — rejects the historical `http://host/health` misconfig. */
const originUrl = (name: string) =>
  z
    .string()
    .min(1, `${name} is required`)
    .refine((v) => {
      try {
        const u = new URL(v);
        return (u.protocol === "http:" || u.protocol === "https:") && u.pathname === "/" && !v.endsWith("/");
      } catch {
        return false;
      }
    }, `${name} must be an origin like http://localhost:4000 — no path, no trailing slash`);

const schema = z.object({
  NEXT_PUBLIC_API_BASE: originUrl("NEXT_PUBLIC_API_BASE"),
  NEXT_PUBLIC_APEX_DOMAIN: z
    .string()
    .min(1, "NEXT_PUBLIC_APEX_DOMAIN is required (e.g. localhost or elitesyatra.com)"),
  NEXT_PUBLIC_API_MODE: z.enum(["mock", "tbo"]).default("mock"),
  MONGO_URI: z.string().optional(),
  MONGODB_URI: z.string().optional(),
  TBO_AIR_USERNAME: z.string().optional(),
});

export function validateEnv(): void {
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    const details = parsed.error.issues
      .map((i) => `  - ${i.path.join(".") || "(env)"}: ${i.message}`)
      .join("\n");
    throw new Error(`Invalid environment configuration:\n${details}`);
  }

  // Live-TBO mode additionally needs credentials and booking persistence.
  if (parsed.data.NEXT_PUBLIC_API_MODE === "tbo") {
    const missing: string[] = [];
    if (!parsed.data.TBO_AIR_USERNAME) missing.push("TBO_AIR_USERNAME");
    if (!parsed.data.MONGO_URI && !parsed.data.MONGODB_URI) {
      missing.push("MONGO_URI (or legacy alias MONGODB_URI)");
    }
    if (missing.length > 0) {
      throw new Error(
        `Invalid environment configuration (NEXT_PUBLIC_API_MODE=tbo):\n${missing
          .map((m) => `  - ${m}: required in tbo mode`)
          .join("\n")}`,
      );
    }
  }
}
