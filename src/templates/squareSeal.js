import { C, INK, F, box, txt, rule } from "./shared.js";

const ink = INK.blue;

export default {
  id: "squareSeal",
  name: "Square Seal",
  cat: "Square & Rect",
  order: 10,
  tags: ["square", "double border"],
  build: () => [
    box(440, 440, 9, ink, "Outer square", { rx: 0 }),
    box(404, 404, 2, ink, "Inner square", { rx: 0 }),
    txt("OFFICIAL", 40, F.stamp, ink, C - 108, { charSpacing: 100, w: 340, name: "Header" }),
    rule(C - 58, 130, ink, 2.5, "Rule top"),
    txt("SEAL", 76, F.classic, ink, C + 4, { fontWeight: "700", charSpacing: 80, w: 340, name: "Centre" }),
    rule(C + 72, 130, ink, 2.5, "Rule bottom"),
    txt("DOCUMENT CONTROL", 16, F.ui, ink, C + 116, {
      fontWeight: "600",
      charSpacing: 90,
      w: 340,
      name: "Footer",
    }),
  ],
};
