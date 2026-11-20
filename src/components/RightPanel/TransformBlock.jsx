import {
  AlignCenterHorizontal,
  AlignCenterVertical,
  Crosshair,
} from "lucide-react";
import useStampStore from "../../store/useStampStore";
import { Slider, SliderGrid } from "../ui";
import { alignSelection } from "../../utils/actions";
import Tooltip from "../Tooltip";

export default function TransformBlock({ obj }) {
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

  const Act = ({ title, onClick, icon: Icon }) => (
    <Tooltip label={title} side="top" delay={120}>
      <button
        type="button"
        className="btn btn-icon"
        aria-label={title}
        onClick={onClick}
      >
        <Icon size={15} />
      </button>
    </Tooltip>
  );

  return (
    <>
      <div className="mb-2">
        <span className="label mb-1 block">Align</span>
        <div className="icon-row">
          <Act title="Centre horizontally" icon={AlignCenterVertical} onClick={() => alignSelection("h")} />
          <Act title="Centre vertically" icon={AlignCenterHorizontal} onClick={() => alignSelection("v")} />
          <Act title="Centre both" icon={Crosshair} onClick={() => alignSelection("both")} />
        </div>
      </div>

      <SliderGrid>
        <Slider
          label="Scale"
          value={Math.round((obj.scaleX ?? 1) * 100)}
          min={10}
          max={400}
          onChange={(v) => update({ scaleX: v / 100, scaleY: v / 100 })}
          suffix="%"
          resetValue={100}
          presets={[
            { label: "50%", value: 50 },
            { label: "100%", value: 100 },
            { label: "200%", value: 200 },
          ]}
        />
        <Slider
          label="Angle"
          value={Math.round(obj.angle ?? 0)}
          min={-180}
          max={180}
          onChange={(v) => {
            if (typeof obj.rotate === "function") obj.rotate(v);
            else obj.set({ angle: v });
            obj.setCoords();
            canvas.requestRenderAll();
            commit();
            touch();
          }}
          suffix="°"
          resetValue={0}
          format={(v) => `${v > 0 ? "+" : ""}${v}`}
          presets={[
            { label: "0°", value: 0 },
            { label: "90°", value: 90 },
            { label: "180°", value: 180 },
          ]}
        />
      </SliderGrid>
    </>
  );
}
