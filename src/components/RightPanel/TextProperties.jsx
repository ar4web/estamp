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
  FlipHorizontal,
  FlipVertical,
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
import { Slider } from "../ui";
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
  { v: "400", label: "Rg" },
  { v: "700", label: "Bd" },
  { v: "900", label: "Blk" },
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
  const weightLabel = ({ 400: "Rg", 700: "Bd", 900: "Blk" })[weight] || weight;
  const currentText = isArc ? meta.text || "" : obj.text || "";
  const preview = String(currentText || family).trim().slice(0, 18) || "Aa";

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
          aria-label={`Font ${family}, weight ${weightLabel}. Open font list`}
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
        <div className="weight-grid compact" aria-label="Font weight">
          {WEIGHTS.map((w) => (
            <button
              key={w.v}
              type="button"
              className={`btn text-[10px] ${weight === w.v ? "btn-on" : ""}`}
              aria-pressed={weight === w.v}
              onClick={() => update({ fontWeight: w.v })}
            >
              {w.label}
            </button>
          ))}
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
        <IconBtn
          label="Flip horizontal"
          on={!!obj.flipX}
          onClick={() => {
            obj.set({ flipX: !obj.flipX });
            obj.setCoords();
            canvas.requestRenderAll();
            commit();
            touch();
          }}
        >
          <FlipHorizontal size={15} />
        </IconBtn>
        <IconBtn
          label="Flip vertical"
          on={!!obj.flipY}
          onClick={() => {
            obj.set({ flipY: !obj.flipY });
            obj.setCoords();
            canvas.requestRenderAll();
            commit();
            touch();
          }}
        >
          <FlipVertical size={15} />
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
      </div>

      <Slider
        label="Size"
        value={val("fontSize", 36)}
        min={6}
        max={160}
        onChange={(v) => update({ fontSize: v })}
        suffix="px"
        resetValue={36}
      />
      {!isArc && (
        <Slider
          label="Height"
          value={Math.round((obj.scaleY ?? 1) * 100)}
          min={50}
          max={250}
          step={5}
          onChange={(v) => update({ scaleY: v / 100 })}
          suffix="%"
          resetValue={100}
        />
      )}

      {isArc ? (
        <>
          <Slider
            label="Radius"
            value={meta.radius ?? 200}
            min={50}
            max={300}
            onChange={(v) => update({ radius: v })}
            suffix="px"
            resetValue={200}
          />
          <Slider
            label="Spread"
            value={meta.letterSpacing ?? 2}
            min={-5}
            max={30}
            step={0.5}
            onChange={(v) => update({ letterSpacing: v })}
            resetValue={2}
          />
          <Tooltip label="Balance arc ends" side="top">
            <button
              type="button"
              className="btn w-full"
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
        </>
      ) : (
        <>
          {!rtl && (
            <Slider
              label="Track"
              value={obj.charSpacing ?? 0}
              min={-100}
              max={800}
              step={10}
              onChange={(v) => update({ charSpacing: v })}
              resetValue={0}
              format={(v) => `${v > 0 ? "+" : ""}${v}`}
            />
          )}
          <Slider
            label="Leading"
            value={obj.lineHeight ?? 1.16}
            min={0.6}
            max={2.5}
            step={0.02}
            onChange={(v) => update({ lineHeight: v })}
            resetValue={1.16}
          />
        </>
      )}
    </div>
  );
}
