import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  LayoutTemplate,
  Shapes,
  Sparkles,
  Type,
  X,
} from "lucide-react";
import useStampStore from "../../store/useStampStore";
import { selectionKind } from "../../utils/canvas";
import { useIsMobile } from "../DraggablePanel";
import Tooltip from "../Tooltip";
import TextTool from "./TextTool";
import TemplateGallery from "./TemplateGallery";
import OrnamentTool from "./OrnamentTool";
import BorderTool from "./BorderTool";

const SECTIONS = [
  { id: "template", label: "Templates", hint: "All layouts & presets", icon: LayoutTemplate, Component: TemplateGallery },
  { id: "text", label: "Text", hint: "Type, fonts, phrases", icon: Type, Component: TextTool },
  { id: "border", label: "Shapes & Frames", hint: "Shapes, align, distress", icon: Shapes, Component: BorderTool },
  { id: "ornament", label: "Ornaments", hint: "Stars, seals, flourishes", icon: Sparkles, Component: OrnamentTool },
];

export default function LeftSidebar() {
  const pulse = useStampStore((s) => s.pulseTemplates);
  const selected = useStampStore((s) => s.selected);
  const leftOpen = useStampStore((s) => s.leftOpen);
  const toggleLeft = useStampStore((s) => s.toggleLeft);
  const mobile = useIsMobile();

  const [active, setActive] = useState("template");
  const [desktopOpen, setDesktopOpen] = useState(false);
  const [pinned, setPinned] = useState(false);
  const closeTimer = useRef(null);
  const shellRef = useRef(null);
  const scrollRef = useRef(null);
  const scrollPositions = useRef({});
  const lastSelected = useRef(null);

  const flyoutOpen = mobile ? leftOpen : desktopOpen;

  const captureScroll = useCallback(() => {
    if (scrollRef.current) scrollPositions.current[active] = scrollRef.current.scrollTop;
  }, [active]);

  const showFlyout = useCallback(() => {
    clearTimeout(closeTimer.current);
    if (mobile) {
      if (!leftOpen) toggleLeft();
    } else {
      setDesktopOpen(true);
    }
  }, [mobile, leftOpen, toggleLeft]);

  const hideFlyout = useCallback(() => {
    captureScroll();
    clearTimeout(closeTimer.current);
    if (mobile) {
      if (leftOpen) toggleLeft();
    } else {
      setDesktopOpen(false);
      setPinned(false);
    }
  }, [captureScroll, mobile, leftOpen, toggleLeft]);

  const activate = useCallback(
    (id, pin = false) => {
      clearTimeout(closeTimer.current);
      captureScroll();
      setActive(id);
      showFlyout();
      if (pin && !mobile) setPinned(true);
    },
    [captureScroll, showFlyout, mobile]
  );

  // Each tool remembers its own scroll position, including smart selection changes.
  useLayoutEffect(() => {
    if (!flyoutOpen || !scrollRef.current) return;
    scrollRef.current.scrollTop = scrollPositions.current[active] ?? 0;
  }, [active, flyoutOpen]);

  // Close the temporary flyout on outside interaction or Escape.
  useEffect(() => {
    if (!flyoutOpen) return;
    const onDown = (e) => {
      if (shellRef.current && !shellRef.current.contains(e.target)) hideFlyout();
    };
    const onKey = (e) => {
      if (e.key === "Escape") hideFlyout();
    };
    document.addEventListener("pointerdown", onDown, true);
    document.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("pointerdown", onDown, true);
      document.removeEventListener("keydown", onKey, true);
    };
  }, [flyoutOpen, hideFlyout]);

  useEffect(() => () => clearTimeout(closeTimer.current), []);
  useEffect(() => {
    if (mobile) {
      setDesktopOpen(false);
      setPinned(false);
    }
  }, [mobile]);

  // Smart tool focus: selecting a layer highlights the matching tool without
  // stealing the user's place in another tool's scroll position.
  useEffect(() => {
    if (!selected || selected === lastSelected.current) {
      lastSelected.current = selected;
      return;
    }
    lastSelected.current = selected;
    const k = selectionKind(selected);
    const id =
      k === "text" || k === "arc" ? "text"
      : k === "shape" || k === "group" ? "border"
      : null;
    if (id && id !== active) {
      captureScroll();
      setActive(id);
    }
  }, [selected, active, captureScroll]);

  const cancelClose = () => clearTimeout(closeTimer.current);
  const scheduleClose = () => {
    if (mobile || pinned || !desktopOpen) return;
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setDesktopOpen(false), 220);
  };

  const Current = SECTIONS.find((s) => s.id === active)?.Component || TextTool;

  const toolButton = (s, { mobileMode = false } = {}) => {
    const on = active === s.id;
    return (
      <Tooltip
        key={s.id}
        label={s.label}
        hint={s.hint}
        side={mobileMode ? "top" : "right"}
        className={mobileMode ? "shrink-0" : "w-full"}
      >
        <button
          type="button"
          className={`tool-rail-btn ${on ? "is-on" : ""} ${pulse && s.id === "template" ? "pulse-hint" : ""}`}
          aria-label={s.label}
          title={s.label}
          aria-selected={on}
          aria-expanded={on && flyoutOpen}
          onMouseEnter={() => !mobileMode && activate(s.id)}
          onFocus={() => !mobileMode && activate(s.id)}
          onClick={() => {
            if (mobileMode) {
              if (flyoutOpen && active === s.id) hideFlyout();
              else activate(s.id, true);
            } else if (desktopOpen && pinned && active === s.id) {
              hideFlyout();
            } else {
              activate(s.id, true);
            }
          }}
        >
          <s.icon size={16} strokeWidth={1.75} aria-hidden />
        </button>
      </Tooltip>
    );
  };

  if (mobile) {
    return (
      <>
        {leftOpen && <div className="tool-mobile-overlay" onClick={hideFlyout} aria-hidden />}
        <aside
          ref={shellRef}
          aria-label="Insert tools"
          className={`tool-mobile-sheet ${leftOpen ? "is-open" : ""}`}
        >
          <div className="tool-mobile-rail" role="toolbar" aria-label="Insert tools">
            {SECTIONS.map((s) => toolButton(s, { mobileMode: true }))}
            <button
              type="button"
              className="tool-mobile-close"
              aria-label="Close tools"
              title="Close tools"
              onClick={hideFlyout}
            >
              <X size={16} aria-hidden />
            </button>
          </div>
          {leftOpen && (
            <div
              ref={scrollRef}
              className="tool-mobile-body scroll-thin"
              onScroll={(e) => { scrollPositions.current[active] = e.currentTarget.scrollTop; }}
            >
              <Current />
            </div>
          )}
        </aside>
      </>
    );
  }

  return (
    <div
      ref={shellRef}
      className="tool-rail-shell"
      onMouseEnter={cancelClose}
      onMouseLeave={scheduleClose}
    >
      <nav className="tool-rail" aria-label="Insert tools" role="toolbar">
        <div className="tool-rail-list">
          {SECTIONS.map((s) => toolButton(s))}
        </div>
      </nav>

      {flyoutOpen && (
        <div className="tool-flyout is-open" onMouseEnter={cancelClose}>
          <div className="tool-flyout-bar">
            <Tooltip label="Close tools" side="left">
              <button
                type="button"
                className="tool-flyout-close"
                aria-label="Close tools"
                title="Close tools"
                onClick={hideFlyout}
              >
                <X size={14} aria-hidden />
              </button>
            </Tooltip>
          </div>
          <div
            ref={scrollRef}
            className="tool-flyout-body scroll-thin"
            onScroll={(e) => { scrollPositions.current[active] = e.currentTarget.scrollTop; }}
          >
            <Current />
          </div>
        </div>
      )}
    </div>
  );
}
