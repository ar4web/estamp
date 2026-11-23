import {
  AlignCenterHorizontal,
  AlignEndHorizontal,
  AlignEndVertical,
  AlignStartHorizontal,
  AlignStartVertical,
  Crosshair,
  FlipHorizontal,
  FlipVertical,
  Grid3x3,
  Plus,
  RotateCcw,
  RotateCw,
  Ruler,
} from "lucide-react";
import useStampStore from "../../store/useStampStore";
import { alignToPaper, flipSelection, rotateSelection } from "../../utils/actions";
import { Divider, IconBtn } from "../ui";

export default function AlignTool() {
  const selected = useStampStore((s) => s.selected);
  const showGrid = useStampStore((s) => s.showGrid);
  const toggleGrid = useStampStore((s) => s.toggleGrid);
  const showRulers = useStampStore((s) => s.showRulers);
  const toggleRulers = useStampStore((s) => s.toggleRulers);
  const showGuides = useStampStore((s) => s.showGuides);
  const toggleGuides = useStampStore((s) => s.toggleGuides);

  const hint = selected ? undefined : "Select a layer first";

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-3 gap-1.5">
        <IconBtn icon={AlignStartVertical} label="Align to left edge" hint={hint} onClick={() => alignToPaper("left")} />
        <IconBtn icon={Crosshair} label="Center on paper" hint={hint} onClick={() => alignToPaper("both")} />
        <IconBtn icon={AlignEndVertical} label="Align to right edge" hint={hint} onClick={() => alignToPaper("right")} />
        <IconBtn icon={AlignStartHorizontal} label="Align to top edge" hint={hint} onClick={() => alignToPaper("top")} />
        <IconBtn icon={AlignCenterHorizontal} label="Center vertically" hint={hint} onClick={() => alignToPaper("v")} />
        <IconBtn icon={AlignEndHorizontal} label="Align to bottom edge" hint={hint} onClick={() => alignToPaper("bottom")} />
      </div>

      <div className="grid grid-cols-4 gap-1.5">
        <IconBtn icon={RotateCcw} label="Rotate −15°" onClick={() => rotateSelection(-15)} />
        <IconBtn icon={RotateCw} label="Rotate +15°" hint="Shift-drag snaps 15°" onClick={() => rotateSelection(15)} />
        <IconBtn icon={FlipHorizontal} label="Flip horizontal" onClick={() => flipSelection("h")} />
        <IconBtn icon={FlipVertical} label="Flip vertical" onClick={() => flipSelection("v")} />
      </div>

      <Divider />

      <div className="grid grid-cols-3 gap-1.5">
        <IconBtn
          icon={Plus}
          label="Center guides"
          hint="Cross hair at the paper centre"
          active={showGuides}
          onClick={toggleGuides}
        />
        <IconBtn
          icon={Grid3x3}
          label="Grid"
          hint="Snap grid overlay"
          active={showGrid}
          onClick={toggleGrid}
        />
        <IconBtn
          icon={Ruler}
          label="Rulers"
          hint="Millimetre rulers"
          active={showRulers}
          onClick={toggleRulers}
        />
      </div>
    </div>
  );
}
