import { C, INK, F, ring, arc, txt, star } from "./shared.js";

const ink = INK.blue;

export default {
  id: "classicRound",
  name: "Double Ring",
  tags: ["round", "double border", "blue"],
  build: () => [
    ring(250, 8, ink, "Outer ring"),
    ring(228, 2.5, ink, "Inner ring"),
    arc("COMPANY NAME", 198, "top", 36, F.stamp, ink, { letterSpacing: 3, name: "Company arc" }),
    arc("EST. 2024", 198, "bottom", 22, F.stamp, ink, { letterSpacing: 6, name: "Established arc" }),
    txt("APPROVED", 50, F.stamp, ink, C - 8, { charSpacing: 50, w: 340, name: "Approved" }),
    {
      type: "line",
      x1: C - 138,
      y1: C + 40,
      x2: C - 20,
      y2: C + 40,
      stroke: ink,
      strokeWidth: 2.5,
      name: "Divider left",
    },
    star(C, C + 40, 12, 5, ink, "Divider star"),
    {
      type: "line",
      x1: C + 20,
      y1: C + 40,
      x2: C + 138,
      y2: C + 40,
      stroke: ink,
      strokeWidth: 2.5,
      name: "Divider right",
    },
    txt("QUALITY CHECKED", 16, F.ui, ink, C + 76, {
      fontWeight: "600",
      charSpacing: 140,
      w: 300,
      name: "Subtitle",
    }),
  ],
};
