import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  Download,
  FileImage,
  Moon,
  Redo2,
  Sparkles,
  Stamp,
  Sun,
  Undo2,
} from "lucide-react";
import useStampStore from "../store/useStampStore";
import { APP_NAME } from "../config";
import { doExportJPG, doExportPNG, doExportSVG } from "../utils/actions";
import { resolveTheme } from "../utils/theme";
import Tooltip from "./Tooltip";

function ToolBtn({ label, hint, onClick, disabled, children, active }) {
  return (
    <Tooltip
      label={label}
      hint={hint}
      shortcut={hint && /Ctrl|Del|Esc/.test(hint) ? hint : undefined}
      side="bottom"
      delay={120}
    >
      <button
        type="button"
        aria-label={label}
        onClick={onClick}
        disabled={disabled}
        className={`btn btn-icon h-7 w-7 p-0 ${active ? "btn-on" : ""}`}
      >
        {children}
      </button>
    </Tooltip>
  );
}

export default function TopBar() {
  const {
    theme,
    toggleTheme,
    designName,
    setDesignName,
    dirty,
    openModal,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useStampStore();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(designName);
  const dropdownRef = useRef(null);
  const titleRef = useRef(null);

  useEffect(() => {
    if (!editing) setDraft(designName);
  }, [designName, editing]);

  useEffect(() => {
    if (!dropdownOpen) return;
    const handleOutsideClick = (e) => {
      if (!dropdownRef.current?.contains(e.target)) setDropdownOpen(false);
    };
    const handleEsc = (e) => {
      if (e.key === "Escape") setDropdownOpen(false);
    };
    window.addEventListener("mousedown", handleOutsideClick);
    window.addEventListener("keydown", handleEsc);
    return () => {
      window.removeEventListener("mousedown", handleOutsideClick);
      window.removeEventListener("keydown", handleEsc);
    };
  }, [dropdownOpen]);

  const commitTitle = () => {
    const next = draft.trim() || "Untitled stamp";
    setDesignName(next);
    setDraft(next);
    setEditing(false);
  };

  return (
    <header
      className="sticky top-0 z-40 flex w-full shrink-0 items-center justify-between gap-2 px-2"
      style={{
        height: "var(--bar-h)",
        background: "var(--bg-panel)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div className="flex min-w-0 items-center gap-2">
        <div
          className="grid h-7 w-7 shrink-0 place-items-center"
          style={{ background: "var(--accent)", borderRadius: "var(--radius)" }}
        >
          <Stamp size={14} color="var(--on-accent)" />
        </div>
        <span className="hidden shrink-0 text-[13px] font-bold tracking-tight leading-none sm:inline">
          {APP_NAME}
        </span>

        <div className="mx-0.5 hidden h-4 w-px sm:block" style={{ background: "var(--border)" }} />

        <div className="flex min-w-0 max-w-[240px] items-center gap-1.5">
          {editing ? (
            <input
              ref={titleRef}
              className="field h-7 min-w-0 flex-1 px-2 text-[12px] font-medium"
              aria-label="Stamp title"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commitTitle}
              onKeyDown={(e) => {
                if (e.key === "Enter") e.currentTarget.blur();
                if (e.key === "Escape") {
                  setDraft(designName);
                  setEditing(false);
                }
              }}
            />
          ) : (
            <button
              type="button"
              className="min-w-0 truncate rounded border px-2 py-0.5 text-left text-[12px] font-medium"
              style={{
                color: "var(--text)",
                borderColor: "var(--border-soft)",
                background: "var(--bg-sunken)",
                height: 28,
              }}
              title="Rename stamp"
              onClick={() => {
                setDraft(designName);
                setEditing(true);
                requestAnimationFrame(() => titleRef.current?.select());
              }}
            >
              {designName}
            </button>
          )}
          {dirty && (
            <span
              className="h-1.5 w-1.5 shrink-0 rounded-full"
              style={{ background: "var(--accent)" }}
              title="Unsaved changes"
            />
          )}
        </div>
      </div>

      <div className="flex items-center gap-0.5" role="toolbar" aria-label="Studio actions">
        <ToolBtn label="Undo" hint="Ctrl+Z" onClick={undo} disabled={!canUndo}>
          <Undo2 size={14} />
        </ToolBtn>
        <ToolBtn label="Redo" hint="Ctrl+Shift+Z" onClick={redo} disabled={!canRedo}>
          <Redo2 size={14} />
        </ToolBtn>

        <span className="mx-0.5 h-4 w-px" style={{ background: "var(--border)" }} />

        <ToolBtn
          label={resolveTheme(theme) === "dark" ? "Paper desk" : "Ink desk"}
          onClick={toggleTheme}
        >
          {resolveTheme(theme) === "dark" ? <Sun size={14} /> : <Moon size={14} />}
        </ToolBtn>

        <span className="mx-0.5 h-4 w-px" style={{ background: "var(--border)" }} />

        <div ref={dropdownRef} className="relative flex items-stretch">
          <Tooltip label="Export PNG" hint="Stamp only · no paper" shortcut="Ctrl+E" side="bottom">
            <button
              type="button"
              onClick={() => doExportPNG(3, { transparentOnly: true })}
              className="btn btn-icon h-7 w-7 p-0"
              aria-label="Export PNG"
            >
              <Download size={14} />
            </button>
          </Tooltip>
          <button
            type="button"
            onClick={() => setDropdownOpen((v) => !v)}
            aria-label="Select export format"
            aria-expanded={dropdownOpen}
            className="btn h-7 !px-1"
            title="Choose export format"
          >
            <ChevronDown
              size={13}
              className={`transition-transform duration-150 ${dropdownOpen ? "rotate-180" : ""}`}
            />
          </button>
          {dropdownOpen && (
            <div
              role="menu"
              className="toast-in absolute right-0 top-[calc(100%+6px)] z-[85] w-56 rounded border p-1.5 shadow-2xl"
              style={{
                background: "var(--bg-panel)",
                borderColor: "var(--border)",
              }}
            >
              <div
                className="mb-1 border-b px-2 py-1 text-[9px] font-bold uppercase tracking-wider"
                style={{ borderColor: "var(--border-soft)", color: "var(--text-mute)" }}
              >
                Export
              </div>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  doExportPNG(3, { transparentOnly: true });
                  setDropdownOpen(false);
                }}
                className="flex w-full items-center gap-2.5 rounded px-2.5 py-1.5 text-left hover:bg-[var(--bg-raised)]"
              >
                <div className="grid h-6 w-6 shrink-0 place-items-center rounded" style={{ background: "var(--accent-dim)", color: "var(--accent)" }}>
                  <FileImage size={14} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between text-[11px] font-semibold">
                    <span>PNG Transparent</span>
                    <span className="font-mono text-[9px]" style={{ color: "var(--text-mute)" }}>1800px</span>
                  </div>
                  <div className="truncate text-[9px]" style={{ color: "var(--text-dim)" }}>Stamp only, no paper</div>
                </div>
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  doExportSVG({ transparentOnly: true });
                  setDropdownOpen(false);
                }}
                className="flex w-full items-center gap-2.5 rounded px-2.5 py-1.5 text-left hover:bg-[var(--bg-raised)]"
              >
                <div className="grid h-6 w-6 shrink-0 place-items-center rounded" style={{ background: "var(--bg-sunken)", color: "var(--text-dim)" }}>
                  <Sparkles size={14} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between text-[11px] font-semibold">
                    <span>SVG Vector</span>
                    <span className="font-mono text-[9px]" style={{ color: "var(--text-mute)" }}>Vector</span>
                  </div>
                  <div className="truncate text-[9px]" style={{ color: "var(--text-dim)" }}>Scalable for print</div>
                </div>
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  doExportJPG(3, { trim: false });
                  setDropdownOpen(false);
                }}
                className="flex w-full items-center gap-2.5 rounded px-2.5 py-1.5 text-left hover:bg-[var(--bg-raised)]"
              >
                <div className="grid h-6 w-6 shrink-0 place-items-center rounded" style={{ background: "var(--bg-sunken)", color: "var(--text-dim)" }}>
                  <Download size={14} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between text-[11px] font-semibold">
                    <span>JPG Photo</span>
                    <span className="font-mono text-[9px]" style={{ color: "var(--text-mute)" }}>1800px</span>
                  </div>
                  <div className="truncate text-[9px]" style={{ color: "var(--text-dim)" }}>White canvas background</div>
                </div>
              </button>
              <div className="my-1 border-t pt-1" style={{ borderColor: "var(--border-soft)" }}>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setDropdownOpen(false);
                    openModal("download");
                  }}
                  className="flex w-full items-center justify-center rounded px-2.5 py-1.5 text-[10px] font-semibold"
                  style={{ color: "var(--text-dim)" }}
                >
                  More options
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
