import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  Crosshair,
  Group as GroupIcon,
  MousePointerClick,
  Save,
  Pin,
  PinOff,
  Sliders,
  Trash2,
  Ungroup,
} from "lucide-react";
import useStampStore from "../../store/useStampStore";
import DraggablePanel, { useIsMobile } from "../DraggablePanel";
import Tooltip from "../Tooltip";
import { Empty } from "../ui";
import { selectionKind } from "../../utils/canvas";
import { deleteSelection, groupSelection, ungroupSelection } from "../../utils/actions";
import LayersPanel from "./LayersPanel";
import TextProperties from "./TextProperties";
import ShapeProperties from "./ShapeProperties";
import ImageProperties from "./ImageProperties";
import TransformBlock from "./TransformBlock";

const TABS = [
  { id: "layers", label: "Layers" },
  { id: "text", label: "Text" },
];

export default function RightPanel() {
  const rightOpen = useStampStore((s) => s.rightOpen);
  const toggleRight = useStampStore((s) => s.toggleRight);
  const selected = useStampStore((s) => s.selected);
  const selVersion = useStampStore((s) => s.selVersion);
  const canvas = useStampStore((s) => s.canvas);
  const layerVersion = useStampStore((s) => s.layerVersion);
  const inspectorTab = useStampStore((s) => s.inspectorTab);
  const setInspectorTab = useStampStore((s) => s.setInspectorTab);
  const focusSection = useStampStore((s) => s.focusSection);
  const saveCurrent = useStampStore((s) => s.saveCurrent);
  const kind = selectionKind(selected);
  void selVersion;
  void layerVersion;

  const [pinned, setPinned] = useState(true);
  const mobile = useIsMobile();
  const scrollPositions = useRef({});
  const bodyRef = useRef(null);
  const lastSelected = useRef(null);

  useEffect(() => {
    if (!focusSection) return;
    if (focusSection === "layers") setInspectorTab("layers");
    else setInspectorTab("text");
  }, [focusSection, setInspectorTab]);

  // Smart auto-switch: selecting a new layer brings its controls forward,
  // while tab scroll positions are kept (restored in the layout effect).
  useEffect(() => {
    if (selected && selected !== lastSelected.current) setInspectorTab("text");
    lastSelected.current = selected;
  }, [selected, setInspectorTab]);

  useLayoutEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = scrollPositions.current[inspectorTab] ?? 0;
    }
  }, [inspectorTab]);

  const layerCount = canvas ? canvas.getObjects().length : 0;

  const HeadBtn = ({ label, hint, onClick, disabled, danger, children }) => (
    <Tooltip label={label} hint={hint} side="bottom" delay={120}>
      <button
        type="button"
        aria-label={label}
        onClick={onClick}
        disabled={disabled}
        className={`btn btn-icon h-6 w-6 p-0 ${danger ? "btn-danger" : ""}`}
      >
        {children}
      </button>
    </Tooltip>
  );

  const properties = !selected ? (
    <Empty icon={MousePointerClick} title="Nothing selected" hint="Pick a layer or click it on the canvas." />
  ) : kind === "multi" ? (
    <div>
      <p className="mb-2 text-[10px]" style={{ color: "var(--text-dim)" }}>{selected.size()} layers selected</p>
      <div className="flex gap-1.5">
        <button type="button" className="btn flex-1" onClick={groupSelection}><GroupIcon size={15} /> Group</button>
        <button type="button" className="btn flex-1" onClick={ungroupSelection}><Ungroup size={15} /> Ungroup</button>
      </div>
    </div>
  ) : (
    <div className="flex flex-col gap-2">
      {(kind === "text" || kind === "arc") && <TextProperties obj={selected} kind={kind} />}
      {kind === "shape" && <ShapeProperties obj={selected} />}
      {(kind === "image" || kind === "textured") && <ImageProperties obj={selected} />}
      {kind === "group" && (
        <button type="button" className="btn w-full" onClick={ungroupSelection}>
          <Ungroup size={15} /> Ungroup layers
        </button>
      )}
      <div>
        <div className="label mb-1 flex items-center gap-1.5"><Crosshair size={11} /> Transform</div>
        <TransformBlock obj={selected} />
      </div>
    </div>
  );

  return (
    <DraggablePanel
      title="Inspector"
      icon={Sliders}
      width={280}
      side="right"
      open={rightOpen}
      onClose={toggleRight}
      pad={false}
      background="#191919"
      className="inspector-panel"
      autoHide={!pinned}
      actions={
        <>
          {!mobile && (
            <Tooltip label={pinned ? "Unpin inspector" : "Pin inspector open"} side="bottom">
              <button type="button" className="btn btn-icon h-6 w-6 p-0"
                aria-label={pinned ? "Unpin inspector" : "Pin inspector open"}
                aria-pressed={pinned} onClick={() => setPinned((value) => !value)}>
                {pinned ? <Pin size={14} /> : <PinOff size={14} />}
              </button>
            </Tooltip>
          )}
          <HeadBtn label="Delete" hint="Del" danger onClick={deleteSelection} disabled={!selected}>
            <Trash2 size={14} />
          </HeadBtn>
          <HeadBtn label="Save" hint="Ctrl+S" onClick={() => saveCurrent()}>
            <Save size={14} />
          </HeadBtn>
        </>
      }
    >
      <div className="insp-tabs" role="tablist" aria-label="Inspector">
        {TABS.map((t) => {
          const on = inspectorTab === t.id;
          const label = t.id === "layers" && layerCount > 0 ? `Layers (${layerCount})` : t.label;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={on}
              aria-label={label}
              className={`insp-tab ${on ? "is-on" : ""}`}
              onClick={() => setInspectorTab(t.id)}
            >
              {label}
            </button>
          );
        })}
      </div>
      <div
        ref={bodyRef}
        onScroll={(e) => {
          scrollPositions.current[inspectorTab] = e.currentTarget.scrollTop;
        }}
        className="scroll-thin min-h-0 flex-1 overflow-y-auto p-2"
      >
        {inspectorTab === "layers" && <LayersPanel />}
        {inspectorTab === "text" && properties}
      </div>
    </DraggablePanel>
  );
}
