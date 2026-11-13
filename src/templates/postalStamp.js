import { C, INK, F, box, txt, rule } from "./shared.js";

const ink = INK.blue;

export default {
  id: "postalStamp",
  name: "P.O. Box",
  cat: "Arabic",
  order: 42,
  tags: ["postal", "zip", "arabic"],
  build: () => [
    box(480, 250, 8, ink, "Border", { rx: 8 }),
    box(450, 220, 2, ink, "Inner", { rx: 4 }),
    txt("ص.ب", 32, F.arabic, ink, C - 64, { fontWeight: "700", charSpacing: 0, w: 380, name: "PO AR" }),
    txt("P.O. BOX", 22, F.stamp, ink, C - 18, { charSpacing: 80, w: 380, name: "PO EN" }),
    rule(C + 18, 170, ink, 2, "Rule"),
    txt("الرمز البريدي  ____", 18, F.arabic, ink, C + 58, {
      fontWeight: "600",
      charSpacing: 0,
      w: 380,
      name: "ZIP",
    }),
  ],
};
