import { Square, SquareDashed } from "lucide-react";
import useStampStore from "../../store/useStampStore";
import { IconBtn } from "../ui";

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
  const dashed = Array.isArray(obj.strokeDashArray) && obj.strokeDashArray.length > 0;

  return (
    <div>
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
