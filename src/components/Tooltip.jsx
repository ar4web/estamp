import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import useStampStore from "../store/useStampStore";

const GAP = 8;
const FALLBACK_W = 140;
const FALLBACK_H = 28;

function mapSide(side) {
  if (!side) return "top";
  if (side === "top-right" || side === "top-left") return "top";
  if (side === "bottom-right" || side === "bottom-left") return "bottom";
  return side;
}

function place(side, trigger, tip) {
  const r = trigger.getBoundingClientRect();
  const w = tip?.offsetWidth || FALLBACK_W;
  const h = tip?.offsetHeight || FALLBACK_H;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  let left;
  let top;
  switch (side) {
    case "right":
      left = r.right + GAP;
      top = r.top + r.height / 2 - h / 2;
      break;
    case "left":
      left = r.left - w - GAP;
      top = r.top + r.height / 2 - h / 2;
      break;
    case "bottom":
      left = r.left + r.width / 2 - w / 2;
      top = r.bottom + GAP;
      break;
    default:
      left = r.left + r.width / 2 - w / 2;
      top = r.top - h - GAP;
  }
  if (left + w > vw - 8) left = Math.max(8, vw - w - 8);
  if (left < 8) left = 8;
  if (top + h > vh - 8) top = Math.max(8, r.top - h - GAP);
  if (top < 8) top = Math.min(r.bottom + GAP, vh - h - 8);
  return { left, top };
}

export default function Tooltip({
  label,
  hint,
  shortcut,
  side,
  delay = 180,
  className = "",
  children,
}) {
  const pref = useStampStore((s) => s.tooltipPos);
  const resolvedSide = mapSide(side || pref || "top");
  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);
  const timerRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState({ left: 0, top: 0 });

  const show = () => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setVisible(true), delay);
  };

  const hide = () => {
    clearTimeout(timerRef.current);
    setVisible(false);
  };

  useLayoutEffect(() => {
    if (!visible || !triggerRef.current) return;
    setCoords(place(resolvedSide, triggerRef.current, tooltipRef.current));
  }, [visible, resolvedSide, label, hint, shortcut]);

  useEffect(() => {
    if (!visible) return;
    const onScroll = () => hide();
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onScroll);
    };
  }, [visible]);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  if (!label && !hint && !shortcut) return children;

  const resolvedShortcut = shortcut || (hint && hint.startsWith("Ctrl") ? hint : null);
  const resolvedHint = resolvedShortcut === hint ? null : hint;

  return (
    <span
      ref={triggerRef}
      className={`relative inline-flex ${className}`.trim()}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
      onMouseDown={hide}
    >
      {children}
      {visible &&
        createPortal(
          <span
            ref={tooltipRef}
            role="tooltip"
            className="pointer-events-none fixed z-[120] flex max-w-[240px] items-center gap-1.5 border px-2 py-1 text-[11px] font-medium leading-none shadow-lg"
            style={{
              left: coords.left,
              top: coords.top,
              background: "var(--bg-panel)",
              borderColor: "var(--border)",
              color: "var(--text)",
            }}
          >
            <span className="truncate tracking-tight">{label}</span>
            {resolvedHint && (
              <span className="text-[10px] font-normal" style={{ color: "var(--text-mute)" }}>
                {resolvedHint}
              </span>
            )}
            {resolvedShortcut && (
              <kbd
                className="inline-flex items-center border px-1 py-px font-mono text-[9px] font-semibold"
                style={{
                  borderColor: "var(--border-soft)",
                  background: "var(--bg-sunken)",
                  color: "var(--text-mute)",
                }}
              >
                {resolvedShortcut}
              </kbd>
            )}
          </span>,
          document.body
        )}
    </span>
  );
}
