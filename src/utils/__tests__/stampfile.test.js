import { describe, expect, it } from "vitest";
import {
  MAX_STAMP_BYTES,
  STAMP_TYPE,
  STAMP_VERSION,
  buildStampFile,
  isStampFile,
  parseStampFile,
} from "../stampfile";

const payload = { objects: [{ type: "rect" }], bg: "#fff" };

describe("buildStampFile", () => {
  it("builds a versioned envelope", () => {
    const file = buildStampFile({ name: "Test", json: payload, ink: "#112233", canvasColor: "#fff" });
    expect(file.version).toBe(STAMP_VERSION);
    expect(file.type).toBe(STAMP_TYPE);
    expect(file.name).toBe("Test");
    expect(file.json).toEqual(payload);
  });
  it("falls back to defaults", () => {
    const file = buildStampFile({});
    expect(file.name).toBe("Untitled stamp");
    expect(file.ink).toBe("#003399");
  });
});

describe("parseStampFile", () => {
  it("round-trips a file built by buildStampFile", () => {
    const file = buildStampFile({ name: "Mine", json: payload });
    const parsed = parseStampFile(JSON.stringify(file));
    expect(parsed.name).toBe("Mine");
    expect(parsed.json).toEqual(payload);
  });

  it("accepts legacy stampcraft files", () => {
    const parsed = parseStampFile(JSON.stringify({ type: "stampcraft", json: payload }));
    expect(parsed.type).toBe("stampcraft");
  });

  it("rejects non-JSON input", () => {
    expect(() => parseStampFile("{nope")).toThrow("valid JSON");
  });

  it("rejects JSON that is not a stamp envelope", () => {
    expect(() => parseStampFile("{}")).toThrow("estamp");
    expect(() => parseStampFile(JSON.stringify({ type: "other", json: payload }))).toThrow("estamp");
    expect(() => parseStampFile(JSON.stringify({ type: STAMP_TYPE }))).toThrow("estamp");
  });

  it("rejects files from a newer format version", () => {
    const future = buildStampFile({ name: "x", json: payload });
    future.version = STAMP_VERSION + 1;
    expect(() => parseStampFile(JSON.stringify(future))).toThrow("version");
  });

  it("rejects envelopes whose canvas objects are not an array", () => {
    const bad = buildStampFile({ name: "x", json: { objects: "nope" } });
    expect(() => parseStampFile(JSON.stringify(bad))).toThrow("canvas objects");
  });

  it("rejects oversized payloads before parsing", () => {
    const big = `"${" ".repeat(MAX_STAMP_BYTES + 1)}"`;
    expect(() => parseStampFile(big)).toThrow("too large");
  });
});

describe("isStampFile", () => {
  it("matches .stamp names and json mime types", () => {
    expect(isStampFile({ name: "design.stamp", type: "" })).toBe(true);
    expect(isStampFile({ name: "design.STAMP", type: "" })).toBe(true);
    expect(isStampFile({ name: "design.json", type: "application/json" })).toBe(true);
    expect(isStampFile({ name: "logo.png", type: "image/png" })).toBe(false);
    expect(isStampFile(null)).toBe(false);
  });
});
