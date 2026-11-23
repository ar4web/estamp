import { useEffect, useRef, useState } from "react";
import {
  AlignVerticalSpaceAround,
  Check,
  ChevronsLeftRight,
  Circle,
  Droplet,
  Frame,
  MoveVertical,
  RotateCw,
  Ruler,
  Scaling,
  Type,
} from "lucide-react";
import Tooltip from "./Tooltip";

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
const round = (v, step) => {
  const d = (String(step).split(".")[1] || "").length;
  return Number(v.toFixed(d));
};

/**
 * Icon-only button with a hover/focus tooltip — the shared primitive for the
 * icon-first tool panels. The visible UI carries no text; the tooltip and the
 * aria-label do the labelling.
 */
export function IconBtn({
  icon: Icon,
  label,
  hint,
  onClick,
  active,
  side = "top",
  size = 16,
  disabled,
  className = "",
}) {
  return (
    <Tooltip label={label} hint={hint} side={side} className="w-full">
      <button
        type="button"
        className={`tool-icon-btn ${active ? "is-on" : ""} ${className}`}
        aria-label={label}
        aria-pressed={active ?? undefined}
        disabled={disabled}
        onClick={onClick}
      >
        <Icon size={size} strokeWidth={1.75} aria-hidden />
      </button>
    </Tooltip>
  );
}

/** Hairline separator used to break icon-only panels into groups. */
export function Divider() {
  return <div className="tool-divider" role="separator" aria-hidden />;
}

export function Row({ label, hint, children, className = "" }) {
  return (
    <div className={`mb-2 min-w-0 ${className}`}>
      {label && (
        <div className="mb-1.5 flex min-h-4 items-center justify-between gap-2">
          <span className="label">{label}</span>
          {hint && (
            <span className="shrink-0 text-[9px] font-medium" style={{ color: "var(--text-mute)" }}>
              {hint}
            </span>
          )}
        </div>
      )}
      {children}
    </div>
  );
}

/** Square checkbox matching the design system. */
export function Checkbox({ label, checked, onChange, hint }) {
  return (
    <div className="mb-3">
      <button
        type="button"
        role="checkbox"
        aria-checked={!!checked}
        onClick={() => onChange(!checked)}
        className="flex min-h-8 w-full items-center gap-2.5 text-left"
      >
        <span
          className="grid h-5 w-5 shrink-0 place-items-center border"
          style={{
            background: checked ? "var(--accent)" : "var(--bg-sunken)",
            borderColor: checked ? "var(--accent)" : "var(--border-soft)",
          }}
        >
            {checked && <Check size={12} color="var(--on-accent)" strokeWidth={3} aria-hidden />}
        </span>
        <span className="text-[11px] font-medium leading-snug">{label}</span>
      </button>
      {hint && (
        <p className="mt-1 pl-8 text-[10px] leading-relaxed" style={{ color: "var(--text-dim)" }}>
          {hint}
        </p>
      )}
    </div>
  );
}

/** Compact value box: type, arrow keys, or drag horizontally to scrub. */
function CompactNumber({ value, min, max, step, onChange, suffix, label }) {
  const [draft, setDraft] = useState(String(value ?? ""));
  const [editing, setEditing] = useState(false);

  // While scrubbing, the parent pushes new values; follow them unless the
  // user is actively typing (otherwise a blur would restore a stale draft).
  useEffect(() => {
    if (!editing) setDraft(String(value ?? ""));
  }, [value, editing]);

  const commit = (raw) => {
    const n = parseFloat(raw);
    if (Number.isNaN(n)) return setDraft(String(value ?? ""));
    const next = round(clamp(n, min, max), step);
    setDraft(String(next));
    onChange(next);
  };

  const bump = (dir, e) => {
    const mult = e?.shiftKey ? 10 : 1;
    const next = round(clamp((Number(value) || 0) + dir * step * mult, min, max), step);
    setDraft(String(next));
    onChange(next);
  };

  return (
    <input
      type="number"
      aria-label={label}
      className="slider-num-input"
      value={draft}
      step={step}
      onChange={(e) => {
        setEditing(true);
        setDraft(e.target.value);
      }}
      onBlur={(e) => {
        setEditing(false);
        commit(e.target.value);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          commit(e.currentTarget.value);
          e.currentTarget.blur();
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          bump(1, e);
        } else if (e.key === "ArrowDown") {
          e.preventDefault();
          bump(-1, e);
        }
      }}
      title={suffix ? `Value in ${suffix} · drag to scrub` : "Drag to scrub"}
    />
  );
}

