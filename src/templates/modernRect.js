import { C, INK, F, box, txt } from "./shared.js";

const ink = INK.navy;

export default {
  id: "modernRect",
  name: "Modern Rectangle",
  tags: ["rect", "3 lines"],
  build: () => [
    box(470, 236, 7, ink, "Border", { rx: 18 }),
    box(440, 206, 2, ink, "Inner border", { rx: 12 }),
    txt("NORTHSTAR LTD.", 36, F.display, ink, C - 52, { charSpacing: 8, w: 400, name: "Company" }),
    txt("DOCUMENT CONTROL", 20, F.ui, ink, C + 6, {
      fontWeight: "600",
      charSpacing: 80,
      w: 400,
      name: "Role",
    }),
    txt("QUALITY  ·  VERIFIED  ·  2024", 15, F.ui, ink, C + 52, {
      fontWeight: "400",
      charSpacing: 40,
      w: 400,
      name: "Meta",
    }),
  ],
};
