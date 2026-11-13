import { useEffect } from "react";
import {
  Crosshair,
  Download,
  Group as GroupIcon,
  Layers,
  MousePointerClick,
  Save,
  Sliders,
  Trash2,
  Ungroup,
} from "lucide-react";
import useStampStore from "../../store/useStampStore";
import DraggablePanel from "../DraggablePanel";
import Tooltip from "../Tooltip";
import { Empty } from "../ui";
import { selectionKind } from "../../utils/canvas";
import { deleteSelection, groupSelection, ungroupSelection } from "../../utils/actions";
import LayersPanel from "./LayersPanel";
import TextProperties from "./TextProperties";
import ShapeProperties from "./ShapeProperties";
import ImageProperties from "./ImageProperties";
import TransformBlock from "./TransformBlock";
import ExportPanel from "./ExportPanel";

const TABS = [
  { id: "props", label: "Properties" },
  { id: "layers", label: "Layers" },
  { id: "export", label: "Export" },
];

function kindLabel(kind) {
  if (kind === "text" || kind === "arc") return "Text";
  if (kind === "shape") return "Shape";
  if (kind === "image" || kind === "textured") return "Image";
  if (kind === "group") return "Group";
  if (kind === "multi") return "Selection";
  return "Properties";
}

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

  useEffect(() => {
    if (!focusSection) return;
    if (focusSection === "layers") setInspectorTab("layers");
    else if (focusSection === "export") setInspectorTab("export");
    else setInspectorTab("props");
  }, [focusSection, setInspectorTab]);

  useEffect(() => {
    if (!selected) return;
    if (inspectorTab === "layers") return;
    setInspectorTab("props");
  }, [selVersion]);

  void layerVersion;
  const layerCount = canvas ? canvas.getObjects().length : 0;

  const HeadBtn = ({ label, hint, onClick, disabled, danger, children }) => (
    <Tooltip label={label} hint={hint} side="bottom" delay={120}>
      <button
        type="button"
        aria-label={label}
        onClick={onClick}
        disabled={disabled}
        className={`btn btn-icon h-7 w-7 p-0 ${danger ? "btn-danger" : ""}`}
      >
        {children}
      </button>
    </Tooltip>
  );

  const properties = !selected ? (
    <Empty
      icon={MousePointerClick}
      title="Nothing selected"
      hint="Pick a layer or click it on the canvas."
    />
  ) : kind === "multi" ? (
    <div>
      <p className="mb-2 text-[10px]" style={{ color: "var(--text-dim)" }}>
        {selected.size()} layers selected
      </p>
      <div className="flex gap-1.5">
        <button type="button" className="btn flex-1" onClick={groupSelection}>
          <GroupIcon size={15} /> Group
        </button>
        <button type="button" className="btn flex-1" onClick={ungroupSelection}>
          <Ungroup size={15} /> Ungroup
        </button>
      </div>
    </div>
  ) : (
    <div className="flex flex-col gap-3">
      {(kind === "text" || kind === "arc") && <TextProperties obj={selected} kind={kind} />}
      {kind === "shape" && <ShapeProperties obj={selected} />}
      {(kind === "image" || kind === "textured") && <ImageProperties obj={selected} />}
      {kind === "group" && (
        <button type="button" className="btn w-full" onClick={ungroupSelection}>
          <Ungroup size={15} /> Ungroup layers
        </button>
      )}
      <div>
        <div className="label mb-1.5 flex items-center gap-1.5">
          <Crosshair size={11} /> Transform
        </div>
        <TransformBlock obj={selected} />
      </div>
    </div>
  );

  return (
    <DraggablePanel
      title="Inspector"
      icon={Sliders}
      width={320}
      side="right"
      open={rightOpen}
      onClose={toggleRight}
      pad={false}
      actions={
        <>
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
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={on}
              className={`insp-tab ${on ? "is-on" : ""}`}
              onClick={() => setInspectorTab(t.id)}
            >
              {t.label}
              {t.id === "layers" && layerCount > 0 ? (
                <span className="tabular-nums" style={{ color: on ? "var(--accent)" : "var(--text-mute)" }}>
                  {layerCount}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
      <div className="scroll-thin min-h-0 flex-1 overflow-y-auto p-2.5">
        {inspectorTab === "props" && properties}
        {inspectorTab === "layers" && <LayersPanel />}
        {inspectorTab === "export" && <ExportPanel />}
      </div>
    </DraggablePanel>
  );
}
