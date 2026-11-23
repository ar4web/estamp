import { describe, expect, it } from "vitest";
import { objectInkHex, toHexColor } from "../color";

describe("toHexColor", () => {
  it("accepts 6-digit hex and normalizes case", () => {
    expect(toHexColor("#003399")).toBe("#003399");
    expect(toHexColor("#AABBCC")).toBe("#aabbcc");
  });
  it("expands 3-digit hex", () => {
    expect(toHexColor("#abc")).toBe("#aabbcc");
  });
  it("parses rgb()/rgba() strings", () => {
    expect(toHexColor("rgb(0, 51, 153)")).toBe("#003399");
    expect(toHexColor("rgba(0,51,153,0.5)")).toBe("#003399");
  });
  it("rejects junk", () => {
    expect(toHexColor("blue")).toBeNull();
    expect(toHexColor("#12345")).toBeNull();
    expect(toHexColor(42)).toBeNull();
    expect(toHexColor("")).toBeNull();
  });
});

describe("objectInkHex", () => {
  it("prefers an explicit stampMeta.ink", () => {
    expect(objectInkHex({ stampMeta: { ink: "#8B0000" }, fill: "#003399" })).toBe("#8b0000");
  });
  it("uses stampMeta.fill for arc objects", () => {
    expect(objectInkHex({ stampMeta: { kind: "arc", fill: "#006400" } })).toBe("#006400");
  });
  it("falls back to fill, then stroke", () => {
    expect(objectInkHex({ stampMeta: {}, fill: "#112233" })).toBe("#112233");
    expect(objectInkHex({ stampMeta: {}, fill: "transparent", stroke: "#445566" })).toBe("#445566");
  });
  it("finds the ink of a group member", () => {
    const group = {
      type: "group",
      stampMeta: {},
      forEachObject(cb) {
        cb({ stampMeta: {}, fill: "transparent", stroke: "#778899" });
      },
    };
    expect(objectInkHex(group)).toBe("#778899");
  });
  it("returns null when nothing is resolvable", () => {
    expect(objectInkHex(null)).toBeNull();
    expect(objectInkHex({ stampMeta: {}, fill: "pattern" })).toBeNull();
  });
});
