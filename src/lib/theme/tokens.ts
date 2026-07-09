import { buildTheme } from "./palette";

// Curated font choices. Web-safe stacks only — no external font loading, so no
// CSP or performance cost. Keep the keys in sync with BRAND_FONTS on the server
// (server/src/models/User.ts) and the FONT_STACKS comment in globals.css.
export const BRAND_FONTS = [
  "default",
  "classic-serif",
  "modern-sans",
  "geometric",
  "humanist",
] as const;
export type BrandFont = (typeof BRAND_FONTS)[number];

export const FONT_STACKS: Record<BrandFont, string> = {
  default: "var(--font-geist-sans), system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif",
  "classic-serif": "'Iowan Old Style', 'Palatino Linotype', Palatino, Georgia, 'Times New Roman', serif",
  "modern-sans": "'Helvetica Neue', Helvetica, Arial, system-ui, sans-serif",
  geometric: "'Century Gothic', 'Futura', 'Trebuchet MS', system-ui, sans-serif",
  humanist: "'Segoe UI', 'Optima', 'Gill Sans', system-ui, sans-serif",
};

function fontStack(fontKey?: string | null): string {
  if (fontKey && (BRAND_FONTS as readonly string[]).includes(fontKey)) {
    return FONT_STACKS[fontKey as BrandFont];
  }
  return FONT_STACKS.default;
}

/**
 * Builds the full inline CSS-var set for an agent theme, keyed to the tokens
 * declared in globals.css. Applied on `<html>` for a subdomain (or client-side
 * for the live preview). Apex passes no primaryColor → returns `undefined` so
 * the globals.css defaults (== platform brand) stand and apex is unchanged.
 */
export function buildThemeCssVars(
  primaryColor?: string | null,
  fontKey?: string | null,
): Record<string, string> | undefined {
  if (!primaryColor) return undefined;
  const theme = buildTheme(primaryColor);
  const s = theme.scale;
  return {
    "--agent-primary": theme.primary,
    "--agent-primary-fg": theme.primaryForeground,
    "--agent-primary-50": s[50],
    "--agent-primary-100": s[100],
    "--agent-primary-200": s[200],
    "--agent-primary-300": s[300],
    "--agent-primary-400": s[400],
    "--agent-primary-500": s[500],
    "--agent-primary-600": s[600],
    "--agent-primary-700": s[700],
    "--agent-primary-800": s[800],
    "--agent-primary-900": s[900],
    "--agent-font": fontStack(fontKey),
  };
}
