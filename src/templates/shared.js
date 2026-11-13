export const C = 310;

export const INK = {
  blue: "#003399",
  navy: "#003366",
  red: "#8b0000",
  green: "#006c35",
  black: "#111111",
};

export const F = {
  stamp: "Oswald",
  ui: "Inter",
  mono: "Roboto Mono",
  display: "Playfair Display",
  black: "Archivo Black",
  classic: "Cinzel",
  arabic: "Cairo",
  naskh: "Amiri",
};

export const ring = (r, w, ink, name) => ({
  type: "circle",
  r,
  cx: C,
  cy: C,
  strokeWidth: w,
  stroke: ink,
  name,
});

export const oval = (rx, ry, w, ink, name) => ({
  type: "ellipse",
  rx,
  ry,
  cx: C,
  cy: C,
  strokeWidth: w,
  stroke: ink,
  name,
});

export const box = (w, h, sw, ink, name, extra = {}) => ({
  type: "rect",
  w,
  h,
  cx: C,
  cy: C,
  strokeWidth: sw,
  stroke: ink,
  name,
  ...extra,
});

export const arc = (text, radius, position, size, family, ink, extra = {}) => ({
  type: "arc",
  text,
  radius,
  position,
  fontSize: size,
  fontFamily: family,
  fontWeight: extra.fontWeight || "700",
  fill: ink,
  letterSpacing: extra.letterSpacing ?? (position === "bottom" ? 4 : 3),
  cx: C,
  cy: C,
  name: extra.name || `${position} arc`,
});

export const txt = (text, size, family, ink, cy, extra = {}) => ({
  type: "text",
  text,
  fontSize: size,
  fontFamily: family,
  fontWeight: extra.fontWeight || "700",
  fill: ink,
  charSpacing: extra.charSpacing ?? 40,
  cx: extra.cx ?? C,
  cy,
  w: extra.w ?? 380,
  textAlign: extra.textAlign || "center",
  name: extra.name || text.slice(0, 18),
  ...("field" in extra ? { field: extra.field } : {}),
  ...("dateFormat" in extra ? { dateFormat: extra.dateFormat } : {}),
  ...("serialPrefix" in extra ? { serialPrefix: extra.serialPrefix } : {}),
  ...("serialValue" in extra ? { serialValue: extra.serialValue } : {}),
  ...("serialPad" in extra ? { serialPad: extra.serialPad } : {}),
  ...("angle" in extra ? { angle: extra.angle } : {}),
});

export const rule = (y, half, ink, w = 2.5, name = "Rule") => ({
  type: "line",
  x1: C - half,
  y1: y,
  x2: C + half,
  y2: y,
  stroke: ink,
  strokeWidth: w,
  name,
});

export const star = (cx, cy, outer, inner, ink, name = "Star", points = 5) => ({
  type: "star",
  outer,
  inner,
  points,
  cx,
  cy,
  fill: ink,
  stroke: ink,
  strokeWidth: 0,
  name,
});
