import { useEffect, useState } from "react";
import { Download, ImageIcon } from "lucide-react";
import { TEMPLATES, TEMPLATE_CATEGORIES } from "../../templates";
import { downloadURL, renderTemplateThumb } from "../../utils/canvas";
import { loadTemplate } from "../../utils/actions";
import useStampStore from "../../store/useStampStore";
import PresetTemplates from "./PresetTemplates";
import CompactHead from "./CompactHead";

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
export function TemplateCard({ tpl, thumb, onClick, large }) {
  const toast = useStampStore((s) => s.toast);

  const quickExport = async (e) => {
    e.stopPropagation();
    try {
      const url = thumb || (await renderTemplateThumb(tpl, 1200));
      downloadURL(url, `template-${tpl.id}.png`);
      toast(`Downloaded ${tpl.name}`, "success");
    } catch (err) {
      toast(`Export failed: ${err.message}`, "error");
    }
  };

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

      {/* quick PNG download without loading the template */}
      <button
        type="button"
        onClick={quickExport}
        title="Download this template as PNG"
        aria-label={`Download ${tpl.name} as PNG`}
        className="absolute right-0.5 top-0.5 grid h-5 w-5 place-items-center border opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
        style={{
          background: "var(--bg-panel)",
          borderColor: "var(--border)",
          color: "var(--text-dim)",
        }}
      >
        <Download size={10} />
      </button>

      {tpl.logo && (
        <span
          className="absolute left-0.5 top-0.5 flex items-center gap-0.5 border px-0.5 text-[8px] font-semibold uppercase"
          style={{
            background: "var(--bg-panel)",
            borderColor: "var(--accent)",
            color: "var(--accent)",
          }}
        >
          <ImageIcon size={7} /> Logo
        </span>
      )}

      <div className="border-t px-1 py-1" style={{ borderColor: "var(--border-soft)" }}>
        <p
          className={`truncate font-semibold ${large ? "text-[11px]" : "text-[9px]"}`}
          title={tpl.name}
        >
          {tpl.name}
        </p>
        {large && (
          <p className="truncate text-[10px]" style={{ color: "var(--text-dim)" }}>
            {tpl.tags?.join(" · ")}
          </p>
        )}
      </div>
    </div>
  );
}

export default function TemplateGallery() {
  const thumbs = useTemplateThumbs();

  // Compact grouped sections — three templates per row.
  return (
    <div className="space-y-2">
      {TEMPLATE_CATEGORIES.map((cat) => {
        const items = TEMPLATES.filter((t) => t.cat === cat);
        if (!items.length) return null;
        return (
          <section key={cat}>
            <CompactHead title={cat} />
            <div className="grid grid-cols-3 gap-1.5">
              {items.map((tpl) => (
                <TemplateCard
                  key={tpl.id}
                  tpl={tpl}
                  thumb={thumbs[tpl.id]}
                  onClick={() => loadTemplate(tpl)}
                />
              ))}
            </div>
          </section>
        );
      })}

      {/* Additional stamp presets */}
      <PresetTemplates />
    </div>
  );
}
