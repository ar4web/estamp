import { C, INK, F, box, txt } from "./shared.js";

const ink = INK.blue;

export default {
  id: "serialStamp",
  name: "Serial No.",
  tags: ["serial", "office"],
  build: () => [
    box(470, 210, 8, ink, "Border", { rx: 4 }),
    txt("SERIAL", 28, F.stamp, ink, C - 48, { charSpacing: 140, w: 400, name: "Header" }),
    txt("NO. 0001", 44, F.mono, ink, C + 28, {
      field: "serial",
      serialPrefix: "NO. ",
      serialValue: 1,
      serialPad: 4,
      fontWeight: "700",
      charSpacing: 0,
      w: 400,
      name: "Serial",
    }),
  ],
};
