import { useState } from "react";
import { Droplet, Droplets, RotateCcw, Scroll, Waves, Zap } from "lucide-react";
import useStampStore from "../../store/useStampStore";
import { applyInkTexture, removeInkTexture, selectionKind } from "../../utils/canvas";
import { IconBtn } from "../ui";

const PRESETS = [
  { label: "Light distress", hint: "25% ink wear", icon: Droplet, amount: 25, mode: "distress" },
  { label: "Medium distress", hint: "45% ink wear", icon: Droplets, amount: 45, mode: "distress" },
  { label: "Heavy distress", hint: "70% ink wear", icon: Waves, amount: 70, mode: "distress" },
  { label: "Rough edges", hint: "Hand-cut border", icon: Zap, amount: 55, mode: "rough" },
  { label: "Aged paper", hint: "Old, faded ink", icon: Scroll, amount: 50, mode: "aged" },
];

export default function DistressTool() {
  const selected = useStampStore((s) => s.selected);
  const canvas = useStampStore((s) => s.canvas);
  const commit = useStampStore((s) => s.commit);
  const syncSelection = useStampStore((s) => s.syncSelection);
  const toast = useStampStore((s) => s.toast);
  const [busy, setBusy] = useState(false);
  const kind = selectionKind(selected);
  const isTextured = kind === "textured";

  const apply = async (amount, mode = "distress") => {
    if (!selected || !canvas) {
      toast("Select a layer first", "info");
      return;
    }
    setBusy(true);
    try {
      await applyInkTexture(canvas, selected, amount, mode);
      commit();
      syncSelection();
      const names = { distress: "distress", rough: "rough edge", aged: "aged paper" };
      toast(`Applied ${names[mode]} at ${amount}%`, "success");
    } catch (err) {
      toast(`Effect failed: ${err.message}`, "error");
    } finally {
      setBusy(false);
    }
  };

  const clean = async () => {
    if (!selected || !canvas) return;
    setBusy(true);
    try {
      await removeInkTexture(canvas, selected);
      commit();
      syncSelection();
      toast("Restored clean vector", "info");
    } catch (err) {
      toast(`Restore failed: ${err.message}`, "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-5 gap-1.5">
        {PRESETS.map((p) => (
          <IconBtn
            key={p.label}
            icon={p.icon}
            label={p.label}
            hint={p.hint}
            disabled={busy}
            onClick={() => apply(p.amount, p.mode)}
          />
        ))}
      </div>
      {isTextured && (
        <IconBtn
          icon={RotateCcw}
          label="Restore clean vector"
          hint="Undo the texture"
          disabled={busy}
          onClick={clean}
          size={15}
        />
      )}
    </div>
  );
}
