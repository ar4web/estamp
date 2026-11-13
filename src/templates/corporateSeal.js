import { C, INK, F, ring, arc, txt, star } from "./shared.js";

const ink = INK.blue;

export default {
  id: "corporateSeal",
  name: "Triple Ring",
  cat: "Round",
  order: 3,
  tags: ["round", "triple ring", "seal"],
  build: () => [
    ring(252, 6, ink, "Outer ring"),
    ring(234, 2, ink, "Middle ring"),
    ring(162, 2, ink, "Inner ring"),
    arc("MERIDIAN HOLDINGS INC.", 196, "top", 26, F.stamp, ink, {
      letterSpacing: 2,
      name: "Company arc",
    }),
    arc("CORPORATE SEAL", 196, "bottom", 20, F.stamp, ink, {
      letterSpacing: 5,
      name: "Seal arc",
    }),
    star(C - 176, C, 11, 4.5, ink, "Star left"),
    star(C + 176, C, 11, 4.5, ink, "Star right"),
    star(C, C - 58, 28, 12, ink, "Centre star"),
    txt("REGISTERED", 26, F.classic, ink, C + 18, { fontWeight: "700", charSpacing: 30, w: 260, name: "Centre" }),
    txt("REG. 2024-00917", 14, F.mono, ink, C + 58, {
      fontWeight: "400",
      charSpacing: 0,
      w: 240,
      name: "Reg number",
    }),
  ],
};
