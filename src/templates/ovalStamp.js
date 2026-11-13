import { C, INK, F, oval, txt } from "./shared.js";

const ink = INK.blue;

export default {
  id: "ovalStamp",
  name: "Bold Oval",
  tags: ["oval", "2 lines"],
  build: () => [
    oval(258, 156, 12, ink, "Oval"),
    txt("ATLAS STUDIO", 42, F.display, ink, C - 22, { charSpacing: 20, w: 400, name: "Brand" }),
    txt("DESIGN & PRINT", 20, F.ui, ink, C + 32, {
      fontWeight: "600",
      charSpacing: 100,
      w: 400,
      name: "Tagline",
    }),
  ],
};
