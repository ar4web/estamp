import { describe, expect, it } from "vitest";
import { TEMPLATES, getTemplate } from "../index";

const KNOWN_TYPES = new Set([
  "circle",
  "ellipse",
  "rect",
  "triangle",
  "hexagon",
  "star",
  "polygon",
  "line",
  "path",
  "arc",
  "text",
]);

const specsOf = (tpl) => (typeof tpl.build === "function" ? tpl.build() : tpl.objects || []);

describe("template registry", () => {
  it("ships templates with unique ids", () => {
    expect(TEMPLATES.length).toBeGreaterThan(0);
    const ids = TEMPLATES.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every template declares a known category, a name and an order", () => {
    const cats = new Set(["Round", "Square & Rect", "Oval & Badge", "Logo", "Arabic"]);
    for (const t of TEMPLATES) {
      expect(cats.has(t.cat), `template ${t.id} has unexpected cat ${t.cat}`).toBe(true);
      expect(t.name, `template ${t.id} missing name`).toBeTruthy();
      expect(typeof t.order, `template ${t.id} missing order`).toBe("number");
    }
  });

  it("every template builds a non-empty spec list of known object types", () => {
    for (const t of TEMPLATES) {
      const specs = specsOf(t);
      expect(specs.length, `template ${t.id} built 0 objects`).toBeGreaterThan(0);
      for (const s of specs) {
        expect(KNOWN_TYPES.has(s.type), `template ${t.id} has unknown type ${s.type}`).toBe(true);
      }
    }
  });

  it("getTemplate falls back to the first template for unknown ids", () => {
    expect(getTemplate("does-not-exist")).toBe(TEMPLATES[0]);
    expect(getTemplate("classicRound").id).toBe("classicRound");
  });
});
