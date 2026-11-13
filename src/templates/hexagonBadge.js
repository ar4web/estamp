import { C, INK, F, txt, rule, star } from "./shared.js";

const ink = INK.blue;

export default {
  id: "hexagonBadge",
  name: "Hexagon Badge",
  tags: ["hexagon", "badge"],
  build: () => [
    { type: "hexagon", r: 246, rotation: -90, cx: C, cy: C, strokeWidth: 9, stroke: ink, name: "Outer hex" },
    { type: "hexagon", r: 224, rotation: -90, cx: C, cy: C, strokeWidth: 2, stroke: ink, name: "Inner hex" },
    star(C, C - 78, 42, 18, ink, "Icon", 6),
    txt("CERTIFIED", 40, F.black, ink, C + 16, { fontWeight: "400", charSpacing: 20, w: 320, name: "Title" }),
    rule(C + 54, 110, ink, 2.5, "Rule"),
    txt("QUALITY ASSURED", 16, F.ui, ink, C + 84, {
      fontWeight: "600",
      charSpacing: 80,
      w: 300,
      name: "Subtitle",
    }),
  ],
};
