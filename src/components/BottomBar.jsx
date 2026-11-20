import { Download } from "lucide-react";
import useStampStore from "../store/useStampStore";
import { APP_NAME } from "../config";

export default function BottomBar() {
  const selected = useStampStore((s) => s.selected);
  const zoom = useStampStore((s) => s.zoom);
  const openModal = useStampStore((s) => s.openModal);

  return (
    <footer
      className="z-[45] flex shrink-0 items-center justify-between border-t px-2.5 overflow-x-auto scroll-thin select-none"
      style={{
        height: "var(--bar-h)",
        background: "var(--bg-panel)",
        borderColor: "var(--border)",
      }}
    >
      <span className="text-[9px] font-semibold tracking-wider" style={{ color: "var(--text-mute)" }}>
        {APP_NAME}
      </span>
      <div className="flex min-w-0 items-center gap-2">
        <span
          className="max-w-[220px] truncate text-[10px] tabular-nums"
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
        <button
          type="button"
          className="btn h-7 shrink-0 gap-1.5 px-2 text-[10px]"
          onClick={() => openModal("download")}
          aria-label="Download stamp"
          title="Download stamp"
        >
          <Download size={13} aria-hidden /> Download
        </button>
      </div>
    </footer>
  );
}
