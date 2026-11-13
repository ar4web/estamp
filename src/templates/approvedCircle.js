import { C, INK, F, ring, txt, rule } from "./shared.js";

const ink = INK.blue;

export default {
  id: "approvedCircle",
  name: "Approved Circle",
  tags: ["round", "approval"],
  build: () => [
    ring(240, 10, ink, "Ring"),
    txt("APPROVED", 60, F.black, ink, C - 16, { fontWeight: "400", charSpacing: 16, w: 400, name: "Approved" }),
    rule(C + 36, 140, ink, 3.5, "Rule"),
    txt("DATE  ___ / ___ / ______", 22, F.mono, ink, C + 76, {
      fontWeight: "400",
      charSpacing: 0,
      w: 380,
      name: "Date line",
    }),
  ],
};
