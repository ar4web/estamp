import { C, INK, F, box, txt, rule } from "./shared.js";

const ink = INK.blue;

export default {
  id: "dateStamp",
  name: "Date Received",
  tags: ["date", "office"],
  build: () => [
    box(470, 250, 8, ink, "Border", { rx: 6 }),
    txt("RECEIVED", 42, F.black, ink, C - 68, { fontWeight: "400", charSpacing: 40, w: 400, name: "Header" }),
    rule(C - 24, 190, ink, 3, "Rule"),
    txt("24 OCT 2026", 36, F.mono, ink, C + 16, {
      field: "date",
      dateFormat: "DD MMM YYYY",
      fontWeight: "700",
      charSpacing: 0,
      w: 400,
      name: "Date",
    }),
    txt("00:00", 22, F.mono, ink, C + 72, {
      field: "time",
      fontWeight: "400",
      charSpacing: 0,
      w: 400,
      name: "Time",
    }),
  ],
};
