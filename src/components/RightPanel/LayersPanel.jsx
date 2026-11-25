import {
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Layers,
  Lock,
  Shapes,
  Spline,
  Trash2,
  Type,
  Unlock,
} from "lucide-react";
import useStampStore from "../../store/useStampStore";
import { selectionKind } from "../../utils/canvas";
import { objectInkHex } from "../../utils/color";
import { bringForward, sendBackwards } from "../../utils/actions";
import Tooltip from "../Tooltip";

const ICON = {
  text: Type,
  arc: Spline,
  image: ImageIcon,
  textured: ImageIcon,
  group: Layers,
  shape: Shapes,
};

export default function LayersPanel() {
  const canvas = useStampStore((s) => s.canvas);
  const layerVersion = useStampStore((s) => s.layerVersion);
  const selVersion = useStampStore((s) => s.selVersion);
  const commit = useStampStore((s) => s.commit);
  const syncSelection = useStampStore((s) => s.syncSelection);
  const touchLayers = useStampStore((s) => s.touchLayers);

  void layerVersion;
  void selVersion;
  if (!canvas) return null;

  const objects = canvas.getObjects();
  const active = canvas.getActiveObject();

  if (!objects.length)
    return (
      <Tooltip label="No layers yet" hint="Add text, a shape or a logo to begin" side="top">
        <div className="grid place-items-center py-8">
          <Layers size={26} style={{ color: "var(--text-mute)" }} aria-hidden />
        </div>
      </Tooltip>
    );

  const select = (obj) => {
    if (obj.lockedLayer) return;
    canvas.setActiveObject(obj);
    canvas.requestRenderAll();
    syncSelection();
  };

  const toggleVisible = (obj) => {
    obj.visible = !obj.visible;
    if (!obj.visible && canvas.getActiveObject() === obj) canvas.discardActiveObject();
    canvas.requestRenderAll();
    commit();
    touchLayers();
  };

  const toggleLock = (obj) => {
    obj.lockedLayer = !obj.lockedLayer;
    obj.selectable = !obj.lockedLayer;
    obj.evented = !obj.lockedLayer;
    if (obj.lockedLayer && canvas.getActiveObject() === obj) canvas.discardActiveObject();
    canvas.requestRenderAll();
    commit();
    touchLayers();
    syncSelection();
  };

  const remove = (obj) => {
    canvas.remove(obj);
    canvas.requestRenderAll();
    commit();
    syncSelection();
  };

  const Mini = ({ title, onClick, children, on, danger }) => (
    <Tooltip label={title} side="left" delay={160}>
      <button
        type="button"
        aria-label={title}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        className={`grid h-6 w-6 shrink-0 place-items-center ${danger ? "danger-hover" : ""}`}
        style={{ color: on ? "var(--accent)" : "var(--text-dim)" }}
      >
        {children}
      </button>
    </Tooltip>
  );

  return (
    <div className="flex flex-col gap-1">
      {objects
        .slice()
        .reverse()
        .map((obj, i) => {
          const kind = selectionKind(obj) || "shape";
          const Icon = ICON[kind] || Shapes;
          const isActive = active === obj;
          return (
            <div
              key={obj.id || i}
              onClick={() => select(obj)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), select(obj))}
              className="flex cursor-pointer items-center gap-1.5 border px-1.5 py-1"
              aria-pressed={isActive}
              aria-label={obj.name || kind}
              title={obj.name || kind}
              style={{
                borderColor: isActive ? "var(--accent)" : "var(--border-soft)",
                background: isActive ? "var(--bg-raised)" : "var(--bg-sunken)",
                opacity: obj.visible === false ? 0.45 : 1,
              }}
            >
              <Icon size={13} style={{ color: objectInkHex(obj) || "var(--text-dim)" }} className="shrink-0" />
              <span
                className="layer-name min-w-0 flex-1 truncate text-[9px] leading-none"
                style={{ color: "var(--text-dim)" }}
                title={obj.name || kind}
                aria-hidden="true"
              >
                {obj.name || kind}
              </span>
              <span
                className="h-2.5 w-2.5 shrink-0 border"
                style={{
                  background: objectInkHex(obj) || "transparent",
                  borderColor: "var(--border-soft)",
                }}
              />
              <Mini
                title="Move up"
                onClick={() => {
                  canvas.setActiveObject(obj);
                  bringForward();
                  touchLayers();
                }}
              >
                <ChevronUp size={12} />
              </Mini>
              <Mini
                title="Move down"
                onClick={() => {
                  canvas.setActiveObject(obj);
                  sendBackwards();
                  touchLayers();
                }}
              >
                <ChevronDown size={12} />
              </Mini>
              <Mini title={obj.visible === false ? "Show" : "Hide"} onClick={() => toggleVisible(obj)}>
                {obj.visible === false ? <EyeOff size={12} /> : <Eye size={12} />}
              </Mini>
              <Mini
                title={obj.lockedLayer ? "Unlock" : "Lock"}
                on={!!obj.lockedLayer}
                onClick={() => toggleLock(obj)}
              >
                {obj.lockedLayer ? <Lock size={12} /> : <Unlock size={12} />}
              </Mini>
              <Mini title="Delete layer" danger onClick={() => remove(obj)}>
                <Trash2 size={12} />
              </Mini>
            </div>
          );
        })}
    </div>
  );
}
