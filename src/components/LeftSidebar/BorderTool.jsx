import { useState } from "react";
import {
  Circle,
  Egg,
  Hexagon,
  Minus,
  RectangleHorizontal,
  Square,
  SquareDashed,
  SquareSquare,
  Star,
  Squircle,
  Triangle,
} from "lucide-react";
import useStampStore from "../../store/useStampStore";
import { CANVAS_SIZE, buildShapeWithDoubleBorder } from "../../utils/canvas";
import { addObject } from "../../utils/actions";
import { Divider, IconBtn, Slider } from "../ui";
import AlignTool from "./AlignTool";
import DistressTool from "./DistressTool";

const C = CANVAS_SIZE / 2;

const SHAPES = [
  { id: "square", label: "Square frame", icon: Square, spec: { type: "rect", w: 440, h: 440, rx: 0 } },
  { id: "rect", label: "Rectangle frame", icon: RectangleHorizontal, spec: { type: "rect", w: 500, h: 250, rx: 0 } },
  { id: "round", label: "Rounded frame", icon: Squircle, spec: { type: "rect", w: 500, h: 250, rx: 26 } },
  { id: "circle", label: "Circle frame", icon: Circle, spec: { type: "circle", r: 240 } },
  { id: "ellipse", label: "Oval frame", icon: Egg, spec: { type: "ellipse", rx: 255, ry: 160 } },
  { id: "hexagon", label: "Hexagon frame", icon: Hexagon, spec: { type: "hexagon", r: 240 } },
  { id: "star", label: "Star seal", icon: Star, spec: { type: "star", outer: 240, inner: 100 } },
  { id: "triangle", label: "Triangle seal", icon: Triangle, spec: { type: "triangle", r: 230 } },
  { id: "line", label: "Horizontal rule", icon: Minus, spec: { type: "line", x1: C - 170, y1: C, x2: C + 170, y2: C } },
];

export default function BorderTool() {
  const inkColor = useStampStore((s) => s.inkColor);
  const toast = useStampStore((s) => s.toast);
  const [strokeWidth, setStrokeWidth] = useState(6);
  const [scale, setScale] = useState(100);
  const [double, setDouble] = useState(false);
  const [gap, setGap] = useState(8);
  const [filled, setFilled] = useState(false);
  const [dashed, setDashed] = useState(false);

  const place = (shape) => {
    const base = { ...shape.spec, cx: C, cy: C, stroke: inkColor, strokeWidth, name: shape.label };
    if (filled && shape.id !== "line") base.fill = inkColor;
    if (dashed) base.strokeDashArray = [10, 8];
    const k = scale / 100;
    ["r", "ry", "outer", "inner", "w", "h"].forEach((key) => {
      if (typeof base[key] === "number") base[key] = base[key] * k;
    });
    if (shape.spec.type === "ellipse") base.rx = shape.spec.rx * k;
    const objs = buildShapeWithDoubleBorder(base, double && shape.id !== "line", gap);
    objs.forEach((o, i) => addObject(o, { select: i === 0 }));
    toast(`Added ${shape.label}`, "success");
  };

  return (
    <div>
      <div className="mb-2 grid grid-cols-3 gap-1.5">
        {SHAPES.map((s) => (
          <IconBtn key={s.id} icon={s.icon} label={s.label} onClick={() => place(s)} size={17} />
        ))}
      </div>

      <Slider label="Stroke" value={strokeWidth} min={1} max={20} onChange={setStrokeWidth} suffix="px" />
      <Slider label="Size" value={scale} min={30} max={120} onChange={setScale} suffix="%" />

      <div className="mb-3 grid grid-cols-3 gap-1.5">
        <IconBtn
          icon={SquareSquare}
          label="Double border"
          hint="Outer + inner ring"
          active={double}
          onClick={() => setDouble((v) => !v)}
        />
        <IconBtn
          icon={(p) => <Square {...p} fill="currentColor" stroke="none" />}
          label="Solid fill"
          hint="Fill the shape with ink"
          active={filled}
          onClick={() => setFilled((v) => !v)}
        />
        <IconBtn
          icon={SquareDashed}
          label="Dashed stroke"
          hint="Broken dash outline"
          active={dashed}
          onClick={() => setDashed((v) => !v)}
        />
      </div>
      {double && <Slider label="Gap" value={gap} min={2} max={40} onChange={setGap} suffix="px" />}

      <Divider />
      <AlignTool />
      <Divider />
      <DistressTool />
    </div>
  );
}
