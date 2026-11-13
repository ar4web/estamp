import { useEffect, useRef, useState } from "react";
import {
  Bookmark,
  ChevronLeft,
  Flower2,
  FolderOpen,
  Image as ImageIcon,
  LayoutGrid,
  Scan,
  Type,
  Wand2,
} from "lucide-react";
import useStampStore from "../../store/useStampStore";
import { useIsMobile } from "../DraggablePanel";
import Tooltip from "../Tooltip";
import TextTool from "./TextTool";
import AutoDesignTool from "./AutoDesignTool";
import ImageTool from "./ImageTool";
import SurfaceTool from "./SurfaceTool";
import TemplateGallery from "./TemplateGallery";
import OrnamentTool from "./OrnamentTool";
import BorderTool from "./BorderTool";
import ClipTool from "./ClipTool";

const SECTIONS = [
  { id: "template", label: "Templates", hint: "Start from a layout", icon: LayoutGrid, Component: TemplateGallery },
  { id: "text", label: "Text", hint: "Words, marks, dates", icon: Type, Component: TextTool },
  { id: "border", label: "Frame", hint: "Shape, align, distress", icon: Scan, Component: BorderTool },
  { id: "ornament", label: "Ornaments", hint: "Stars, seals, flourishes", icon: Flower2, Component: OrnamentTool },
  { id: "image", label: "Logo", hint: "Drop, knock out, vectorize", icon: ImageIcon, Component: ImageTool },
  { id: "clip", label: "Clips", hint: "Reuse motifs", icon: Bookmark, Component: ClipTool },
  { id: "auto", label: "Auto Design", hint: "Build a full stamp", icon: Wand2, Component: AutoDesignTool },
];

export default function LeftSidebar() {
  const pulse = useStampStore((s) => s.pulseTemplates);
  const leftOpen = useStampStore((s) => s.leftOpen);
  const toggleLeft = useStampStore((s) => s.toggleLeft);
  const openModal = useStampStore((s) => s.openModal);
  const mobile = useIsMobile();

  const [active, setActive] = useState("template");
  const [hovering, setHovering] = useState(false);
  const [pinned, setPinned] = useState(true);
  const closeTimer = useRef(null);

  const openPanel = pinned || hovering;

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  const enter = () => {
    clearTimeout(closeTimer.current);
    setHovering(true);
  };
  const collapse = () => {
    clearTimeout(closeTimer.current);
    setPinned(false);
    setHovering(false);
  };
  const leave = () => {
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setHovering(false), 180);
  };

  const Current = SECTIONS.find((s) => s.id === active)?.Component || TextTool;

  if (mobile) {
    return (
      <>
        {leftOpen && <div className="fixed inset-0 z-[49] bg-black/50" onClick={toggleLeft} />}
        <aside
          aria-label="Insert tools"
          className="fixed inset-x-0 bottom-0 z-[50] flex h-[70vh] flex-col border-t shadow-2xl"
          style={{
            background: "var(--bg-panel)",
            borderColor: "var(--border)",
            transform: leftOpen ? "translateY(0)" : "translateY(103%)",
            transition: "transform .2s ease",
            visibility: leftOpen ? "visible" : "hidden",
          }}
        >
          <div className="flex shrink-0 overflow-x-auto border-b scroll-thin" style={{ borderColor: "var(--border)" }}>
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                aria-selected={active === s.id}
                aria-label={s.label}
                title={s.label}
                onClick={() => setActive(s.id)}
                className="rail-btn !h-11 !w-12 shrink-0 !border-l-0 !border-b-2"
                style={
                  active === s.id
                    ? { borderBottomColor: "var(--accent)", color: "var(--accent)" }
                    : { borderBottomColor: "transparent" }
                }
              >
                <s.icon size={16} strokeWidth={1.75} />
              </button>
            ))}
          </div>
          <div className="scroll-thin flex-1 overflow-y-auto p-2.5">
            <Current />
          </div>
          <div className="shrink-0 border-t px-2.5 py-2" style={{ borderColor: "var(--border-soft)" }}>
            <button
              type="button"
              className="btn w-full mb-2"
              aria-label="My Stamps"
              onClick={() => openModal("saveload")}
            >
              <FolderOpen size={14} /> My Stamps
            </button>
            <SurfaceTool />
          </div>
        </aside>
      </>
    );
  }

  return (
    <div className="relative z-30 flex h-full shrink-0" onMouseEnter={enter} onMouseLeave={leave}>
      <nav
        aria-label="Insert tools"
        className="flex h-full shrink-0 flex-col border-r"
        style={{
          width: "var(--rail-w)",
          background: "var(--bg-panel)",
          borderColor: "var(--border)",
        }}
      >
        <div className="scroll-thin flex min-h-0 flex-1 flex-col overflow-y-auto">
        {SECTIONS.map((s, i) => {
          const on = active === s.id;
          const prev = SECTIONS[i - 1];
          return (
            <div key={s.id} className="w-full">
              {s.id === "auto" && prev?.id !== "auto" && <div className="rail-gap" />}
              <Tooltip label={s.label} hint={s.hint} side="right" className="w-full">
                <button
                  aria-selected={on && openPanel}
                  aria-expanded={on && openPanel}
                  aria-label={s.label}
                  title={s.label}
                  onClick={() => {
                    if (active === s.id && openPanel) collapse();
                    else {
                      setActive(s.id);
                      setPinned(true);
                    }
                  }}
                  className={`rail-btn ${pulse && s.id === "template" ? "pulse-hint" : ""}`}
                >
                  <s.icon size={16} strokeWidth={1.75} />
                </button>
              </Tooltip>
            </div>
          );
        })}
        </div>
        <div className="mt-auto flex w-full flex-col" style={{ borderTop: "1px solid var(--border-soft)" }}>
          <Tooltip label="My Stamps" hint="Library · import .stamp" shortcut="Ctrl+S" side="right" className="w-full">
            <button
              type="button"
              className="rail-btn"
              aria-label="My Stamps"
              title="My Stamps"
              onClick={() => openModal("saveload")}
            >
              <FolderOpen size={16} />
            </button>
          </Tooltip>
          <SurfaceTool compact />
        </div>
      </nav>

      <div
        className="h-full overflow-hidden border-r"
        style={{
          width: openPanel ? "var(--drawer-w)" : 0,
          opacity: openPanel ? 1 : 0,
          borderColor: openPanel ? "var(--border)" : "transparent",
          background: "var(--bg-panel)",
          transition: "width .18s ease, opacity .14s ease",
        }}
      >
        <div className="flex h-full flex-col" style={{ width: "var(--drawer-w)" }}>
          <div
            className="flex h-9 shrink-0 items-center gap-2 border-b px-2.5"
            style={{ borderColor: "var(--border-soft)" }}
          >
            <h2 className="flex-1 truncate text-[10px] font-semibold uppercase tracking-[0.1em]">
              {SECTIONS.find((s) => s.id === active)?.label}
            </h2>
            <button
              className="btn btn-ghost btn-icon h-7 w-7"
              title="Collapse panel"
              aria-label="Collapse panel"
              onClick={collapse}
            >
              <ChevronLeft size={14} />
            </button>
          </div>
          <div className="scroll-thin flex-1 overflow-y-auto px-2.5 py-2">
            <Current />
          </div>
        </div>
      </div>
    </div>
  );
}
