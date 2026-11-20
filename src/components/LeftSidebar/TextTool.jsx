import { useEffect, useMemo, useRef, useState } from "react";
import { Plus } from "lucide-react";
import useStampStore from "../../store/useStampStore";
import { CANVAS_SIZE, createSpecObject } from "../../utils/canvas";
import { addObject } from "../../utils/actions";
import { FONT_SETS, fontForScript, getCustomFonts, loadFont } from "../../utils/fonts";
import { isRTL } from "../../utils/arabic";
import { TEXT_PHRASES } from "../../utils/phrases";
import { Fold } from "../ui";
import FontPicker from "../FontPicker";

const NEW_TEXT_WEIGHT = "700";

const FONT_BUTTONS = [
  ...FONT_SETS.find((s) => s.script === "Latin").fonts.slice(0, 8),
  ...FONT_SETS.find((s) => s.script === "Arabic").fonts,
];

const QUICK_PHRASES = [
  ...TEXT_PHRASES[0].items,
  ...TEXT_PHRASES[1].items.slice(0, 4),
  ...TEXT_PHRASES[2].items.slice(0, 3),
];

export default function TextTool() {
  const inkColor = useStampStore((s) => s.inkColor);
  const toast = useStampStore((s) => s.toast);
  const [text, setText] = useState("الرياض");
  const [font, setFont] = useState("Cairo");
  const inputRef = useRef(null);
  const fonts = useMemo(
    () => [...getCustomFonts(), ...FONT_SETS.flatMap((g) => g.fonts)],
    []
  );

  const rtl = isRTL(text);

  // The left panel is for inserting new text only. Selected-layer editing lives
  // in the right Properties panel, so there is no duplicate content/weight UI.
  const applyFont = async (family) => {
    await loadFont(family);
    setFont(family);
  };

  const choosePhrase = async (phrase) => {
    setText(phrase);
    if (isRTL(phrase)) await applyFont("Cairo");
    inputRef.current?.focus();
  };

  const add = async () => {
    const value = (text || "TEXT").trim();
    const family = font || fontForScript(value);
    await loadFont(family);
    addObject(
      createSpecObject({
        type: "text",
        text: value,
        fontSize: 44,
        fontFamily: family,
        fontWeight: NEW_TEXT_WEIGHT,
        charSpacing: isRTL(value) ? 0 : 60,
        fill: inkColor,
        cx: CANVAS_SIZE / 2,
        cy: CANVAS_SIZE / 2,
        w: Math.max(220, Math.min(520, (value.length || 6) * 34)),
      })
    );
    toast("Text added to canvas", "success");
  };

  useEffect(() => {
    FONT_BUTTONS.forEach((f) => loadFont(f));
  }, []);

  return (
    <div>
      <Fold title="Type" hint="add to canvas" open>
        <div className="tool-add mb-2">
          <input
            ref={inputRef}
            className="field"
            aria-label="Text content"
            dir={rtl ? "rtl" : "ltr"}
            style={{ fontFamily: font, fontWeight: NEW_TEXT_WEIGHT, textAlign: rtl ? "right" : "left" }}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                add();
              }
            }}
            placeholder="Type a name…"
          />
          <button type="button" className="btn btn-accent" aria-label="Add text to canvas" onClick={add}>
            <Plus size={16} />
          </button>
        </div>

        <FontPicker
          fonts={fonts}
          value={font}
          onSelect={applyFont}
          previewText={text}
          weight={NEW_TEXT_WEIGHT}
        />
      </Fold>

      <Fold title="Phrases" open>
        <div className="chip-grid compact">
          {QUICK_PHRASES.map((ph) => (
            <button
              key={ph}
              type="button"
              className="btn"
              dir="auto"
              aria-label={`Use phrase ${ph}`}
              onClick={() => choosePhrase(ph)}
            >
              {ph}
            </button>
          ))}
        </div>
      </Fold>
    </div>
  );
}
