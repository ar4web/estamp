import { C, INK, F, box, txt } from "./shared.js";

const ink = INK.red;

export default {
  id: "confidential",
  name: "Confidential",
  tags: ["rect", "security"],
  build: () => [
    box(520, 196, 10, ink, "Outer", { rx: 4 }),
    box(492, 168, 2, ink, "Inner", { rx: 2 }),
    txt("CONFIDENTIAL", 48, F.black, ink, C - 8, { charSpacing: 8, w: 460, name: "Title" }),
    txt("DO NOT DISTRIBUTE", 16, F.ui, ink, C + 48, {
      fontWeight: "600",
      charSpacing: 140,
      w: 440,
      name: "Subtitle",
    }),
    {
      type: "rect",
      w: 540,
      h: 10,
      cx: C,
      cy: C - 82,
      angle: -5,
      fill: ink,
      strokeWidth: 0,
      opacity: 0.9,
      name: "Ink strip top",
    },
    {
      type: "rect",
      w: 540,
      h: 10,
      cx: C,
      cy: C + 82,
      angle: -5,
      fill: ink,
      strokeWidth: 0,
      opacity: 0.9,
      name: "Ink strip bottom",
    },
  ],
};
