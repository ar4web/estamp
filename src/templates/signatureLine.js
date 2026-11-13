import { C, INK, F, box, txt } from "./shared.js";

const ink = INK.navy;

export default {
  id: "signatureLine",
  name: "Signature Block",
  tags: ["rect", "sign-off"],
  build: () => [
    box(500, 220, 5, ink, "Border", { rx: 8 }),
    txt("By:", 26, F.ui, ink, C - 48, {
      fontWeight: "700",
      charSpacing: 0,
      cx: C - 196,
      w: 80,
      textAlign: "left",
      name: "By",
    }),
    {
      type: "line",
      x1: C - 148,
      y1: C - 28,
      x2: C + 210,
      y2: C - 28,
      stroke: ink,
      strokeWidth: 2.5,
      name: "Sign line",
    },
    txt("Date:", 26, F.ui, ink, C + 36, {
      fontWeight: "700",
      charSpacing: 0,
      cx: C - 180,
      w: 110,
      textAlign: "left",
      name: "Date label",
    }),
    {
      type: "line",
      x1: C - 108,
      y1: C + 56,
      x2: C + 210,
      y2: C + 56,
      stroke: ink,
      strokeWidth: 2.5,
      name: "Date line",
    },
    txt("AUTHORISED SIGNATORY", 14, F.ui, ink, C + 92, {
      fontWeight: "600",
      charSpacing: 120,
      w: 440,
      name: "Caption",
    }),
  ],
};
