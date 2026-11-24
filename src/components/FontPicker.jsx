import { useEffect, useMemo, useRef, useState } from "react";
import { LayoutGrid } from "lucide-react";
import { FONT_SETS, fabricFamily, loadFont } from "../utils/fonts";

// Per-script fallback glyphs, used when the text box is empty.
const SAMPLE = {
  Latin: "Aa",
  Cyrillic: "Аа",
  Arabic: "أب",
  CJK: "字",
  Devanagari: "अ",
  Thai: "กข",
};

const SCRIPT_OF = Object.fromEntries(
  FONT_SETS.flatMap((g) => g.fonts.map((f) => [f, g.script]))
);

// Icon-only script filter: one glyph per script + a grid for "All".
// Internal ids stay text ("All"/"Arabic"/...) so autoScriptTransition keeps working.
const FILTERS = [
  { id: "All", glyph: <LayoutGrid size={13} strokeWidth={1.75} aria-hidden />, name: "All scripts" },
  { id: "Arabic", glyph: "ع", name: "Arabic" },
  { id: "Latin", glyph: "A", name: "Latin" },
  { id: "Cyrillic", glyph: "Д", name: "Cyrillic" },
  { id: "CJK", glyph: "字", name: "Chinese, Japanese, Korean" },
];
const ARABIC_RE = /[\u0600-\u06FF]/;

export const isArabicText = (text) => ARABIC_RE.test(String(text || ""));

/** Returns the filter to auto-select on a script transition, or null to keep it. */
export function autoScriptTransition(wasArabic, arabic) {
  if (arabic && !wasArabic) return "Arabic";
  if (!arabic && wasArabic) return "All";
  return null;
}

export function fontScript(family) {
  return SCRIPT_OF[family] || "Uploaded";
}

export function fontSample(family) {
  return SAMPLE[SCRIPT_OF[family]] || "Aa";
}

/** One full-width charcoal card: name pinned left, live preview pinned right. */
export function FontRow({ family, selected, preview, weight, onSelect }) {
  useEffect(() => {
    loadFont(family);
  }, [family]);

  return (
    <button
      type="button"
      className={`font-row ${selected ? "is-on" : ""}`}
      aria-pressed={selected}
      aria-label={`Use ${family} font`}
      title={family}
      onClick={() => onSelect(family)}
      style={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 10,
        width: "100%",
        minWidth: 0,
        minHeight: 34,
        padding: "6px 10px",
        boxSizing: "border-box",
        textAlign: "left",
        cursor: "pointer",
      }}
    >
      <span
        className="font-row-name"
        style={{
          flex: "0 1 auto",
          minWidth: 0,
          maxWidth: "45%",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {family}
      </span>
      <span
        className="font-row-preview"
        dir="auto"
        aria-hidden="true"
        style={{
          flex: "1 1 auto",
          minWidth: 0,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          textAlign: "right",
          fontFamily: fabricFamily(family),
          fontWeight: Number(weight) || 400,
        }}
      >
        {preview || fontSample(family)}
      </span>
    </button>
  );
}

/**
 * Compact single-column font list.
 *
 * `previewText` is the live text from the Type input; when it is empty each
 * row falls back to a short sample in its own script. `weight` mirrors the
 * Rg / Bd / Blk buttons so every preview shows the selected weight.
 *
 * Typing Arabic (e.g. الرياض) auto-selects the Arabic filter; switching back
 * to non-Arabic text restores All. Only the transition triggers the switch,
 * so a manual script choice is never overridden on every keystroke.
 */
export default function FontPicker({
  fonts,
  value,
  onSelect,
  previewText = "",
  weight = "700",
  grouped = false,
}) {
  void grouped;
  const [script, setScript] = useState(() =>
    isArabicText(previewText) ? "Arabic" : "All"
  );
  const wasArabic = useRef(isArabicText(previewText));

  useEffect(() => {
    const arabic = isArabicText(previewText);
    const next = autoScriptTransition(wasArabic.current, arabic);
    if (next) setScript(next);
    wasArabic.current = arabic;
  }, [previewText]);

  const list = useMemo(() => {
    const all = [...new Set(fonts || [])];
    return script === "All" ? all : all.filter((f) => fontScript(f) === script);
  }, [fonts, script]);

  const preview = String(previewText || "").trim();

  return (
    <>
      <div
        className="font-scripts"
        role="group"
        aria-label="Filter fonts by script"
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: 6,
          marginBottom: 6,
          overflowX: "auto",
          scrollbarWidth: "none",
        }}
      >
        {FILTERS.map((s) => {
          const on = script === s.id;
          return (
            <button
              key={s.id}
              type="button"
              className={`font-script font-script-glyph ${on ? "is-on" : ""}`}
              aria-pressed={on}
              aria-label={s.name}
              title={s.name}
              onClick={() => setScript(s.id)}
              style={{
                flex: "0 0 auto",
                minWidth: 26,
                minHeight: 22,
                display: "grid",
                placeItems: "center",
                padding: "2px 4px",
                fontSize: 13,
                lineHeight: 1,
                cursor: "pointer",
              }}
            >
              {s.glyph}
            </button>
          );
        })}
      </div>

      <div
        className="font-list"
        role="group"
        aria-label="Fonts"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 4,
          maxHeight: 320,
          overflowY: "auto",
        }}
      >
        {list.length ? (
          list.map((family) => (
            <FontRow
              key={family}
              family={family}
              selected={value === family}
              preview={preview}
              weight={weight}
              onSelect={onSelect}
            />
          ))
        ) : (
          <p className="font-empty">No fonts in this script.</p>
        )}
      </div>
    </>
  );
}
