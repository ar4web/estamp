import { describe, expect, it } from "vitest";
import { hasArabic, isRTL, shapeArabicClusters, toVisualClusters } from "../arabic";

const cp = (n) => String.fromCodePoint(n);

describe("hasArabic / isRTL", () => {
  it("detects Arabic-range characters", () => {
    expect(hasArabic("مرحبا")).toBe(true);
    expect(hasArabic("hello")).toBe(false);
    expect(hasArabic("")).toBe(false);
    expect(hasArabic(null)).toBe(false);
  });
  it("detects RTL scripts beyond Arabic", () => {
    expect(isRTL("שלום")).toBe(true);
    expect(isRTL("مرحبا")).toBe(true);
    expect(isRTL("latin")).toBe(false);
  });
});

describe("toVisualClusters", () => {
  it("passes non-Arabic text through as plain graphemes", () => {
    expect(toVisualClusters("abc")).toEqual(["a", "b", "c"]);
    expect(toVisualClusters("")).toEqual([]);
  });
});

describe("shapeArabicClusters", () => {
  it("joins two joining consonants (initial then final, reversed for display)", () => {
    // Logical ب ب → visual left-to-right: final form, then initial form.
    expect(shapeArabicClusters("بب")).toEqual([cp(0xfe90), cp(0xfe91)]);
  });

  it("folds lam + alef into a mandatory ligature", () => {
    // لا → single FEFB (isolated lam-alef)
    expect(shapeArabicClusters("لا")).toEqual([cp(0xfefb)]);
    // بلا → ligature in final form joined to the preceding beh
    expect(shapeArabicClusters("بلا")).toEqual([cp(0xfefc), cp(0xfe91)]);
  });

  it("keeps non-joining letters from joining the next glyph", () => {
    // ا ر — alef never joins forward, so both stay isolated; display order is reversed.
    expect(shapeArabicClusters("ار")).toEqual([cp(0xfead), cp(0xfe8d)]);
  });

  it("attaches tashkeel marks to their base letter", () => {
    // بَ = beh + fatha → one cluster containing both code points
    const clusters = shapeArabicClusters("بَ");
    expect(clusters).toHaveLength(1);
    expect(clusters[0]).toContain(cp(0xfe8f)); // isolated beh
    expect(clusters[0]).toContain(cp(0x064e)); // fatha
  });

  it("produces one drawable cluster per letter otherwise", () => {
    const clusters = shapeArabicClusters("سلم");
    expect(clusters).toHaveLength(3);
  });
});
