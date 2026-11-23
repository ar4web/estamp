import { useRef, useState } from "react";
import { Building2, Contrast, Eraser, Frame, ImagePlus, Loader2 } from "lucide-react";
import useStampStore from "../../store/useStampStore";
import { addImageFromFile, applyStampFilter, clipObjectToRing } from "../../utils/canvas";
import { removeImageBackground } from "../../utils/image";
import { Divider, IconBtn } from "../ui";

export default function ImageTool() {
  const inputRef = useRef(null);
  const [hover, setHover] = useState(false);
  const [loading, setLoading] = useState(false);
  const [autoFilter, setAutoFilter] = useState(true);
  const [fitRing, setFitRing] = useState(true);
  const [knockout, setKnockout] = useState(true);
  const company = useStampStore((s) => s.company);

  const handleFiles = async (files) => {
    const store = useStampStore.getState();
    const file = files?.[0];
    if (!file || !store.canvas) return;
    if (!/^image\//.test(file.type) && !/\.svg$/i.test(file.name)) {
      store.toast("Only PNG, JPG or SVG files are supported", "error");
      return;
    }
    setLoading(true);
    try {
      const obj = await addImageFromFile(store.canvas, file);
      if (knockout && obj.type === "image") {
        await removeImageBackground(store.canvas, obj);
      }
      if (autoFilter && obj.type === "image") {
        await applyStampFilter(store.canvas, obj, true);
      }
      if (fitRing) {
        try {
          await clipObjectToRing(store.canvas, obj);
        } catch (err) {
          store.toast(err.message, "info");
        }
      }
      store.commit();
      store.syncSelection();
      store.toast(`Imported ${file.name}`, "success");
    } catch (e) {
      store.toast(`Import failed: ${e.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        type="button"
        aria-label="Import a logo — PNG, JPG or SVG"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setHover(true);
        }}
        onDragLeave={() => setHover(false)}
        onDrop={(e) => {
          e.preventDefault();
          setHover(false);
          handleFiles(e.dataTransfer.files);
        }}
        className="mb-3 flex w-full cursor-pointer flex-col items-center gap-2 border-2 border-dashed px-3 py-6 text-center"
        style={{
          borderColor: hover ? "var(--accent)" : "var(--border-soft)",
          background: hover ? "var(--bg-btn-hover)" : "var(--bg-sunken)",
        }}
        title="Import a logo — PNG, JPG or SVG"
      >
        {loading ? (
          <Loader2 size={24} className="animate-spin" style={{ color: "var(--accent)" }} />
        ) : (
          <ImagePlus size={24} style={{ color: hover ? "var(--accent)" : "var(--text-dim)" }} />
        )}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/svg+xml"
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />

      {company?.logo ? (
        <IconBtn
          icon={Building2}
          label="Use company logo"
          onClick={async () => {
            const store = useStampStore.getState();
            try {
              const blob = await (await fetch(company.logo)).blob();
              const file = new File([blob], "company-logo.png", { type: blob.type || "image/png" });
              await handleFiles([file]);
            } catch (e) {
              store.toast(e.message, "error");
            }
          }}
        />
      ) : null}

      <Divider />

      <div className="grid grid-cols-3 gap-1.5">
        <IconBtn
          icon={Contrast}
          label="Stamp filter"
          hint="Grayscale + high contrast"
          active={autoFilter}
          onClick={() => setAutoFilter((v) => !v)}
        />
        <IconBtn
          icon={Eraser}
          label="Knock out background"
          hint="Drops the backdrop on import"
          active={knockout}
          onClick={() => setKnockout((v) => !v)}
        />
        <IconBtn
          icon={Frame}
          label="Fit to frame"
          hint="Center & clip inside the ring"
          active={fitRing}
          onClick={() => setFitRing((v) => !v)}
        />
      </div>
    </div>
  );
}
