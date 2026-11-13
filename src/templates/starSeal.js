import { C, INK, F, ring, arc, txt } from "./shared.js";

const ink = INK.blue;

export default {
  id: "starSeal",
  name: "Star Seal",
  tags: ["star", "arc"],
  build: () => [
    ring(254, 5, ink, "Outer ring"),
    {
      type: "star",
      outer: 176,
      inner: 74,
      points: 5,
      cx: C,
      cy: C + 4,
      strokeWidth: 6,
      stroke: ink,
      fill: "transparent",
      name: "Star outline",
    },
    arc("OFFICIAL SEAL", 218, "top", 28, F.stamp, ink, { letterSpacing: 6, name: "Top arc" }),
    arc("AUTHENTIC", 218, "bottom", 22, F.stamp, ink, { letterSpacing: 8, name: "Bottom arc" }),
    txt("2024", 34, F.classic, ink, C + 10, { fontWeight: "700", charSpacing: 20, w: 180, name: "Year" }),
  ],
};
