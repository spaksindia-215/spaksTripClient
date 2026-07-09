// Pure, dependency-free colour maths for the white-label theme system.
//
// An agent stores ONE input — `primaryColor` (hex). Everything the UI needs
// (a WCAG-safe foreground, a 50–900 tint/shade scale) is DERIVED from it here,
// on read, so there is never stale persisted theme data to migrate or reconcile.
//
// The scale is anchored so that index 600 == the agent's chosen colour, matching
// the platform's own convention (Button `primary` = brand-600). Apex defaults in
// globals.css map agent-primary-* onto brand-* so one component tree serves both
// apex and every tenant unchanged.

export type Rgb = { r: number; g: number; b: number };

export type ColorScale = {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
};

export type Theme = {
  /** The agent's base colour, normalised to lowercase #rrggbb. */
  primary: string;
  /** Readable text colour on top of `primary` (≥ 4.5:1). */
  primaryForeground: string;
  /** 50 (lightest) → 900 (darkest); 600 == `primary`. */
  scale: ColorScale;
};

const HEX_RE = /^#?([0-9a-fA-F]{6})$/;

/** Ink used as the dark-on-light foreground — matches --ink in globals.css. */
export const INK = "#0e1e3a";
export const WHITE = "#ffffff";

export function normalizeHex(hex: string): string | null {
  const m = HEX_RE.exec(hex.trim());
  if (!m) return null;
  return `#${m[1].toLowerCase()}`;
}

export function hexToRgb(hex: string): Rgb | null {
  const norm = normalizeHex(hex);
  if (!norm) return null;
  const int = parseInt(norm.slice(1), 16);
  return { r: (int >> 16) & 0xff, g: (int >> 8) & 0xff, b: int & 0xff };
}

export function rgbToHex({ r, g, b }: Rgb): string {
  const c = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");
  return `#${c(r)}${c(g)}${c(b)}`;
}

/** WCAG relative luminance (sRGB). */
export function relativeLuminance({ r, g, b }: Rgb): number {
  const chan = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * chan(r) + 0.7152 * chan(g) + 0.0722 * chan(b);
}

/** WCAG contrast ratio between two colours (1–21). */
export function contrastRatio(a: Rgb, b: Rgb): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const [hi, lo] = la >= lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

/**
 * Returns white or ink — whichever reads better on `hex` — always preferring the
 * one that clears the 4.5:1 AA threshold; if both/neither clear it, the higher
 * contrast wins. Falls back to ink for an unparseable input (fail safe/legible).
 */
export function readableForeground(hex: string): string {
  const bg = hexToRgb(hex);
  if (!bg) return INK;
  const white = hexToRgb(WHITE)!;
  const ink = hexToRgb(INK)!;
  const cWhite = contrastRatio(bg, white);
  const cInk = contrastRatio(bg, ink);

  const whiteAA = cWhite >= 4.5;
  const inkAA = cInk >= 4.5;
  if (whiteAA && !inkAA) return WHITE;
  if (inkAA && !whiteAA) return INK;
  return cWhite >= cInk ? WHITE : INK;
}

/** Linear mix of two colours in sRGB. weight 0 = a, 1 = b. */
function mix(a: Rgb, b: Rgb, weight: number): Rgb {
  return {
    r: a.r + (b.r - a.r) * weight,
    g: a.g + (b.g - a.g) * weight,
    b: a.b + (b.b - a.b) * weight,
  };
}

// Tint weight (toward white) or shade weight (toward black) for each step,
// anchored at 600 = base. Tuned to resemble the platform brand ramp.
const TINT: Record<number, number> = {
  50: 0.92,
  100: 0.84,
  200: 0.68,
  300: 0.48,
  400: 0.26,
  500: 0.12,
};
const SHADE: Record<number, number> = {
  700: 0.16,
  800: 0.3,
  900: 0.44,
};

export function colorScale(hex: string): ColorScale {
  const base = hexToRgb(hex) ?? hexToRgb("#185fa5")!;
  const white = hexToRgb(WHITE)!;
  const black = hexToRgb("#000000")!;
  const at = (k: number): string => {
    if (k === 600) return rgbToHex(base);
    if (TINT[k] !== undefined) return rgbToHex(mix(base, white, TINT[k]));
    return rgbToHex(mix(base, black, SHADE[k]));
  };
  return {
    50: at(50),
    100: at(100),
    200: at(200),
    300: at(300),
    400: at(400),
    500: at(500),
    600: at(600),
    700: at(700),
    800: at(800),
    900: at(900),
  };
}

/**
 * Nudges a colour to the nearest tone that can carry foreground text at AA
 * (≥ 4.5:1 with white or ink). Colours that already clear are returned unchanged;
 * the rest are darkened toward black in small steps — which monotonically raises
 * white contrast — until the pairing is legible. This is the standard white-label
 * accommodation: a settable brand colour must never yield an illegible button.
 */
export function accessiblePrimary(hex: string): string {
  const base = hexToRgb(hex);
  if (!base) return "#185fa5";
  const white = hexToRgb(WHITE)!;
  const ink = hexToRgb(INK)!;
  const black = hexToRgb("#000000")!;

  const clears = (c: Rgb) =>
    Math.max(contrastRatio(c, white), contrastRatio(c, ink)) >= 4.5;

  if (clears(base)) return rgbToHex(base);

  for (let w = 0.05; w <= 1; w += 0.05) {
    const candidate = mix(base, black, w);
    if (clears(candidate)) return rgbToHex(candidate);
  }
  return rgbToHex(black);
}

/**
 * Full derived theme for an agent's chosen primary colour. `primary` is the
 * accessible-adjusted fill (guaranteed legible with `primaryForeground`); the
 * scale and foreground are derived from it so every token pairing is AA-safe.
 */
export function buildTheme(primaryColor: string): Theme {
  const primary = accessiblePrimary(primaryColor);
  return {
    primary,
    primaryForeground: readableForeground(primary),
    scale: colorScale(primary),
  };
}
