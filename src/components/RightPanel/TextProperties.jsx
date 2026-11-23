import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  CalendarClock,
  CalendarDays,
  ChevronsDown,
  ChevronsUp,
  Clock3,
  Hash,
  Italic,
  Spline,
  ChevronDown,
  StretchHorizontal,
  Type,
  Underline,
} from "lucide-react";
import useStampStore from "../../store/useStampStore";
import { rebuildArc, toggleTextCurve } from "../../utils/canvas";
import { DATE_FORMATS, fieldText } from "../../utils/fields";
import { isRTL } from "../../utils/arabic";
import { FONT_SETS, fabricFamily, getCustomFonts, loadFont, plainFamily, refreshTextObject } from "../../utils/fonts";
import Tooltip from "../Tooltip";
import FontPicker from "../FontPicker";

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

const WEIGHT_NAMES = ({ 300: "Light", 400: "Regular", 500: "Medium", 700: "Bold", 900: "Black" });

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

export default function TextProperties({ obj, kind }) {
  const canvas = useStampStore((s) => s.canvas);
  const commit = useStampStore((s) => s.commit);
  const touch = useStampStore((s) => s.touchSelection);
  const [fontOpen, setFontOpen] = useState(false);
  const fontControlRef = useRef(null);
  const fonts = useMemo(
    () => [...getCustomFonts(), ...FONT_SETS.flatMap((g) => g.fonts)],
    []
  );

  useEffect(() => setFontOpen(false), [obj]);
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
  const isArc = kind === "arc";
  const meta = obj.stampMeta || {};
  const rtl = isRTL(isArc ? meta.text : obj.text);

  const update = (patch, { silent } = {}) => {
    if (isArc) {
      rebuildArc(canvas, obj, patch);
    } else {
      const next = { ...patch };
      if (next.fontFamily) next.fontFamily = fabricFamily(next.fontFamily);
      if (next.text !== undefined) {
        const r = isRTL(next.text);
        next.direction = r ? "rtl" : "ltr";
        if (r) next.charSpacing = 0;
      }
      obj.set(next);
      refreshTextObject(obj);
      obj.setCoords();
      canvas.requestRenderAll();
    }
    if (!silent) commit();
    touch();
  };

  const val = (key, fallback) => (isArc ? meta[key] ?? fallback : obj[key] ?? fallback);
  const family = plainFamily(val("fontFamily", "Oswald"));
  const weight = String(val("fontWeight", "400"));
  const weightName = WEIGHT_NAMES[weight] || weight;
  const currentText = isArc ? meta.text || "" : obj.text || "";
  const preview = String(currentText || family).trim().slice(0, 18) || "Aa";
  const fontSize = Math.round(val("fontSize", 36));
  const sizeOptions = SIZE_OPTIONS.some((o) => o.v === fontSize)
    ? SIZE_OPTIONS
    : [{ v: fontSize, label: `${fontSize}px` }, ...SIZE_OPTIONS];

  const applyFont = async (nextFamily) => {
    await loadFont(nextFamily);
    update({ fontFamily: nextFamily });
    setFontOpen(false);
  };

  const applyCase = (mode) => {
    const src = currentText;
    const next =
      mode === "upper"
        ? src.toUpperCase()
        : mode === "lower"
          ? src.toLowerCase()
          : src.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
    update({ text: next });
  };

  const setShape = (v) => {
    if (v === "straight") {
      if (!isArc) return;
      toggleTextCurve(canvas, obj);
    } else if (v === "curved") {
      if (isArc) return;
      toggleTextCurve(canvas, obj, { position: "top" });
    } else if (isArc) {
      if ((meta.position || "top") === v) return;
      update({ position: v });
      return;
    } else {
      toggleTextCurve(canvas, obj, { position: v });
    }
    commit();
    touch();
    useStampStore.getState().syncSelection();
  };

  const applyField = (id) => {
    const next = {
      ...(obj.stampMeta || {}),
      kind: "text",
      field: id,
      dateFormat: "DD MMM YYYY",
      serialPrefix: "NO. ",
      serialValue: 1,
      serialPad: 4,
    };
    if (id === "serial") {
      next.serialPrefix = obj.stampMeta?.serialPrefix ?? "NO. ";
      next.serialValue = obj.stampMeta?.serialValue ?? 1;
      next.serialPad = obj.stampMeta?.serialPad ?? 4;
    }
    obj.stampMeta = next;
    update({ text: fieldText(next) });
  };

  return (
    <div className="space-y-2">
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
              previewText={currentText}
              weight={weight}
            />
          </div>
        )}

        {/* Size (with inch quick picks) + thickness selectors */}
        <div className={`grid gap-1.5 ${isArc ? "grid-cols-1" : "grid-cols-2"}`}>
          {!isArc && (
            <select
              className="field"
              aria-label="Font size"
              title="Font size"
              value={String(fontSize)}
              onChange={(e) => update({ fontSize: Number(e.target.value) })}
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
            onChange={(e) => update({ fontWeight: e.target.value })}
          >
            {WEIGHTS.some((w) => w.v === weight) ? null : (
              <option value={weight}>{weight}</option>
            )}
            {WEIGHTS.map((w) => (
              <option key={w.v} value={w.v}>
                {w.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <textarea
        className="field resize-none"
        rows={2}
        aria-label="Selected text content"
        dir={rtl ? "rtl" : "ltr"}
        style={{ fontFamily: fabricFamily(family), fontWeight: weight, fontSize: 12, lineHeight: 1.4 }}
        value={currentText}
        onChange={(e) => update({ text: e.target.value }, { silent: true })}
        onBlur={() => commit()}
      />
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
        {!meta.field &&
          LIVE_FIELDS.map((f) => (
            <IconBtn
              key={f.id}
              label={`Insert ${f.id} field`}
              onClick={() => applyField(f.id)}
            >
              <f.icon size={15} />
            </IconBtn>
          ))}
      </div>

      {meta.field && (
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
                    obj.stampMeta = next;
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
                  obj.stampMeta = next;
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
                  obj.stampMeta = next;
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
                  obj.stampMeta = next;
                  update({ text: fieldText(next) }, { silent: true });
                }}
                onBlur={() => commit()}
              />
            </div>
          )}
        </>
      )}

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
              on={obj.fontStyle === "italic"}
              onClick={() => update({ fontStyle: obj.fontStyle === "italic" ? "normal" : "italic" })}
            >
              <Italic size={15} />
            </IconBtn>
            <IconBtn label="Underline" on={!!obj.underline} onClick={() => update({ underline: !obj.underline })}>
              <Underline size={15} />
            </IconBtn>
          </>
        )}
        {!isArc && (
          <>
            <IconBtn
              label="Align left"
              on={obj.textAlign === "left"}
              onClick={() => update({ textAlign: "left" })}
            >
              <AlignLeft size={15} />
            </IconBtn>
            <IconBtn
              label="Align center"
              on={obj.textAlign === "center"}
              onClick={() => update({ textAlign: "center" })}
            >
              <AlignCenter size={15} />
            </IconBtn>
            <IconBtn
              label="Align right"
              on={obj.textAlign === "right"}
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
                obj.set({ angle: 0 });
                update({ text: t });
              }}
            >
              <StretchHorizontal size={15} />
            </button>
          </Tooltip>
        )}
      </div>
    </div>
  );
}
