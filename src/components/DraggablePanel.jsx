import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export function useIsMobile(breakpoint = 768) {
  const [mobile, setMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < breakpoint : false
  );
  useEffect(() => {
    const mq = window.matchMedia(`(max-width:${breakpoint - 1}px)`);
    const onChange = (e) => setMobile(e.matches);
    setMobile(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [breakpoint]);
  return mobile;
}

/**
 * Anchored side panel. Fixed width (no drag-to-resize); the only chrome is a
 * collapse chevron — no title text or headings.
 */
export default function DraggablePanel({
  title,
  width = 300,
  side = "left",
  open,
  onClose,
  children,
  pad = true,
  background,
  className = "",
}) {
  const mobile = useIsMobile();
  const hoverTimer = useRef(null);

  useEffect(() => () => clearTimeout(hoverTimer.current), []);

  useEffect(() => {
    if (!mobile || !open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobile, open, onClose]);

  const collapseBtn = (
    <button
      type="button"
      onClick={onClose}
      className="btn btn-ghost btn-icon"
      title="Collapse panel"
      aria-label={`Collapse ${title} panel`}
    >
      {mobile ? (
        <X size={15} />
      ) : side === "right" ? (
        <ChevronRight size={15} />
      ) : (
        <ChevronLeft size={15} />
      )}
    </button>
  );

  const header = (
    <div
      className="flex h-8 shrink-0 items-center justify-between border-b px-1"
      style={{ borderColor: "var(--border)", background: "var(--bg-raised)" }}
    >
      {side === "right" && !mobile ? collapseBtn : <span aria-hidden />}
      {(side !== "right" || mobile) ? collapseBtn : <span aria-hidden />}
    </div>
  );

  const body = pad ? (
    <div className="scroll-thin flex-1 overflow-y-auto p-3.5">{children}</div>
  ) : (
    <div className="flex min-h-0 flex-1 flex-col">{children}</div>
  );

  if (mobile) {
    return (
      <>
        {open && (
          <div className="fixed inset-0 z-[49] bg-black/50" onClick={onClose} aria-hidden />
        )}
        <aside
          aria-label={title}
          aria-hidden={!open}
          className={`fixed inset-x-0 bottom-0 z-[50] flex h-[70vh] flex-col border-t shadow-2xl ${className}`}
          style={{
            background: background || "var(--bg-panel)",
            borderColor: "var(--border)",
            transform: open ? "translateY(0)" : "translateY(103%)",
            transition: "transform 0.2s ease",
            pointerEvents: open ? "auto" : "none",
            visibility: open ? "visible" : "hidden",
          }}
        >
          {header}
          {body}
        </aside>
      </>
    );
  }

  if (!open) {
    const Arrow = side === "right" ? ChevronLeft : ChevronRight;
    return (
      <button
        type="button"
        onClick={onClose}
        onMouseEnter={() => {
          clearTimeout(hoverTimer.current);
          hoverTimer.current = setTimeout(onClose, 450);
        }}
        onMouseLeave={() => clearTimeout(hoverTimer.current)}
        aria-label={`Open ${title} panel`}
        title={`Open ${title}`}
        className="flex h-full w-8 shrink-0 flex-col items-center justify-center gap-2 border"
        style={{ background: "var(--bg-panel)", borderColor: "var(--border)" }}
      >
        <Arrow size={15} style={{ color: "var(--text-dim)" }} />
      </button>
    );
  }

  return (
    <aside
      aria-label={title}
      className={`flex h-full shrink-0 flex-col overflow-hidden border ${className}`}
      style={{ width, background: background || "var(--bg-panel)", borderColor: "var(--border)" }}
    >
      {header}
      {body}
    </aside>
  );
}
