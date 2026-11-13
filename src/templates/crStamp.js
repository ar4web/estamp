import { C, INK, F, box, txt } from "./shared.js";

const ink = INK.red;

export default {
  id: "crStamp",
  name: "C.R. / س.ت",
  cat: "Arabic",
  order: 43,
  tags: ["arabic", "register", "cr"],
  build: () => [
    box(500, 210, 8, ink, "Border", { rx: 6 }),
    txt("سجل تجاري", 26, F.arabic, ink, C - 52, {
      fontWeight: "700",
      charSpacing: 0,
      w: 420,
      name: "CR AR",
    }),
    txt("C.R. NO.", 18, F.stamp, ink, C - 8, { charSpacing: 80, w: 420, name: "CR EN" }),
    txt("____________", 24, F.mono, ink, C + 48, {
      fontWeight: "400",
      charSpacing: 0,
      w: 420,
      name: "Number line",
    }),
  ],
};
