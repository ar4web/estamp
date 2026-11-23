import { Contrast, Eraser, FlipHorizontal, FlipVertical, Frame, Sparkles } from "lucide-react";
import useStampStore from "../../store/useStampStore";
import { applyStampFilter, clearObjectClip, clipObjectToRing } from "../../utils/canvas";
import { removeImageBackground, vectorizeImage } from "../../utils/image";
import { IconBtn, Slider } from "../ui";

export default function ImageProperties({ obj }) {
  const canvas = useStampStore((s) => s.canvas);
  const commit = useStampStore((s) => s.commit);
  const touch = useStampStore((s) => s.touchSelection);
  const toast = useStampStore((s) => s.toast);
  const meta = obj.stampMeta || {};

  const update = (patch) => {
    obj.set(patch);
    obj.setCoords();
    canvas.requestRenderAll();
    commit();
    touch();
  };

  return (
    <div>
      <Slider
        label="Opacity"
        value={Math.round((obj.opacity ?? 1) * 100)}
        min={5}
        max={100}
        onChange={(v) => update({ opacity: v / 100 })}
        suffix="%"
        resetValue={100}
      />
      <div className="grid grid-cols-4 gap-1.5">
        <IconBtn
          icon={FlipHorizontal}
          label="Flip horizontal"
          active={!!obj.flipX}
          onClick={() => update({ flipX: !obj.flipX })}
        />
        <IconBtn
          icon={FlipVertical}
          label="Flip vertical"
          active={!!obj.flipY}
          onClick={() => update({ flipY: !obj.flipY })}
        />
        {obj.type === "image" && (
          <>
            <IconBtn
              icon={Contrast}
              label="Stamp filter"
              hint="Grayscale + high contrast + background knock-out"
              active={!!meta.stampFilter}
              onClick={async () => {
                try {
                  await applyStampFilter(canvas, obj, !meta.stampFilter);
                  commit();
                  touch();
                  toast(meta.stampFilter ? "Original image restored" : "Stamp filter applied", "success");
                } catch (e) {
                  toast(`Filter failed: ${e.message}`, "error");
                }
              }}
            />
            <IconBtn
              icon={Frame}
              label="Clip to frame"
              hint="Fit the logo inside the outer ring"
              active={!!meta.clippedToRing}
              onClick={async () => {
                try {
                  if (meta.clippedToRing) clearObjectClip(canvas, obj);
                  else await clipObjectToRing(canvas, obj);
                  commit();
                  touch();
                } catch (e) {
                  toast(e.message, "info");
                }
              }}
            />
          </>
        )}
      </div>
      {obj.type === "image" && (
        <div className="mt-1.5 grid grid-cols-2 gap-1.5">
          <IconBtn
            icon={Eraser}
            label="Knock out background"
            onClick={async () => {
              try {
                await removeImageBackground(canvas, obj);
                commit();
                touch();
                toast("Background removed", "success");
              } catch (e) {
                toast(e.message, "error");
              }
            }}
          />
          <IconBtn
            icon={Sparkles}
            label="Convert to vector"
            hint="Recolor with Ink afterwards"
            onClick={async () => {
              try {
                const ink = useStampStore.getState().inkColor;
                await vectorizeImage(canvas, obj, ink);
                commit();
                useStampStore.getState().syncSelection();
                toast("Converted to vector — recolor with Ink", "success");
              } catch (e) {
                toast(e.message, "error");
              }
            }}
          />
        </div>
      )}
    </div>
  );
}
