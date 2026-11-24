import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  CalendarClock,
  CalendarDays,
  ChevronDown,
  ChevronsDown,
  ChevronsUp,
  Clock3,
  Hash,
  Italic,
  Plus,
  Spline,
  StretchHorizontal,
  Type,
  Underline,
} from "lucide-react";
import useStampStore from "../../store/useStampStore";
import { CANVAS_SIZE, createSpecObject, rebuildArc, toggleTextCurve } from "../../utils/canvas";
import { selectionKind } from "../../utils/canvas";
import { addObject } from "../../utils/actions";
import { DATE_FORMATS, fieldText } from "../../utils/fields";
import { isRTL } from "../../utils/arabic";
import {
  FONT_SETS,
  fabricFamily,
  fontForScript,
  getCustomFonts,
  loadFont,
  plainFamily,
  refreshTextObject,
} from "../../utils/fonts";
import Tooltip from "../Tooltip";
import FontPicker from "../FontPicker";

/**
 * THE one text control in the product.
 *  - A text/arc layer selected? The textarea edits it live (selection mode).
 *  - Nothing (or something else) selected? The textarea is a new-text draft;
 *    Enter or the + button inserts it at the paper centre.
 * Font / size / thickness / case always act on the selection when there is
 * one, on the draft otherwise. No second text input exists anywhere.
 */
function IconBtn({ label, on, onClick, children }) {
  return (
    <Tooltip label={label} side="top">
      <button
        type="button"
        className={`btn ${on ? "btn-on" : ""}`}
        aria-label={label}
        aria-pressed={on == null ? undefined : !!on}
        onClick={onClick}
      >
        {children}
      </button>
    </Tooltip>
  );
}

const WEIGHTS = [
  { v: "300", label: "Light" },
  { v: "400", label: "Regular" },
  { v: "500", label: "Medium" },
  { v: "700", label: "Bold" },
  { v: "900", label: "Black" },
];

const WEIGHT_NAMES = { 300: "Light", 400: "Regular", 500: "Medium", 700: "Bold", 900: "Black" };

// Inch-based quick sizes for stamp work + the px ladder.
const SIZE_OPTIONS = [
  { v: 48, label: '½″' },
  { v: 72, label: '¾″' },
  { v: 96, label: '1″' },
  { v: 120, label: '1¼″' },
  { v: 144, label: '1½″' },
  { v: 192, label: '2″' },
  ...[8, 12, 16, 20, 24, 28, 32, 36, 40, 56, 64, 80, 160, 224].map((n) => ({ v: n, label: `${n}px` })),
];

const LIVE_FIELDS = [
  { id: "date", icon: CalendarDays },
  { id: "time", icon: Clock3 },
  { id: "datetime", icon: CalendarClock },
  { id: "serial", icon: Hash },
];

const ink = () => useStampStore.getState().inkColor;

