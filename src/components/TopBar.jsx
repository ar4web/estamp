import { useEffect, useRef, useState } from "react";
import {
  Moon,
  Redo2,
  Stamp,
  Sun,
  Undo2,
} from "lucide-react";
import useStampStore from "../store/useStampStore";
import { APP_NAME } from "../config";
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
    undo,
    redo,
    canUndo,
    canRedo,
  } = useStampStore();

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(designName);
  const titleRef = useRef(null);

  useEffect(() => {
    if (!editing) setDraft(designName);
  }, [designName, editing]);

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
      </div>
    </header>
  );
}
