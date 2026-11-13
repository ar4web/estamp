import { Maximize2, Minus, Plus, Ruler, Grid3x3 } from "lucide-react";
import useStampStore from "../../store/useStampStore";
import Tooltip from "../Tooltip";

export default function ZoomControls() {
  const { zoom, setZoom, zoomBy, showRulers, toggleRulers, showGrid, toggleGrid } =
    useStampStore();

  return (
    <div
      className="flex h-9 shrink-0 items-center justify-center gap-1 border-t px-2"
      style={{
        background: "var(--bg-panel)",
        borderColor: "var(--border)",
      }}
    >
      <Tooltip label="Rulers" side="top">
        <button
          type="button"
          className="btn btn-icon h-7 w-7 p-0"
          aria-pressed={showRulers}
          aria-label="Toggle rulers"
          onClick={toggleRulers}
          style={showRulers ? { color: "var(--accent)" } : undefined}
        >
          <Ruler size={14} />
        </button>
      </Tooltip>
      <Tooltip label="Grid" side="top">
        <button
          type="button"
          className="btn btn-icon h-7 w-7 p-0"
          aria-pressed={showGrid}
          aria-label="Toggle grid"
          onClick={toggleGrid}
          style={showGrid ? { color: "var(--accent)" } : undefined}
        >
          <Grid3x3 size={14} />
        </button>
      </Tooltip>
      <span className="mx-0.5 h-4 w-px" style={{ background: "var(--border)" }} />
      <Tooltip label="Zoom out" side="top">
        <button
          type="button"
          className="btn btn-icon h-7 w-7 p-0"
          aria-label="Zoom out"
          onClick={() => zoomBy(-0.25)}
        >
          <Minus size={14} />
        </button>
      </Tooltip>
      <input
        type="range"
        min={50}
        max={400}
        step={5}
        value={Math.round(zoom * 100)}
        onChange={(e) => setZoom(Number(e.target.value) / 100)}
        className="h-7 w-28 cursor-ew-resize sm:w-40"
        aria-label="Canvas zoom"
      />
      <Tooltip label="Zoom in" side="top">
        <button
          type="button"
          className="btn btn-icon h-7 w-7 p-0"
          aria-label="Zoom in"
          onClick={() => zoomBy(0.25)}
        >
          <Plus size={14} />
        </button>
      </Tooltip>
      <Tooltip label="100%" side="top">
        <button
          type="button"
          className="btn btn-icon h-7 w-7 p-0"
          aria-label="Reset zoom to 100%"
          onClick={() => setZoom(1)}
        >
          <Maximize2 size={14} />
        </button>
      </Tooltip>
    </div>
  );
}
