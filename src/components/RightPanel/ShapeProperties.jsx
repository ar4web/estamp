import { Square, SquareDashed } from "lucide-react";
import useStampStore from "../../store/useStampStore";
import { IconBtn, Slider } from "../ui";

export default function ShapeProperties({ obj }) {
  const canvas = useStampStore((s) => s.canvas);
  const commit = useStampStore((s) => s.commit);
  const touch = useStampStore((s) => s.touchSelection);

  const update = (patch) => {
    obj.set(patch);
    obj.setCoords();
    canvas.requestRenderAll();
    commit();
    touch();
  };

  const filled = obj.fill && obj.fill !== "transparent";
  const isRect = obj.type === "rect";
  const dashed = Array.isArray(obj.strokeDashArray) && obj.strokeDashArray.length > 0;

  return (
    <div>
      <Slider
        label="Stroke width"
        value={obj.strokeWidth ?? 1}
        min={0}
        max={20}
        step={0.5}
        onChange={(v) => update({ strokeWidth: v })}
        suffix="px"
        resetValue={1}
      />
      <Slider
        label="Opacity"
        value={Math.round((obj.opacity ?? 1) * 100)}
        min={5}
        max={100}
        onChange={(v) => update({ opacity: v / 100 })}
        suffix="%"
        resetValue={100}
      />
      {isRect && (
        <Slider
          label="Corner radius"
          value={obj.rx ?? 0}
          min={0}
          max={120}
          onChange={(v) => update({ rx: v, ry: v })}
          suffix="px"
          resetValue={0}
        />
      )}
      <div className="grid grid-cols-2 gap-1.5">
        <IconBtn
          icon={Square}
          label="Solid fill"
          active={!!filled}
          onClick={() => update({ fill: filled ? "transparent" : obj.stroke || "#003399" })}
        />
        <IconBtn
          icon={SquareDashed}
          label="Dashed stroke"
          active={dashed}
          onClick={() => update({ strokeDashArray: dashed ? null : [12, 8] })}
        />
      </div>
    </div>
  );
}
