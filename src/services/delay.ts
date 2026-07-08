// Simulated network latency so UIs exercise loading states realistically.
// Swap this module's implementation when wiring to a real backend.

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function jitter(baseMs: number, spreadMs = baseMs * 0.4): number {
  return baseMs + (Math.random() - 0.5) * spreadMs * 2;
}
