import { C, INK, F, box, txt } from "./shared.js";

const ink = INK.navy;

export default {
  id: "logoBadge",
  name: "Logo Badge",
  tags: ["logo", "rect", "brand"],
  logo: true,
  build: () => [
    box(500, 240, 8, ink, "Outer", { rx: 0 }),
    box(472, 212, 1.5, ink, "Inner", { rx: 0 }),
    {
      type: "rect",
      w: 112,
      h: 112,
      cx: C - 150,
      cy: C,
      strokeWidth: 2,
      stroke: ink,
      strokeDashArray: [8, 6],
      name: "Logo area",
    },
    txt("LOGO", 16, F.ui, ink, C, {
      fontWeight: "600",
      charSpacing: 80,
      cx: C - 150,
      w: 110,
      name: "Logo label",
    }),
    txt("BRAND NAME", 30, F.display, ink, C - 40, {
      charSpacing: 20,
      cx: C + 86,
      w: 260,
      name: "Brand",
    }),
    {
      type: "line",
      x1: C - 48,
      y1: C - 6,
      x2: C + 220,
      y2: C - 6,
      stroke: ink,
      strokeWidth: 2,
      name: "Rule",
    },
    txt("QUALITY CERTIFIED", 15, F.ui, ink, C + 24, {
      fontWeight: "600",
      charSpacing: 50,
      cx: C + 86,
      w: 260,
      name: "Tagline",
    }),
    txt("EST. 2024", 14, F.mono, ink, C + 56, {
      fontWeight: "400",
      charSpacing: 0,
      cx: C + 86,
      w: 260,
      name: "Year",
    }),
  ],
};
