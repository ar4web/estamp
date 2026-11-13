import { C, INK, F, ring, arc, txt } from "./shared.js";

const ink = INK.green;

export default {
  id: "riyadhSeal",
  name: "Riyadh",
  cat: "Arabic",
  order: 40,
  tags: ["arabic", "riyadh", "ksa"],
  build: () => [
    ring(250, 8, ink, "Outer ring"),
    ring(226, 2.5, ink, "Inner ring"),
    arc("المملكة العربية السعودية", 194, "top", 24, F.arabic, ink, {
      letterSpacing: 1,
      name: "KSA arc",
    }),
    arc("KINGDOM OF SAUDI ARABIA", 194, "bottom", 14, F.stamp, ink, {
      letterSpacing: 2,
      name: "KSA EN",
    }),
    txt("الرياض", 48, F.naskh, ink, C - 12, {
      fontWeight: "700",
      charSpacing: 0,
      w: 300,
      name: "Riyadh AR",
    }),
    txt("RIYADH", 18, F.stamp, ink, C + 44, { charSpacing: 80, w: 280, name: "Riyadh EN" }),
  ],
};
