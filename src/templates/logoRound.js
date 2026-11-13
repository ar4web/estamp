import { C, INK, F, ring, arc, txt, rule } from "./shared.js";

const ink = INK.blue;

export default {
  id: "logoRound",
  name: "Logo Round",
  tags: ["logo", "round", "arc"],
  logo: true,
  build: () => [
    ring(250, 7, ink, "Outer ring"),
    ring(230, 2, ink, "Inner ring"),
    {
      type: "circle",
      r: 88,
      cx: C,
      cy: C - 28,
      strokeWidth: 2,
      stroke: ink,
      strokeDashArray: [8, 6],
      name: "Logo area",
    },
    txt("LOGO", 20, F.ui, ink, C - 28, { fontWeight: "600", charSpacing: 120, w: 160, name: "Logo label" }),
    arc("YOUR BRAND HERE", 202, "bottom", 26, F.stamp, ink, { letterSpacing: 4, name: "Brand arc" }),
    rule(C + 82, 100, ink, 2.5, "Rule"),
  ],
};
