import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Circle,
  Egg,
  Italic,
  RectangleHorizontal,
  RefreshCw,
  StretchHorizontal,
} from "lucide-react";
import useStampStore from "../../store/useStampStore";
import { renderTemplateThumb, selectionKind } from "../../utils/canvas";
import {
  applyMarkLook,
  fieldLookSpecs,
  loadTemplate,
  markLookSpecs,
  stampLookSpecs,
} from "../../utils/actions";
import { fontForScript, loadFont } from "../../utils/fonts";
import { isRTL } from "../../utils/arabic";
import { DATE_FORMATS } from "../../utils/fields";
import {
  FIELD_LOOKS,
  FIELD_STAMPS,
  MARK_LOOKS,
  OFFICE_MARKS,
  STAMP_LOOKS,
} from "../../utils/phrases";
import { Divider, IconBtn } from "../ui";
import StampCard from "./StampCard";

// Icon for each custom mark frame / live-field frame.
const LOOK_ICONS = {
  round: Circle,
  oval: Egg,
  rect: RectangleHorizontal,
  dated: CalendarDays,
  banner: StretchHorizontal,
  slant: Italic,
};

async function waitFonts() {
  await Promise.all([
    loadFont("Oswald"),
    loadFont("Roboto Mono"),
    loadFont("Cairo"),
    loadFont("Amiri"),
  ]);
  if (document.fonts?.ready) {
    await Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1500))]);
  }
}

/**
 * Stamp presets that used to sit in the Text tab. They are ordinary template
 * objects (id + name + build), so clicking one behaves exactly like any other
 * template in this gallery: full canvas replace, undoable, editable layers.
 */
export default function PresetTemplates() {
  const ink = useStampStore((s) => s.inkColor);
  const selected = useStampStore((s) => s.selected);
  const refreshFields = useStampStore((s) => s.refreshFields);

  const [word, setWord] = useState("ESTAMP");
  const [fieldLook, setFieldLook] = useState("");
  const [dateFormat, setDateFormat] = useState("DD MMM YYYY");
  const [thumbs, setThumbs] = useState({});

  // Prefer the text of whatever is selected on the canvas, like the old
  // Text tab did; otherwise use the word typed above.
  const kind = selectionKind(selected);
  const selText =
    kind === "arc" ? selected?.stampMeta?.text || "" : kind === "text" ? selected?.text || "" : "";
  const sample = (selText || word).trim() || "ESTAMP";
  const font = fontForScript(sample);

  const looks = useMemo(
    () =>
      STAMP_LOOKS.map((l) => ({
        id: `preset-look-${l.id}`,
        name: l.label,
        label: l.label,
        build: () => stampLookSpecs(sample, l.id, ink, font),
      })),
    [sample, ink, font]
  );

  const marks = useMemo(
    () =>
      OFFICE_MARKS.map((m) => ({
        id: `preset-mark-${m.word}`,
        name: m.word,
        label: m.word,
        build: () => markLookSpecs(m.word, m.look, ink, "Oswald"),
      })),
    [ink]
  );

  const fields = useMemo(
    () =>
      FIELD_STAMPS.map((f) => ({
        id: `preset-field-${f.id}`,
        name: f.label,
        label: f.label,
        build: () => fieldLookSpecs(f.id, fieldLook || f.look, ink, dateFormat),
      })),
    [ink, fieldLook, dateFormat]
  );

  const all = useMemo(() => [...looks, ...marks, ...fields], [looks, marks, fields]);

  // Thumbnails are regenerated when the word / ink / date options change.
  useEffect(() => {
    let alive = true;
    const timer = setTimeout(async () => {
      await waitFonts();
      if (!alive) return;
      const next = {};
      for (const tpl of all) {
        if (!alive) return;
        try {
          next[tpl.id] = await renderTemplateThumb(tpl, 140, ink);
        } catch {
          next[tpl.id] = null;
        }
      }
      if (alive) setThumbs(next);
    }, 180);
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [all, ink]);

  return (
    <div className="mt-3 space-y-2.5">
      <div className="tool-add">
        <input
          className="field"
          aria-label="Word used by the text looks"
          dir={isRTL(word) ? "rtl" : "ltr"}
          style={{ fontFamily: font, fontWeight: 700 }}
          value={word}
          onChange={(e) => setWord(e.target.value)}
          placeholder="ESTAMP"
        />
      </div>
      <div className="stamp-grid compact">
        {looks.map((tpl) => (
          <StampCard
            key={tpl.id}
            thumb={thumbs[tpl.id]}
            label={tpl.label}
            title={`${tpl.label} — ${sample}`}
            onClick={() => loadTemplate(tpl)}
          />
        ))}
      </div>

      <Divider />

      <div className="stamp-grid compact">
        {marks.map((tpl) => (
          <StampCard
            key={tpl.id}
            thumb={thumbs[tpl.id]}
            label={tpl.label}
            onClick={() => loadTemplate(tpl)}
          />
        ))}
      </div>
      <div className="grid grid-cols-6 gap-1.5">
        {MARK_LOOKS.map((item) => (
          <IconBtn
            key={item.id}
            icon={LOOK_ICONS[item.id] || Circle}
            label={`Apply ${item.label} frame`}
            onClick={async () => {
              await waitFonts();
              applyMarkLook(sample, item.id, ink, "Oswald");
            }}
          />
        ))}
      </div>

      <Divider />

      <div className="stamp-grid compact">
        {fields.map((tpl) => (
          <StampCard
            key={tpl.id}
            thumb={thumbs[tpl.id]}
            label={tpl.label}
            onClick={() => loadTemplate(tpl)}
          />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-1.5">
        {FIELD_LOOKS.map((item) => (
          <IconBtn
            key={item.id}
            icon={LOOK_ICONS[item.id] || Circle}
            label={`Use ${item.label} live-field frame`}
            active={fieldLook === item.id}
            onClick={() => setFieldLook(fieldLook === item.id ? "" : item.id)}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-1">
        {DATE_FORMATS.map((f) => (
          <button
            key={f.id}
            type="button"
            className={`btn ${dateFormat === f.id ? "btn-on" : ""}`}
            aria-pressed={dateFormat === f.id}
            title={`Date format ${f.id}`}
            onClick={() => setDateFormat(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>
      <IconBtn icon={RefreshCw} label="Refresh live fields" onClick={() => refreshFields()} />
    </div>
  );
}
