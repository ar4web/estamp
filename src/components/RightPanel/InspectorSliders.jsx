import { Ruler, Scaling, ChevronsLeftRight } from "lucide-react";
import useStampStore from "../../store/useStampStore";
import { Slider } from "../ui";
import { isRTL } from "../../utils/arabic";
import { rebuildArc } from "../../utils/canvas";
import { refreshTextObject } from "../../utils/fonts";

/**
 * THE single slider section — every slider in the product lives here and
 * nowhere else.
 *  - Placement defaults for the Shapes tool (Stroke weight / Size / Gap when a
 *    double border is armed) render whenever no shape is selected — so there
 *    is always exactly one slider stack.
 *  - The selection's own sliders (Size / Height / Track / Leading or
 *    Radius / Spread, Stroke width / Corner radius) plus Scale / Angle /
 *    Opacity render when something is selected.
 *  - A selected shape edits ITS stroke directly — the placement "Stroke" row
 *    hides in that case, so the same control never appears twice.
 */
export default function InspectorSliders({ obj, kind }) {
  const canvas = useStampStore((s) => s.canvas);
  const commit = useStampStore((s) => s.commit);
  const touch = useStampStore((s) => s.touchSelection);
  const shapeStroke = useStampStore((s) => s.shapeStroke);
  const shapeScale = useStampStore((s) => s.shapeScale);
  const shapeGap = useStampStore((s) => s.shapeGap);
  const shapeDouble = useStampStore((s) => s.shapeDouble);
  const setShapeDefaults = useStampStore((s) => s.setShapeDefaults);

  const isText = !!obj && (kind === "text" || kind === "arc");
  const isArc = kind === "arc";
  const isMulti = kind === "multi";
  const meta = obj?.stampMeta || {};

  const targets = isMulti ? canvas?.getActiveObjects?.() || [] : obj ? [obj] : [];

  const update = (patch) => {
    targets.forEach((t) => t.set(patch));
    targets.forEach((t) => t.setCoords?.());
    canvas?.requestRenderAll();
    commit();
    touch();
  };

  const updateText = (patch) => {
    if (isArc) {
      rebuildArc(canvas, obj, patch);
    } else {
      obj.set(patch);
      refreshTextObject(obj);
      obj.setCoords();
      canvas.requestRenderAll();
    }
    commit();
    touch();
  };

  const updateRotation = (deg) => {
    targets.forEach((t) => {
      if (typeof t.rotate === "function") t.rotate(deg);
      else t.set({ angle: deg });
      t.setCoords?.();
    });
    canvas?.requestRenderAll();
    commit();
    touch();
  };

  return (
    <div className="flex flex-col">
      {kind !== "shape" && (
        <>
          <Slider
            label="Stroke"
            icon={Ruler}
            value={shapeStroke}
            min={1}
            max={20}
            onChange={(v) => setShapeDefaults({ shapeStroke: v })}
            suffix="px"
            resetValue={6}
          />
          <Slider
            label="Size"
            icon={Scaling}
            value={shapeScale}
            min={30}
            max={120}
            onChange={(v) => setShapeDefaults({ shapeScale: v })}
            suffix="%"
            resetValue={100}
          />
          {shapeDouble && (
            <Slider
              label="Gap"
              icon={ChevronsLeftRight}
              value={shapeGap}
              min={2}
              max={40}
              onChange={(v) => setShapeDefaults({ shapeGap: v })}
              suffix="px"
              resetValue={8}
            />
          )}
        </>
      )}
      {isText && (
        <Slider
          label={isArc ? "Radius" : "Size"}
          value={isArc ? meta.radius ?? 200 : Math.round(obj.fontSize ?? 36)}
          min={isArc ? 50 : 6}
          max={isArc ? 300 : 160}
          onChange={(v) => updateText(isArc ? { radius: v } : { fontSize: v })}
          suffix="px"
          resetValue={isArc ? 200 : 36}
        />
      )}
      {!!obj && !isArc && !isMulti && kind === "text" && (
        <Slider
          label="Height"
          value={Math.round((obj.scaleY ?? 1) * 100)}
          min={50}
          max={250}
          step={5}
          onChange={(v) => updateText({ scaleY: v / 100 })}
          suffix="%"
          resetValue={100}
        />
      )}
      {isArc && (
        <Slider
          label="Spread"
          value={meta.letterSpacing ?? 2}
          min={-5}
          max={30}
          step={0.5}
          onChange={(v) => updateText({ letterSpacing: v })}
          resetValue={2}
        />
      )}
      {!!obj && !isArc && !isMulti && kind === "text" && !isRTL(obj.text) && (
        <Slider
          label="Track"
          value={obj.charSpacing ?? 0}
          min={-100}
          max={800}
          step={10}
          onChange={(v) => updateText({ charSpacing: v })}
          resetValue={0}
          format={(v) => `${v > 0 ? "+" : ""}${v}`}
        />
      )}
      {!!obj && !isArc && !isMulti && kind === "text" && (
        <Slider
          label="Leading"
          value={obj.lineHeight ?? 1.16}
          min={0.6}
          max={2.5}
          step={0.02}
          onChange={(v) => updateText({ lineHeight: v })}
          resetValue={1.16}
        />
      )}
      {kind === "shape" && !!obj && (
        <>
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
          {obj.type === "rect" && (
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
        </>
      )}
      {!!obj && (
        <>
          <Slider
            label="Scale"
            value={Math.round((obj.scaleX ?? 1) * 100)}
            min={10}
            max={400}
            onChange={(v) => update({ scaleX: v / 100, scaleY: v / 100 })}
            suffix="%"
            resetValue={100}
          />
          <Slider
            label="Angle"
            value={Math.round(obj.angle ?? 0)}
            min={-180}
            max={180}
            onChange={(v) => updateRotation(v)}
            suffix="°"
            resetValue={0}
            format={(v) => `${v > 0 ? "+" : ""}${v}`}
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
        </>
      )}
    </div>
  );
}
