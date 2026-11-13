import { C, INK, F, oval, txt, rule } from "./shared.js";

const ink = INK.red;

export default {
  id: "paidStamp",
  name: "Paid Oval",
  tags: ["oval", "finance"],
  build: () => [
    oval(258, 164, 9, ink, "Outer"),
    oval(240, 146, 2, ink, "Inner"),
    txt("PAID", 88, F.black, ink, C - 28, { fontWeight: "400", charSpacing: 20, w: 400, name: "Paid" }),
    rule(C + 34, 150, ink, 2.5, "Rule"),
    txt("DATE: ____ / ____ / ______", 16, F.mono, ink, C + 62, {
      fontWeight: "400",
      charSpacing: 0,
      w: 380,
      name: "Date line",
    }),
    txt("INVOICE # ______________", 16, F.mono, ink, C + 96, {
      fontWeight: "400",
      charSpacing: 0,
      w: 380,
      name: "Invoice line",
    }),
  ],
};
