import {
  AlignCenterHorizontal,
  AlignCenterVertical,
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
import { IconBtn } from "../ui";

/**
 * All arrangement icons in one compact group — align to paper, flip, rotate
 * and canvas view toggles. Icon-only with tooltips, no labels or headings.
 */
export default function ArrangeRow() {
  const selected = useStampStore((s) => s.selected);
  const showGrid = useStampStore((s) => s.showGrid);
  const toggleGrid = useStampStore((s) => s.toggleGrid);
  const showRulers = useStampStore((s) => s.showRulers);
  const toggleRulers = useStampStore((s) => s.toggleRulers);
  const showGuides = useStampStore((s) => s.showGuides);
  const toggleGuides = useStampStore((s) => s.toggleGuides);

  const hint = selected ? undefined : "Select a layer first";

  return (
    <div className="grid grid-cols-7 gap-1.5" role="toolbar" aria-label="Arrange and align">
      <IconBtn icon={AlignStartVertical} label="Align to left edge" hint={hint} disabled={!selected} onClick={() => alignToPaper("left")} />
      <IconBtn icon={AlignCenterVertical} label="Center horizontally" hint={hint} disabled={!selected} onClick={() => alignToPaper("h")} />
      <IconBtn icon={AlignEndVertical} label="Align to right edge" hint={hint} disabled={!selected} onClick={() => alignToPaper("right")} />
      <IconBtn icon={AlignStartHorizontal} label="Align to top edge" hint={hint} disabled={!selected} onClick={() => alignToPaper("top")} />
      <IconBtn icon={AlignCenterHorizontal} label="Center vertically" hint={hint} disabled={!selected} onClick={() => alignToPaper("v")} />
      <IconBtn icon={AlignEndHorizontal} label="Align to bottom edge" hint={hint} disabled={!selected} onClick={() => alignToPaper("bottom")} />
      <IconBtn icon={Crosshair} label="Center on paper" hint={hint} disabled={!selected} onClick={() => alignToPaper("both")} />
      <IconBtn icon={RotateCcw} label="Rotate −15°" disabled={!selected} onClick={() => rotateSelection(-15)} />
      <IconBtn icon={RotateCw} label="Rotate +15°" hint="Shift-drag snaps 15°" disabled={!selected} onClick={() => rotateSelection(15)} />
      <IconBtn icon={FlipHorizontal} label="Flip horizontal" disabled={!selected} onClick={() => flipSelection("h")} />
      <IconBtn icon={FlipVertical} label="Flip vertical" disabled={!selected} onClick={() => flipSelection("v")} />
      <IconBtn
        icon={Plus}
        label="Center guides"
        hint="Cross hair at the paper centre"
        active={showGuides}
        onClick={toggleGuides}
      />
      <IconBtn icon={Grid3x3} label="Grid" hint="Snap grid overlay" active={showGrid} onClick={toggleGrid} />
      <IconBtn icon={Ruler} label="Rulers" hint="Millimetre rulers" active={showRulers} onClick={toggleRulers} />
    </div>
  );
}
