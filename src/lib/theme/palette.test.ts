import { test } from "node:test";
import assert from "node:assert/strict";
import {
  buildTheme,
  colorScale,
  contrastRatio,
  hexToRgb,
  normalizeHex,
  readableForeground,
  relativeLuminance,
} from "./palette";

// A representative matrix spanning light, dark, saturated and muted hues.
const SAMPLE_HEXES = [
  "#185fa5", // platform blue
  "#b45309", // amber (demo b2b)
  "#000000", // black
  "#ffffff", // white
  "#ff0000", // red
  "#00ff00", // green (bright — forces ink fg)
  "#7c3aed", // violet
  "#f59e0b", // orange
  "#0ea5e9", // sky
  "#facc15", // yellow (very light — forces ink fg)
];

test("buildTheme guarantees >= 4.5:1 foreground on the primary for the sample matrix", () => {
  for (const hex of SAMPLE_HEXES) {
    const { primary, primaryForeground } = buildTheme(hex);
    const ratio = contrastRatio(hexToRgb(primary)!, hexToRgb(primaryForeground)!);
    assert.ok(
      ratio >= 4.5,
      `${hex} → primary ${primary} / fg ${primaryForeground} only ${ratio.toFixed(2)}:1 (need >= 4.5:1)`,
    );
  }
});

test("accessiblePrimary leaves already-legible colours unchanged, fixes the rest", () => {
  // Platform blue already clears against white → unchanged.
  assert.equal(buildTheme("#185fa5").primary, "#185fa5");
  // Pure red fails AA on both → darkened until legible.
  const red = buildTheme("#ff0000");
  assert.notEqual(red.primary, "#ff0000");
  const ratio = contrastRatio(hexToRgb(red.primary)!, hexToRgb(red.primaryForeground)!);
  assert.ok(ratio >= 4.5, `adjusted red only ${ratio.toFixed(2)}:1`);
});

test("readableForeground picks the higher-contrast option", () => {
  // Light yellow → dark ink; dark navy → white.
  assert.equal(readableForeground("#facc15"), "#0e1e3a");
  assert.equal(readableForeground("#0e1e3a"), "#ffffff");
});

test("normalizeHex accepts with/without hash and lowercases; rejects junk", () => {
  assert.equal(normalizeHex("#185FA5"), "#185fa5");
  assert.equal(normalizeHex("185FA5"), "#185fa5");
  assert.equal(normalizeHex("  #ABCDEF "), "#abcdef");
  assert.equal(normalizeHex("#12345"), null);
  assert.equal(normalizeHex("nope"), null);
});

test("colorScale anchors 600 at the base colour", () => {
  assert.equal(colorScale("#185fa5")[600], "#185fa5");
  assert.equal(colorScale("#B45309")[600], "#b45309");
});

test("colorScale is monotonically darker from 50 to 900", () => {
  const scale = colorScale("#185fa5");
  const keys = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] as const;
  let prev = Infinity;
  for (const k of keys) {
    const lum = relativeLuminance(hexToRgb(scale[k])!);
    assert.ok(lum <= prev + 1e-9, `step ${k} (${scale[k]}) not darker than previous`);
    prev = lum;
  }
});

test("buildTheme falls back to platform blue for invalid input (fail safe)", () => {
  const theme = buildTheme("garbage");
  assert.equal(theme.primary, "#185fa5");
  assert.equal(theme.scale[600], "#185fa5");
  assert.ok(theme.primaryForeground === "#ffffff" || theme.primaryForeground === "#0e1e3a");
});

test("buildTheme returns a complete, self-consistent theme", () => {
  const theme = buildTheme("#B45309");
  assert.equal(theme.primary, "#b45309");
  assert.equal(theme.scale[600], "#b45309");
  const ratio = contrastRatio(hexToRgb(theme.primary)!, hexToRgb(theme.primaryForeground)!);
  assert.ok(ratio >= 4.5, `demo b2b fg only ${ratio.toFixed(2)}:1`);
});
