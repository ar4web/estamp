import useStampStore from "../store/useStampStore";
import { APP_NAME } from "../config";
import { INK_COLORS } from "../utils/canvas";
import Tooltip from "./Tooltip";

export default function BottomBar() {
  const selected = useStampStore((s) => s.selected);
  const zoom = useStampStore((s) => s.zoom);
  const inkColor = useStampStore((s) => s.inkColor);
  const setInkColor = useStampStore((s) => s.setInkColor);

  return (
    <footer
      className="z-[45] flex shrink-0 items-center justify-between gap-2 border-t px-2.5 overflow-x-auto scroll-thin select-none"
      style={{
        height: "var(--bar-h)",
        background: "var(--bg-panel)",
        borderColor: "var(--border)",
      }}
    >
      <span className="text-[9px] font-semibold tracking-wider" style={{ color: "var(--text-mute)" }}>
        {APP_NAME}
      </span>
      <span
        className="max-w-[160px] truncate text-[10px] tabular-nums"
        style={{ color: "var(--text-mute)" }}
        title={selected ? `Selected: ${selected.name || "Object"}` : "No selection"}
      >
        {selected ? (
          <span className="font-medium" style={{ color: "var(--text-dim)" }}>
            {selected.name || "Layer selected"}
          </span>
        ) : (
          "Ready"
        )}{" "}
        · {Math.round(zoom * 100)}%
      </span>
      {/* Ink palette — one tap recolours the selected layer (or the next object you place). */}
      <div className="flex shrink-0 items-center gap-1" role="toolbar" aria-label="Ink colour">
        {INK_COLORS.map((c) => {
          const on = (inkColor || "").toLowerCase() === c.hex.toLowerCase();
          return (
            <Tooltip key={c.hex} label={c.name} side="top" delay={150}>
              <button
                type="button"
                className="ink-swatch"
                style={{ background: c.hex }}
                aria-pressed={on}
                aria-label={`Ink ${c.name}`}
                title={c.name}
                onClick={() => setInkColor(c.hex)}
              />
            </Tooltip>
          );
        })}
      </div>
    </footer>
  );
}
