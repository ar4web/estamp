import { C, INK, F, box, txt } from "./shared.js";

const ink = INK.black;

export default {
  id: "minimalLine",
  name: "Minimal Line",
  tags: ["minimal", "thin"],
  build: () => [
    box(460, 120, 1.5, ink, "Border", { rx: 2 }),
    txt("REVIEWED", 36, F.classic, ink, C, { fontWeight: "400", charSpacing: 180, w: 400, name: "Word" }),
  ],
};
