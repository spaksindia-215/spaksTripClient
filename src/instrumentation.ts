export async function register(): Promise<void> {
  // Validate env once per server bootstrap (nodejs runtime only — the edge
  // middleware keeps its fail-open fallbacks). Skipped during `next build`
  // prerendering so builds don't require runtime secrets.
  if (
    process.env.NEXT_RUNTIME === "nodejs" &&
    process.env.NEXT_PHASE !== "phase-production-build"
  ) {
    const { validateEnv } = await import("./lib/env");
    validateEnv();
  }
}
