import { C, INK, F, ring, arc, txt, star } from "./shared.js";

const ink = INK.blue;

export default {
  id: "singleRing",
  name: "Single Ring",
  cat: "Round",
  order: 1,
  tags: ["round", "single ring"],
  build: () => [
    ring(248, 10, ink, "Ring"),
    arc("COMPANY NAME", 196, "top", 36, F.stamp, ink, { letterSpacing: 3, name: "Top arc" }),
    arc("EST. 2024", 196, "bottom", 24, F.stamp, ink, { letterSpacing: 6, name: "Bottom arc" }),
    star(C - 156, C, 12, 5, ink, "Star left"),
    star(C + 156, C, 12, 5, ink, "Star right"),
    txt("APPROVED", 46, F.stamp, ink, C, { charSpacing: 50, w: 340, name: "Centre" }),
  ],
};
