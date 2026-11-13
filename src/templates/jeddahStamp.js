import { C, INK, F, oval, txt } from "./shared.js";

const ink = INK.navy;

export default {
  id: "jeddahStamp",
  name: "Jeddah",
  cat: "Arabic",
  order: 44,
  tags: ["arabic", "jeddah"],
  build: () => [
    oval(252, 164, 8, ink, "Oval"),
    oval(228, 142, 2, ink, "Inner"),
    txt("جدة", 52, F.naskh, ink, C - 12, { fontWeight: "700", charSpacing: 0, w: 360, name: "Jeddah AR" }),
    txt("JEDDAH", 18, F.stamp, ink, C + 44, { charSpacing: 100, w: 320, name: "Jeddah EN" }),
  ],
};
