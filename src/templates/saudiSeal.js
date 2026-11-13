import { C, INK, F, ring, arc, txt } from "./shared.js";

const ink = INK.green;

export default {
  id: "saudiSeal",
  name: "Saudi Arabia",
  cat: "Arabic",
  order: 41,
  tags: ["arabic", "ksa", "official"],
  build: () => [
    ring(252, 7, ink, "Outer ring"),
    ring(232, 2, ink, "Middle ring"),
    ring(154, 2, ink, "Inner ring"),
    arc("المملكة العربية السعودية", 190, "top", 22, F.arabic, ink, {
      letterSpacing: 1,
      name: "Arabic arc",
    }),
    arc("KINGDOM OF SAUDI ARABIA", 190, "bottom", 13, F.stamp, ink, {
      letterSpacing: 2,
      name: "English arc",
    }),
    txt("KSA", 44, F.stamp, ink, C, { fontWeight: "900", charSpacing: 30, w: 240, name: "Centre" }),
  ],
};
