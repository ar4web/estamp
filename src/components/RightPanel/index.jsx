import { useState } from "react";
import { ChevronDown, ChevronUp, Group as GroupIcon, MousePointerClick, Ungroup, Wrench } from "lucide-react";
import useStampStore from "../../store/useStampStore";
import DraggablePanel from "../DraggablePanel";
import Tooltip from "../Tooltip";
import { Divider } from "../ui";
import { selectionKind } from "../../utils/canvas";
import { groupSelection, ungroupSelection } from "../../utils/actions";
import LayersPanel from "./LayersPanel";
import TextTool from "./TextTool";
import ArrangeRow from "./ArrangeRow";
import InspectorSliders from "./InspectorSliders";
import ShapeProperties from "./ShapeProperties";
import ImageProperties from "./ImageProperties";
import ShapesPanel from "./ShapesPanel";
import OrnamentsTool from "./OrnamentsTool";

/**
 * Inspector — top to bottom:
 *  Layers · [Tools ▾ (single text box / shapes / ornaments / arrange)] ·
 *  selected-layer properties · THE one slider stack.
 * No headings; hairline dividers only.
 */
export default function RightPanel() {
  const rightOpen = useStampStore((s) => s.rightOpen);
  const toggleRight = useStampStore((s) => s.toggleRight);
  const selected = useStampStore((s) => s.selected);
  const selVersion = useStampStore((s) => s.selVersion);
  void selVersion;

  const [toolsOpen, setToolsOpen] = useState(true);
  const kind = selectionKind(selected);

  const properties = !selected ? (
    <Tooltip label="Nothing selected" hint="Click a layer on the canvas" side="top">
      <div className="grid place-items-center py-6">
        <MousePointerClick size={26} style={{ color: "var(--text-mute)" }} aria-hidden />
      </div>
    </Tooltip>
  ) : kind === "multi" ? (
    <div className="grid grid-cols-2 gap-1.5" aria-label={`${selected.size()} layers selected`}>
      <Tooltip label="Group" shortcut="Ctrl+G" side="top">
        <button type="button" className="btn" aria-label="Group selection" onClick={groupSelection}>
          <GroupIcon size={16} />
        </button>
      </Tooltip>
      <Tooltip label="Ungroup" side="top">
        <button type="button" className="btn" aria-label="Ungroup selection" onClick={ungroupSelection}>
          <Ungroup size={16} />
        </button>
      </Tooltip>
    </div>
  ) : (
    <div className="flex flex-col gap-2">
      {kind === "shape" && <ShapeProperties obj={selected} />}
      {(kind === "image" || kind === "textured") && <ImageProperties obj={selected} />}
      {kind === "group" && (
        <Tooltip label="Ungroup layers" side="top">
          <button type="button" className="btn w-full" aria-label="Ungroup layers" onClick={ungroupSelection}>
            <Ungroup size={15} />
          </button>
        </Tooltip>
      )}
    </div>
  );

  return (
    <DraggablePanel
      title="Inspector"
      width={280}
      side="right"
      open={rightOpen}
      onClose={toggleRight}
      pad={false}
      background="#191919"
      className="inspector-panel"
    >
      <div className="scroll-thin flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-2.5">
        {/* Layers — always on top */}
        <LayersPanel />
        <Divider />

        {/* Tools — one collapsible section (icon-only, no text) */}
        <div>
          <button
            type="button"
            className="tools-toggle"
            aria-expanded={toolsOpen}
            aria-controls="tools-section"
            aria-label={toolsOpen ? "Collapse tools" : "Expand tools"}
            title="Tools"
            onClick={() => setToolsOpen((v) => !v)}
          >
            <span className="tools-toggle-icon">
              <Wrench size={13} strokeWidth={1.75} aria-hidden />
            </span>
            {toolsOpen ? (
              <ChevronUp size={14} strokeWidth={1.75} aria-hidden />
            ) : (
              <ChevronDown size={14} strokeWidth={1.75} aria-hidden />
            )}
          </button>
          {toolsOpen && (
            <div id="tools-section" className="flex flex-col gap-2 pt-1.5">
              <TextTool />
              <Divider />
              <ShapesPanel />
              <Divider />
              <OrnamentsTool />
              <Divider />
              <ArrangeRow />
            </div>
          )}
        </div>

        {/* Selected-layer property buttons (non-slider) */}
        <Divider />
        {properties}

        {/* THE one slider stack */}
        <Divider />
        <InspectorSliders obj={selected} kind={kind} />
      </div>
    </DraggablePanel>
  );
}