const SLIDER_ICONS = {
  Size: Type,
  Height: MoveVertical,
  Track: ChevronsLeftRight,
  Leading: AlignVerticalSpaceAround,
  Radius: Circle,
  Spread: ChevronsLeftRight,
  Scale: Scaling,
  Angle: RotateCw,
  Opacity: Droplet,
  "Stroke width": Ruler,
  "Corner radius": Frame,
};

/**
 * One tight 28px row: icon | slim slider | scrubbable value.
 * Icon-only — no visible label; the icon + aria-label + tooltip carry meaning.
 * Optional preset chips, double-click reset, live badge while dragging.
 */
export function Slider({
  label,
  value,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  suffix = "",
  debounce = 60,
  icon: Icon,
  resetValue,
  format,
}) {
  const [local, setLocal] = useState(value);
  const [dragging, setDragging] = useState(false);
  const timer = useRef(null);
  const draggingRef = useRef(false);
  const scrub = useRef(null);
  const lastCommitted = useRef(value);
  const ResolvedIcon = Icon || SLIDER_ICONS[label];

  useEffect(() => {
    if (!draggingRef.current) {
      setLocal(value);
      lastCommitted.current = value;
    }
  }, [value]);
  useEffect(() => () => clearTimeout(timer.current), []);

  const commitValue = (v) => {
    draggingRef.current = false;
    if (lastCommitted.current !== v) {
      lastCommitted.current = v;
      onChange(v);
    }
  };

  const apply = (v, keepBadge = false) => {
    clearTimeout(timer.current);
    setLocal(v);
    if (!keepBadge) setDragging(false);
    commitValue(v);
  };

  const drag = (v) => {
    setLocal(v);
    draggingRef.current = true;
    setDragging(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => commitValue(v), debounce);
  };

  const finishDrag = (e) => {
    const v = Number(e.currentTarget.value);
    clearTimeout(timer.current);
    setLocal(v);
    setDragging(false);
    commitValue(v);
  };

  const reset = () => {
    if (resetValue !== undefined) apply(resetValue);
  };

  const startScrub = (e) => {
    if (e.button !== 0) return;
    const startX = e.clientX;
    const startVal = Number(local) || 0;
    scrub.current = { startX, startVal, moved: false };
    const onMove = (ev) => {
      if (!scrub.current) return;
      const dx = ev.clientX - scrub.current.startX;
      if (!scrub.current.moved && Math.abs(dx) < 4) return;
      scrub.current.moved = true;
      ev.preventDefault();
      setDragging(true);
      const mult = ev.shiftKey ? 10 : 1;
      const next = round(
        clamp(scrub.current.startVal + Math.round(dx / 3) * step * mult, min, max),
        step
      );
      apply(next, true);
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      if (scrub.current?.moved && document.activeElement?.blur) {
        document.activeElement.blur();
      }
      scrub.current = null;
      setDragging(false);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  const shown = format ? format(local) : `${local}`;

  return (
    <div className="slider-control">
      <div
        className="slider-row slider-row-icon"
        onDoubleClick={reset}
        title={resetValue !== undefined ? `${label} — double-click to reset` : label}
      >
        <Tooltip label={label} side="top" delay={150}>
          <span className="slider-label slider-icon" aria-hidden>
            {ResolvedIcon ? <ResolvedIcon size={13} /> : null}
          </span>
        </Tooltip>
        <input
          type="range"
          aria-label={label}
          min={min}
          max={max}
          step={step}
          value={local}
          onChange={(e) => drag(Number(e.target.value))}
          onPointerDown={() => setDragging(true)}
          onPointerUp={finishDrag}
          onPointerCancel={finishDrag}
          onBlur={finishDrag}
        />
        <div className="slider-num" onPointerDown={startScrub}>
          <CompactNumber
            value={local}
            min={min}
            max={max}
            step={step}
            onChange={apply}
            suffix={suffix}
            label={label}
          />
        </div>
        {dragging && (
          <span className="slider-badge" role="status">
            {shown}{suffix}
          </span>
        )}
      </div>
    </div>
  );
}

