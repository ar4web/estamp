import { useEffect, useState } from "react";
import { Image as ImageIcon } from "lucide-react";
import { TEMPLATES } from "../../templates";
import { renderTemplateThumb } from "../../utils/canvas";
import { loadTemplate } from "../../utils/actions";
import PresetTemplates from "./PresetTemplates";

const cache = new Map();

export function useTemplateThumbs(list = TEMPLATES) {
  const [thumbs, setThumbs] = useState(() => Object.fromEntries(cache));

  useEffect(() => {
    let alive = true;
    const pending = list.filter((t) => !cache.has(t.id));
    if (!pending.length) return;
    (async () => {
      // CRITICAL: wait for fonts first, otherwise text is measured with
      // fallback metrics and every preview renders misaligned forever.
      try {
        if (document.fonts?.ready) {
          await Promise.race([
            document.fonts.ready,
            new Promise((r) => setTimeout(r, 2500)),
          ]);
        }
      } catch { /* continue anyway */ }
      for (const tpl of pending) {
        if (!alive) return;
        try {
          const url = await renderTemplateThumb(tpl);
          cache.set(tpl.id, url);
          if (alive) setThumbs((prev) => ({ ...prev, [tpl.id]: url }));
        } catch (e) {
          console.warn("thumb failed", tpl.id, e);
        }
      }
    })();
    return () => {
      alive = false;
    };
  }, [list]);

  return thumbs;
}

/** Compact card: three of these fit on one row of the 300px drawer. */
export function TemplateCard({ tpl, thumb, onClick }) {
  return (
    <div
      className="group relative overflow-hidden border"
      style={{ borderColor: "var(--border-soft)", background: "var(--bg-sunken)" }}
    >
      <button
        type="button"
        onClick={onClick}
        aria-label={`Use ${tpl.name} template`}
        title={tpl.name}
        className="block w-full"
      >
        <span
          className="checkerboard grid aspect-square w-full place-items-center p-1"
          style={{ backgroundSize: "10px 10px" }}
        >
          {thumb ? (
            <img
              src={thumb}
              alt={tpl.name}
              className="h-full w-full object-contain transition-transform duration-150 group-hover:scale-[1.04]"
              loading="lazy"
            />
          ) : (
            <span
              className="h-2.5 w-2.5 animate-pulse"
              style={{ background: "var(--border)" }}
            />
          )}
        </span>
      </button>

      {tpl.logo && (
        <span
          className="absolute left-0.5 top-0.5 grid h-5 w-5 place-items-center border"
          style={{
            background: "var(--bg-panel)",
            borderColor: "var(--accent)",
            color: "var(--accent)",
          }}
          title="Has a logo slot"
          aria-label="Template includes a logo slot"
        >
          <ImageIcon size={11} />
        </span>
      )}
    </div>
  );
}

export default function TemplateGallery() {
  const thumbs = useTemplateThumbs();

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-3 gap-1.5">
        {TEMPLATES.map((tpl) => (
          <TemplateCard
            key={tpl.id}
            tpl={tpl}
            thumb={thumbs[tpl.id]}
            onClick={() => loadTemplate(tpl)}
          />
        ))}
      </div>

      <PresetTemplates />
    </div>
  );
}
