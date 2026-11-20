import { useEffect, useRef, useState } from "react";
import {
  AlignVerticalSpaceAround,
  Check,
  ChevronDown,
  ChevronUp,
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

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
const round = (v, step) => {
  const d = (String(step).split(".")[1] || "").length;
  return Number(v.toFixed(d));
};

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

export function Fold({ title, hint, open = true, children }) {
  const [on, setOn] = useState(open);
  return (
    <section className="fold">
      <button
        type="button"
        className={`fold-head ${on ? "is-open" : ""}`}
        aria-expanded={on}
        onClick={() => setOn((v) => !v)}
      >
        <span className="label">{title}</span>
        <span className="fold-meta">
          {hint && <span className="fold-hint">{hint}</span>}
          {on ? <ChevronUp size={12} aria-hidden /> : <ChevronDown size={12} aria-hidden />}
        </span>
      </button>
      {on && <div className="fold-body">{children}</div>}
    </section>
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
 * One tight 28px row: label + icon | slim slider | scrubbable value.
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
  presets,
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
        className="slider-row"
        onDoubleClick={reset}
        title={resetValue !== undefined ? "Double-click to reset" : undefined}
      >
        <span className="slider-label" title={label}>
          {ResolvedIcon && <ResolvedIcon size={11} aria-hidden />}
          <span className="truncate">{label}</span>
        </span>
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
            {label}: {shown}{suffix}
          </span>
        )}
      </div>
      {!!presets?.length && (
        <div className="slider-presets">
          {presets.map((p) => (
            <button
              key={String(p.value)}
              type="button"
              className={`slider-chip ${Number(local) === Number(p.value) ? "is-on" : ""}`}
              onClick={() => apply(p.value)}
            >
              {p.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** Two related sliders side by side so the inspector needs less scrolling. */
export function SliderGrid({ children, className = "" }) {
  return <div className={`slider-grid ${className}`}>{children}</div>;
}

export function SegButton({ options, value, onChange, label }) {
  return (
    <div className="mb-3">
      {label && <div className="label mb-1.5">{label}</div>}
      <div
        className="flex border"
        style={{ borderColor: "var(--border-soft)", background: "var(--bg-sunken)" }}
        role="tablist"
      >
        {options.map((o, i) => {
          const on = value === o.value;
          return (
            <button
              type="button"
              key={o.value}
              role="tab"
              aria-selected={on}
              onClick={() => onChange(o.value)}
              title={o.title || o.label}
              className="flex flex-1 items-center justify-center gap-1 px-2 text-[10px] font-semibold"
              style={{
                minHeight: "var(--ctl-h)",
                background: on ? "var(--accent)" : "transparent",
                color: on ? "var(--on-accent)" : "var(--text-dim)",
                borderLeft: i ? "1px solid var(--border-soft)" : "none",
              }}
            >
              {o.icon || o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function Empty({ icon: Icon, title, hint }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-5 py-10 text-center">
      {Icon && <Icon size={24} style={{ color: "var(--text-dim)" }} />}
      <p className="text-[12px] font-semibold">{title}</p>
      {hint && (
        <p className="text-[10px] leading-relaxed" style={{ color: "var(--text-dim)" }}>
          {hint}
        </p>
      )}
    </div>
  );
}
