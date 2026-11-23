import { describe, expect, it } from "vitest";
import {
  cmykSafeHex,
  cmykToRgb,
  inchToMm,
  mmToPx,
  parseHex,
  printPixels,
  rgbToCmyk,
  slugName,
} from "../print";

describe("unit conversion", () => {
  it("converts mm to pixels at a given dpi", () => {
    expect(mmToPx(25.4, 300)).toBeCloseTo(300, 5);
    expect(mmToPx(0, 300)).toBe(0);
  });
  it("converts inches to mm", () => {
    expect(inchToMm(1)).toBeCloseTo(25.4, 5);
  });
  it("computes art + bleed pixel sizes", () => {
    const p = printPixels(25.4, 300, 2.54); // 1in art, 0.1in bleed per side
    expect(p.art).toBe(300);
    expect(p.bleed).toBe(30);
    expect(p.total).toBe(360);
  });
});

describe("slugName", () => {
  it("slugifies and appends an extension", () => {
    expect(slugName("Hello World!", "png")).toBe("Hello-World.png");
    expect(slugName("  ACME   Co., Ltd.  ", "svg")).toBe("ACME-Co-Ltd.svg");
  });
  it("falls back to 'stamp' for empty or non-latin names", () => {
    expect(slugName("")).toBe("stamp");
    expect(slugName("الرياض", "png")).toBe("stamp.png");
  });
  it("collapses dashes and trims edge dashes", () => {
    expect(slugName("--a---b--")).toBe("a-b");
  });
  it("caps the base name at 48 characters", () => {
    expect(slugName("x".repeat(200)).length).toBeLessThanOrEqual(48);
  });
});

describe("parseHex", () => {
  it("parses 6-digit hex colors", () => {
    expect(parseHex("#003399")).toEqual({ r: 0, g: 51, b: 153 });
    expect(parseHex("#FFFFFF")).toEqual({ r: 255, g: 255, b: 255 });
  });
  it("rejects non-hex input", () => {
    expect(parseHex("red")).toBeNull();
    expect(parseHex("#12345")).toBeNull();
    expect(parseHex("")).toBeNull();
    expect(parseHex(null)).toBeNull();
  });
});

describe("CMYK math", () => {
  it("maps white to zero ink", () => {
    expect(rgbToCmyk(255, 255, 255)).toEqual({ c: 0, m: 0, y: 0, k: 0 });
  });
  it("maps black to pure K", () => {
    const { c, m, y, k } = rgbToCmyk(0, 0, 0);
    expect(k).toBe(1);
    expect(c).toBe(0);
    expect(m).toBe(0);
    expect(y).toBe(0);
  });
  it("round-trips saturated colors approximately", () => {
    const { r, g, b } = (() => {
      const c = rgbToCmyk(0, 51, 153);
      return cmykToRgb(c.c, c.m, c.y, c.k);
    })();
    expect(Math.round(r * 255)).toBeCloseTo(0, 0);
    expect(Math.round(g * 255)).toBeCloseTo(51, 0);
    expect(Math.round(b * 255)).toBeCloseTo(153, 0);
  });
  it("cmykSafeHex returns a clamped 6-digit hex string", () => {
    const out = cmykSafeHex("#003399");
    expect(out).toMatch(/^#[0-9a-f]{6}$/i);
    // and leaves unparseable input untouched
    expect(cmykSafeHex("not-a-color")).toBe("not-a-color");
  });
});
