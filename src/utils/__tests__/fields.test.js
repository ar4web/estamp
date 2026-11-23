import { describe, expect, it } from "vitest";
import {
  DATE_FORMATS,
  fieldText,
  formatSerial,
  formatStampDate,
  formatStampTime,
  refreshLiveFields,
} from "../fields";

const at = new Date(2026, 9, 24, 15, 30); // 24 Oct 2026, 15:30 local time

describe("formatStampDate", () => {
  it("formats DD MMM YYYY in upper case", () => {
    expect(formatStampDate("DD MMM YYYY", at)).toBe("24 OCT 2026");
  });
  it("formats DD/MM/YYYY with zero padding", () => {
    expect(formatStampDate("DD/MM/YYYY", new Date(2026, 0, 5))).toBe("05/01/2026");
  });
  it("formats ISO YYYY-MM-DD", () => {
    expect(formatStampDate("YYYY-MM-DD", at)).toBe("2026-10-24");
  });
  it("formats MMM DD, YYYY", () => {
    expect(formatStampDate("MMM DD, YYYY", at)).toBe("OCT 24, 2026");
  });
  it("falls back to the default format for unknown input", () => {
    expect(formatStampDate(undefined, at)).toBe("24 OCT 2026");
  });
  it("covers every advertised DATE_FORMAT label", () => {
    for (const f of DATE_FORMATS) {
      const out = formatStampDate(f.id, at);
      expect(typeof out).toBe("string");
      expect(out.length).toBeGreaterThan(4);
    }
  });
});

describe("formatSerial", () => {
  it("pads to the configured width with the prefix", () => {
    expect(formatSerial({ serialPrefix: "NO. ", serialValue: 7, serialPad: 4 })).toBe("NO. 0007");
  });
  it("enforces at least one digit of padding", () => {
    expect(formatSerial({ serialValue: 12, serialPad: -3 })).toBe("NO. 12");
  });
  it("handles non-numeric values without throwing", () => {
    expect(formatSerial({ serialValue: "42", serialPad: 2 })).toBe("NO. 42");
    expect(formatSerial({ serialValue: "abc" })).toBe("NO. 0001");
  });
});

describe("fieldText", () => {
  it("returns null for objects without a field", () => {
    expect(fieldText(null)).toBeNull();
    expect(fieldText({})).toBeNull();
    expect(fieldText({ field: "nope" })).toBeNull();
  });
  it("renders date / time / datetime / serial fields", () => {
    expect(fieldText({ field: "date", dateFormat: "YYYY-MM-DD" }, at)).toBe("2026-10-24");
    expect(fieldText({ field: "time" }, at)).toBe(formatStampTime(at));
    expect(fieldText({ field: "datetime", dateFormat: "YYYY-MM-DD" }, at)).toBe(
      `2026-10-24  ${formatStampTime(at)}`
    );
    expect(fieldText({ field: "serial", serialPrefix: "#", serialValue: 9, serialPad: 3 }, at)).toBe(
      "#009"
    );
  });
});

describe("refreshLiveFields", () => {
  const makeCanvas = (objects) => ({
    getObjects: () => objects,
    requestRenderAll() {},
  });

  it("rewrites live date text and reports a change", () => {
    const obj = {
      type: "textbox",
      text: "OLD",
      stampMeta: { field: "date", dateFormat: "YYYY-MM-DD" },
      set(patch) {
        Object.assign(this, patch);
      },
      setCoords() {},
    };
    const changed = refreshLiveFields(makeCanvas([obj]));
    expect(changed).toBe(true);
    expect(obj.text).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("returns false when nothing needs updating", () => {
    expect(refreshLiveFields(makeCanvas([]))).toBe(false);
    expect(refreshLiveFields(null)).toBe(false);
  });

  it("bumps serial values only when asked", () => {
    const obj = {
      type: "textbox",
      text: "",
      stampMeta: { field: "serial", serialPrefix: "NO. ", serialValue: 41, serialPad: 4 },
      set(patch) {
        Object.assign(this, patch);
      },
      setCoords() {},
    };
    refreshLiveFields(makeCanvas([obj]));
    expect(obj.stampMeta.serialValue).toBe(41);
    refreshLiveFields(makeCanvas([obj]), { bumpSerial: true });
    expect(obj.stampMeta.serialValue).toBe(42);
    expect(obj.text).toBe("NO. 0042");
  });

  it("leaves non-field objects alone", () => {
    const obj = { type: "textbox", text: "KEEP", stampMeta: {}, set() {} };
    expect(refreshLiveFields(makeCanvas([obj]))).toBe(false);
    expect(obj.text).toBe("KEEP");
  });
});
