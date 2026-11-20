import useStampStore from "../../store/useStampStore";
import { Checkbox, Slider, SliderGrid } from "../ui";

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
      <SliderGrid>
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
      </SliderGrid>
      {isRect && (
        <SliderGrid>
          <Slider
            label="Corner radius"
            value={obj.rx ?? 0}
            min={0}
            max={120}
            onChange={(v) => update({ rx: v, ry: v })}
            suffix="px"
            resetValue={0}
          />
        </SliderGrid>
      )}
      <div className="grid grid-cols-2 gap-x-2">
        <Checkbox
          label="Solid fill"
          checked={!!filled}
          onChange={(on) => update({ fill: on ? obj.stroke || "#003399" : "transparent" })}
        />
        <Checkbox
          label="Dashed"
          checked={dashed}
          onChange={(on) => update({ strokeDashArray: on ? [12, 8] : null })}
        />
      </div>
    </div>
  );
}
