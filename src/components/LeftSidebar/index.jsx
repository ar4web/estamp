import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  LayoutTemplate,
  X,
} from "lucide-react";
import useStampStore from "../../store/useStampStore";
import { useIsMobile } from "../DraggablePanel";
import Tooltip from "../Tooltip";
import TemplateGallery from "./TemplateGallery";

export default function LeftSidebar() {
  const pulse = useStampStore((s) => s.pulseTemplates);
  const leftOpen = useStampStore((s) => s.leftOpen);
  const toggleLeft = useStampStore((s) => s.toggleLeft);
  const mobile = useIsMobile();

  const [desktopOpen, setDesktopOpen] = useState(false);
  const [pinned, setPinned] = useState(false);
  const closeTimer = useRef(null);
  const shellRef = useRef(null);
  const scrollRef = useRef(null);

  const flyoutOpen = mobile ? leftOpen : desktopOpen;

  const showFlyout = useCallback(() => {
    clearTimeout(closeTimer.current);
    if (mobile) {
      if (!leftOpen) toggleLeft();
    } else {
      setDesktopOpen(true);
    }
  }, [mobile, leftOpen, toggleLeft]);

  const hideFlyout = useCallback(() => {
    clearTimeout(closeTimer.current);
    if (mobile) {
      if (leftOpen) toggleLeft();
    } else {
      setDesktopOpen(false);
      setPinned(false);
    }
  }, [mobile, leftOpen, toggleLeft]);

  const activate = useCallback(() => {
    clearTimeout(closeTimer.current);
    showFlyout();
  }, [showFlyout]);

  useLayoutEffect(() => {
    if (flyoutOpen && scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [flyoutOpen]);

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

  const cancelClose = () => clearTimeout(closeTimer.current);
  const scheduleClose = () => {
    if (mobile || pinned || !desktopOpen) return;
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setDesktopOpen(false), 220);
  };

  const templatesBtn = ({ mobileMode = false } = {}) => (
    <Tooltip
      label="Templates"
      hint="All stamp layouts & presets"
      side={mobileMode ? "top" : "right"}
      className={mobileMode ? "shrink-0" : "w-full"}
    >
      <button
        type="button"
        className={`tool-rail-btn ${pulse ? "pulse-hint" : ""} ${flyoutOpen ? "is-on" : ""}`}
        aria-label="Templates"
        title="Templates"
        aria-expanded={flyoutOpen}
        onMouseEnter={() => !mobileMode && activate()}
        onFocus={() => !mobileMode && activate()}
        onClick={() => {
          if (mobileMode) {
            if (flyoutOpen) hideFlyout();
            else activate();
          } else if (desktopOpen && pinned) {
            hideFlyout();
          } else {
            clearTimeout(closeTimer.current);
            showFlyout();
            setPinned(true);
          }
        }}
      >
        <LayoutTemplate size={16} strokeWidth={1.75} aria-hidden />
      </button>
    </Tooltip>
  );

  if (mobile) {
    return (
      <>
        {leftOpen && <div className="tool-mobile-overlay" onClick={hideFlyout} aria-hidden />}
        <aside
          ref={shellRef}
          aria-label="Tools"
          className={`tool-mobile-sheet ${leftOpen ? "is-open" : ""}`}
        >
          <div className="tool-mobile-rail" role="toolbar" aria-label="Templates">
            {templatesBtn({ mobileMode: true })}
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
            <div ref={scrollRef} className="tool-mobile-body scroll-thin">
              <TemplateGallery />
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
      <nav className="tool-rail" aria-label="Templates" role="toolbar">
        <div className="tool-rail-list">{templatesBtn()}</div>
      </nav>

      {flyoutOpen && (
        <div className="tool-flyout is-open" onMouseEnter={cancelClose}>
          <div className="tool-flyout-bar">
            <Tooltip label="Close templates" side="left">
              <button
                type="button"
                className="tool-flyout-close"
                aria-label="Close templates"
                title="Close templates"
                onClick={hideFlyout}
              >
                <X size={14} aria-hidden />
              </button>
            </Tooltip>
          </div>
          <div ref={scrollRef} className="tool-flyout-body scroll-thin">
            <TemplateGallery />
          </div>
        </div>
      )}
    </div>
  );
}