export default function TextTool() {
  const canvas = useStampStore((s) => s.canvas);
  const inkColor = useStampStore((s) => s.inkColor);
  const commit = useStampStore((s) => s.commit);
  const touch = useStampStore((s) => s.touchSelection);
  const selected = useStampStore((s) => s.selected);
  const selVersion = useStampStore((s) => s.selVersion);
  void selVersion;

  const kind = selectionKind(selected);
  const editing = kind === "text" || kind === "arc" ? selected : null;
  const isArc = kind === "arc";
  const meta = editing?.stampMeta || {};
  const currentText = editing ? (isArc ? meta.text || "" : editing.text || "") : "";

  // Draft-only state (used when no text layer is selected).
  const [draft, setDraft] = useState("");
  const [draftFont, setDraftFont] = useState("Cairo");
  const [draftWeight, setDraftWeight] = useState("700");
  const [draftSize, setDraftSize] = useState(44);
  const [fontOpen, setFontOpen] = useState(false);

  const inputRef = useRef(null);
  const fontControlRef = useRef(null);
  const fonts = useMemo(
    () => [...getCustomFonts(), ...FONT_SETS.flatMap((g) => g.fonts)],
    []
  );

  useEffect(() => setFontOpen(false), [editing]);
  useEffect(() => {
    if (!fontOpen) return;
    const onDown = (e) => {
      if (!fontControlRef.current?.contains(e.target)) setFontOpen(false);
    };
    const onKey = (e) => e.key === "Escape" && setFontOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [fontOpen]);

  const text = editing ? currentText : draft;
  const rtl = isRTL(text);

  /* ---------- shared read helpers (selection mode) ---------- */
  const val = (key, fallback) => (isArc ? meta[key] ?? fallback : editing?.[key] ?? fallback);
  const family = plainFamily(editing ? val("fontFamily", "Oswald") : draftFont);
  const weight = String(editing ? val("fontWeight", "400") : draftWeight);
  const weightName = WEIGHT_NAMES[weight] || weight;
  const preview = String(text || family).trim().slice(0, 18) || "Aa";
  const fontSize = Math.round(editing ? val("fontSize", 36) : draftSize);
  const sizeOptions = SIZE_OPTIONS.some((o) => o.v === fontSize)
    ? SIZE_OPTIONS
    : [{ v: fontSize, label: `${fontSize}px` }, ...SIZE_OPTIONS];

  /* ---------- selection-mode updater ---------- */
  const update = (patch, { silent } = {}) => {
    if (!editing) return;
    if (isArc) {
      rebuildArc(canvas, editing, patch);
    } else {
      const next = { ...patch };
      if (next.fontFamily) next.fontFamily = fabricFamily(next.fontFamily);
      if (next.text !== undefined) {
        const r = isRTL(next.text);
        next.direction = r ? "rtl" : "ltr";
        if (r) next.charSpacing = 0;
      }
      editing.set(next);
      refreshTextObject(editing);
      editing.setCoords();
      canvas.requestRenderAll();
    }
    if (!silent) commit();
    touch();
  };

  /* ---------- actions ---------- */
  const applyFont = async (nextFamily) => {
    await loadFont(nextFamily);
    if (editing) update({ fontFamily: nextFamily });
    else setDraftFont(nextFamily);
    setFontOpen(false);
  };

  const applySize = (n) => (editing ? update({ fontSize: n }) : setDraftSize(n));
  const applyWeight = (w) => (editing ? update({ fontWeight: w }) : setDraftWeight(w));

  const applyCase = (mode) => {
    const src = text;
    const next =
      mode === "upper"
        ? src.toUpperCase()
        : mode === "lower"
          ? src.toLowerCase()
          : src.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
    if (editing) update({ text: next });
    else setDraft(next);
  };

  const addToCanvas = async () => {
    const value = (draft || "TEXT").trim();
    if (!value) return;
    const fam = draftFont || fontForScript(value);
    await loadFont(fam);
    addObject(
      createSpecObject({
        type: "text",
        text: value,
        fontSize: draftSize,
        fontFamily: fam,
        fontWeight: draftWeight,
        charSpacing: isRTL(value) ? 0 : 60,
        fill: ink(),
        cx: CANVAS_SIZE / 2,
        cy: CANVAS_SIZE / 2,
        w: Math.max(220, Math.min(520, (value.length || 6) * 34)),
      })
    );
    setDraft("");
    useStampStore.getState().toast("Text added to canvas", "success");
  };

  const setShape = (v) => {
    if (v === "straight") {
      if (!isArc) return;
      toggleTextCurve(canvas, editing);
    } else if (v === "curved") {
      if (isArc) return;
      toggleTextCurve(canvas, editing, { position: "top" });
    } else if (isArc) {
      if ((meta.position || "top") === v) return;
      update({ position: v });
      return;
    } else {
      toggleTextCurve(canvas, editing, { position: v });
    }
    commit();
    touch();
    useStampStore.getState().syncSelection();
  };

  const applyField = (id) => {
    if (!editing) return;
    const next = {
      ...(editing.stampMeta || {}),
      kind: "text",
      field: id,
      dateFormat: "DD MMM YYYY",
      serialPrefix: "NO. ",
      serialValue: 1,
      serialPad: 4,
    };
    if (id === "serial") {
      next.serialPrefix = editing.stampMeta?.serialPrefix ?? "NO. ";
      next.serialValue = editing.stampMeta?.serialValue ?? 1;
      next.serialPad = editing.stampMeta?.serialPad ?? 4;
    }
    editing.stampMeta = next;
    update({ text: fieldText(next) });
  };

  /* ---------- render ---------- */
  const rtlText = editing ? currentText : draft;
  const rDir = isRTL(rtlText) ? "rtl" : "ltr";

  return (
    <div className="flex flex-col gap-2">
      {/* The one and only text box */}
      <div className="tool-add">
        <textarea
          ref={inputRef}
          className="field resize-none"
          rows={2}
          aria-label={editing ? "Selected text content" : "New text content"}
          dir={rDir}
          style={{ fontFamily: fabricFamily(family), fontWeight: weight, fontSize: 12, lineHeight: 1.4 }}
          value={text}
          placeholder="Type a name…"
          onChange={(e) =>
            editing ? update({ text: e.target.value }, { silent: true }) : setDraft(e.target.value)
          }
          onBlur={() => editing && commit()}
          onKeyDown={(e) => {
            if (!editing && e.key === "Enter") {
              e.preventDefault();
              addToCanvas();
            }
          }}
        />
        {!editing && (
          <Tooltip label="Add text to canvas" hint="Enter" side="top">
            <button
              type="button"
              className="btn btn-accent"
              aria-label="Add text to canvas"
              onClick={addToCanvas}
            >
              <Plus size={16} />
            </button>
          </Tooltip>
        )}
      </div>

      {/* Font trigger + popover (list of fonts) + size / thickness */}
      <div className="font-control" ref={fontControlRef}>
        <button
          type="button"
          className="font-trigger"
          title="Open font list"
          aria-label={`Font ${family}, weight ${weightName}. Open font list`}
          aria-haspopup="listbox"
          aria-expanded={fontOpen}
          onClick={() => setFontOpen((v) => !v)}
        >
          <Type size={11} aria-hidden />
          <span className="font-trigger-name">{family}</span>
          <span
            className="font-trigger-preview"
            dir="auto"
            aria-hidden="true"
            style={{ fontFamily: fabricFamily(family), fontWeight: weight }}
          >
            {preview}
          </span>
          <ChevronDown size={11} aria-hidden />
        </button>
        {fontOpen && (
          <div className="font-popover" role="dialog" aria-label="Font family">
            <FontPicker
              fonts={fonts}
              value={family}
              onSelect={applyFont}
              previewText={text}
              weight={weight}
            />
          </div>
        )}

        <div className={`grid gap-1.5 ${isArc ? "grid-cols-1" : "grid-cols-2"}`}>
          {!isArc && (
            <select
              className="field"
              aria-label="Font size"
              title="Font size"
              value={String(fontSize)}
              onChange={(e) => applySize(Number(e.target.value))}
            >
              {sizeOptions.map((o) => (
                <option key={o.v} value={String(o.v)}>
                  {o.label}
                </option>
              ))}
            </select>
          )}
          <select
            className="field"
            aria-label="Thickness"
            title="Font thickness"
            value={weight}
            onChange={(e) => applyWeight(e.target.value)}
          >
            {WEIGHTS.some((w) => w.v === weight) ? null : <option value={weight}>{weight}</option>}
            {WEIGHTS.map((w) => (
              <option key={w.v} value={w.v}>
                {w.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Case — works on the selection, on the draft otherwise */}
      <div className="icon-grid">
        <IconBtn label="Uppercase" onClick={() => applyCase("upper")}>
          <span className="text-[10px] font-semibold">AA</span>
        </IconBtn>
        <IconBtn label="Title case" onClick={() => applyCase("title")}>
          <span className="text-[10px] font-semibold">Aa</span>
        </IconBtn>
        <IconBtn label="Lowercase" onClick={() => applyCase("lower")}>
          <span className="text-[10px] font-semibold">aa</span>
        </IconBtn>
        {editing &&
          !meta.field &&
          LIVE_FIELDS.map((f) => (
            <IconBtn key={f.id} label={`Insert ${f.id} field`} onClick={() => applyField(f.id)}>
              <f.icon size={15} />
            </IconBtn>
          ))}
      </div>

      {editing && meta.field && (
        <>
          <div className="icon-grid" role="group" aria-label="Live field type">
            {LIVE_FIELDS.map((f) => (
              <IconBtn
                key={f.id}
                label={`Live field: ${f.id}`}
                on={meta.field === f.id}
                onClick={() => applyField(f.id)}
              >
                <f.icon size={15} />
              </IconBtn>
            ))}
          </div>
          {(meta.field === "date" || meta.field === "datetime") && (
            <div className="flex flex-wrap gap-1">
              {DATE_FORMATS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  className={`btn !min-h-6 !px-1.5 text-[9px] ${meta.dateFormat === f.id ? "btn-on" : ""}`}
                  aria-pressed={meta.dateFormat === f.id}
                  title={`Date format ${f.id}`}
                  onClick={() => {
                    const next = { ...meta, dateFormat: f.id };
                    editing.stampMeta = next;
                    update({ text: fieldText(next) });
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          )}
          {meta.field === "serial" && (
            <div className="grid grid-cols-3 gap-1">
              <input
                className="field"
                aria-label="Serial prefix"
                value={meta.serialPrefix ?? "NO. "}
                onChange={(e) => {
                  const next = { ...meta, serialPrefix: e.target.value };
                  editing.stampMeta = next;
                  update({ text: fieldText(next) }, { silent: true });
                }}
                onBlur={() => commit()}
              />
              <input
                className="field"
                type="number"
                aria-label="Serial value"
                value={meta.serialValue ?? 1}
                onChange={(e) => {
                  const next = { ...meta, serialValue: Number(e.target.value) || 1 };
                  editing.stampMeta = next;
                  update({ text: fieldText(next) }, { silent: true });
                }}
                onBlur={() => commit()}
              />
              <input
                className="field"
                type="number"
                aria-label="Serial digits"
                value={meta.serialPad ?? 4}
                min={1}
                max={8}
                onChange={(e) => {
                  const next = { ...meta, serialPad: Number(e.target.value) || 4 };
                  editing.stampMeta = next;
                  update({ text: fieldText(next) }, { silent: true });
                }}
                onBlur={() => commit()}
              />
            </div>
          )}
        </>
      )}

      {editing && (
        <div className="icon-grid">
          <IconBtn label="Straight text" on={!isArc} onClick={() => setShape("straight")}>
            <Type size={15} />
          </IconBtn>
          <IconBtn label="Curved text" on={isArc} onClick={() => setShape("curved")}>
            <Spline size={15} />
          </IconBtn>
          <IconBtn
            label="Top arch"
            on={isArc && (meta.position || "top") === "top"}
            onClick={() => setShape("top")}
          >
            <ChevronsUp size={15} />
          </IconBtn>
          <IconBtn
            label="Bottom arch"
            on={isArc && (meta.position || "top") === "bottom"}
            onClick={() => setShape("bottom")}
          >
            <ChevronsDown size={15} />
          </IconBtn>
          {!isArc && (
            <>
              <IconBtn
                label="Italic"
                on={editing.fontStyle === "italic"}
                onClick={() =>
                  update({ fontStyle: editing.fontStyle === "italic" ? "normal" : "italic" })
                }
              >
                <Italic size={15} />
              </IconBtn>
              <IconBtn
                label="Underline"
                on={!!editing.underline}
                onClick={() => update({ underline: !editing.underline })}
              >
                <Underline size={15} />
              </IconBtn>
            </>
          )}
          {!isArc && (
            <>
              <IconBtn
                label="Align left"
                on={editing.textAlign === "left"}
                onClick={() => update({ textAlign: "left" })}
              >
                <AlignLeft size={15} />
              </IconBtn>
              <IconBtn
                label="Align center"
                on={editing.textAlign === "center"}
                onClick={() => update({ textAlign: "center" })}
              >
                <AlignCenter size={15} />
              </IconBtn>
              <IconBtn
                label="Align right"
                on={editing.textAlign === "right"}
                onClick={() => update({ textAlign: "right" })}
              >
                <AlignRight size={15} />
              </IconBtn>
            </>
          )}
          {isArc && (
            <Tooltip label="Balance arc ends" side="top">
              <button
                type="button"
                className="btn"
                aria-label="Balance arc ends"
                onClick={() => {
                  const t = String(meta.text || "").trim().replace(/\s+/g, " ");
                  editing.set({ angle: 0 });
                  update({ text: t });
                }}
              >
                <StretchHorizontal size={15} />
              </button>
            </Tooltip>
          )}
        </div>
      )}
    </div>
  );
}
