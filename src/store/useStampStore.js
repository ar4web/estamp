import { create } from "zustand";
import { createHistory } from "../utils/history";
import {
  CANVAS_SIZE,
  deserialize,
  rebuildArc,
  serialize,
} from "../utils/canvas";
import * as storage from "../utils/storage";
import { applyAccent, applyCorners, applyThemeClass, DEFAULT_ACCENT } from "../utils/theme";
import { refreshLiveFields } from "../utils/fields";
import { objectInkHex } from "../utils/color";
import { tintFabricImage } from "../utils/image";

export const history = createHistory();

let toastSeq = 0;

export const useStampStore = create((set, get) => ({
  /* ---------------- canvas ---------------- */
  canvas: null,
  ready: false,
  setCanvas: (canvas) => set({ canvas, ready: !!canvas }),

  /* ---------------- selection ------------- */
  selected: null,
  selVersion: 0,
  layerVersion: 0,
  syncSelection: () => {
    const c = get().canvas;
    if (!c) return;
    const active = c.getActiveObject() || null;
    const ink = objectInkHex(active);
    set((s) => ({
      selected: active,
      selVersion: s.selVersion + 1,
      ...(ink ? { inkColor: ink } : {}),
    }));
  },
  touchSelection: () => set((s) => ({ selVersion: s.selVersion + 1 })),
  touchLayers: () => set((s) => ({ layerVersion: s.layerVersion + 1 })),

  /* ---------------- viewport -------------- */
  zoom: 1,
  showRulers: false,
  showGrid: false,
  setZoom: (z) => {
    const c = get().canvas;
    const zoom = Math.min(4, Math.max(0.5, Number(z) || 1));
    if (c) {
      c.setZoom(zoom);
      c.setDimensions({ width: CANVAS_SIZE * zoom, height: CANVAS_SIZE * zoom });
      c.requestRenderAll();
    }
    set({ zoom });
  },
  zoomBy: (delta) => get().setZoom(get().zoom + delta),
  toggleRulers: () => set((s) => ({ showRulers: !s.showRulers })),
  toggleGrid: () => set((s) => ({ showGrid: !s.showGrid })),
  showGuides: storage.getPrefs().showGuides ?? false,
  toggleGuides: () => {
    const showGuides = !get().showGuides;
    storage.setPrefs({ showGuides });
    set({ showGuides });
  },

  /* ---------------- canvas appearance ----------------- */
  selectionColor: storage.getPrefs().selectionColor ?? "#f59e0b",
  selectionBorderWidth: storage.getPrefs().selectionBorderWidth ?? 1,

  gridSize: storage.getPrefs().gridSize ?? 20,
  gridOpacity: storage.getPrefs().gridOpacity ?? 0.35,

  tooltipPos: storage.getPrefs().tooltipPos ?? "top-right",

  /* ---------------- personalisation / accessibility ---------------- */
  accentColor: storage.getPrefs().accentColor ?? DEFAULT_ACCENT,
  a11y: {
    reduceMotion: !!storage.getPrefs().a11yReduceMotion,
    highContrast: !!storage.getPrefs().a11yHighContrast,
    largeControls: !!storage.getPrefs().a11yLargeControls,
    alwaysFocus: !!storage.getPrefs().a11yAlwaysFocus,
  },
  setA11y: (patch) => {
    const next = { ...get().a11y, ...patch };
    const root = document.documentElement;
    root.classList.toggle("a11y-reduce-motion", next.reduceMotion);
    root.classList.toggle("a11y-high-contrast", next.highContrast);
    root.classList.toggle("a11y-large-controls", next.largeControls);
    root.classList.toggle("a11y-always-focus", next.alwaysFocus);
    set({ a11y: next });
    storage.setPrefs({
      a11yReduceMotion: next.reduceMotion,
      a11yHighContrast: next.highContrast,
      a11yLargeControls: next.largeControls,
      a11yAlwaysFocus: next.alwaysFocus,
    });
  },
  uiRadius: storage.getPrefs().uiRadius ?? "soft",
  applyPersonalisation: () => {
    const st = get();
    applyAccent(st.accentColor || DEFAULT_ACCENT);
    applyCorners(st.uiRadius || "soft");
    get().setA11y({ ...st.a11y });
  },

  /* ---------------- theme ----------------- */
  theme: storage.getTheme(),
  applyTheme: (theme) => {
    applyThemeClass(theme);
    storage.setTheme(theme);
    set({ theme });
    applyAccent(get().accentColor || DEFAULT_ACCENT);
  },
  toggleTheme: () => {
    const next = applyThemeClass(get().theme) === "dark" ? "light" : "dark";
    get().applyTheme(next);
  },


  /* ---------------- shape placement defaults ---------------- */
  shapeStroke: 6,
  shapeScale: 100,
  shapeGap: 8,
  shapeDouble: false,
  shapeFilled: false,
  shapeDashed: false,
  setShapeDefaults: (patch) => set(patch),

  /* ---------------- ink ------------------- */
  inkColor: storage.getPrefs().inkColor ?? "#003399",
  setInkColor: (inkColor) => {
    storage.setPrefs({ inkColor });
    set({ inkColor });
    const c = get().canvas;
    if (!c) return;
    const active = c.getActiveObjects() || [];
    const objs = active.length ? [...active] : [];
    if (!objs.length) return;
    const jobs = [];
    objs.forEach((o) => {
      if (o.stampMeta) o.stampMeta = { ...o.stampMeta, ink: inkColor };
      if (o.stampMeta?.kind === "arc") {
        rebuildArc(c, o, { fill: inkColor });
        return;
      }
      if (o.type === "image") {
        jobs.push(tintFabricImage(c, o, inkColor));
        return;
      }
      const solid = o.fill && o.fill !== "transparent";
      if (o.stroke) o.set({ stroke: inkColor });
      if (solid || !o.stroke) o.set({ fill: inkColor });
      if (o.type === "group") {
        o.forEachObject?.((ch) => {
          if (ch.stroke) ch.set({ stroke: inkColor });
          if (ch.fill && ch.fill !== "transparent") ch.set({ fill: inkColor });
        });
      }
      o.setCoords?.();
    });
    const finish = () => {
      c.requestRenderAll();
      get().commit();
      get().touchSelection();
    };
    if (jobs.length) Promise.all(jobs).then(finish).catch(finish);
    else finish();
  },

  /* ---------------- colours --------------- */
  canvasColor: storage.getPrefs().canvasColor ?? "",
  workspaceColor: storage.getPrefs().workspaceColor ?? "",

  /* ---------------- panels ---------------- */
  leftOpen: true,
  rightOpen: true,
  toggleLeft: () => set((s) => ({ leftOpen: !s.leftOpen })),
  toggleRight: () => set((s) => ({ rightOpen: !s.rightOpen })),
  pulseTemplates: false,
  setPulseTemplates: (v) => set({ pulseTemplates: v }),


  /* ---------------- toasts ---------------- */
  toasts: [],
  toast: (message, type = "info", action = null) => {
    const last = get().toasts[0];
    if (last && last.message === message) return last.id;
    const id = ++toastSeq;
    set({ toasts: [{ id, message, type, action }] });
    setTimeout(() => get().dismissToast(id), action ? 8000 : 2200);
    return id;
  },
  dismissToast: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  /* ---------------- history --------------- */
  canUndo: false,
  canRedo: false,
  dirty: false,
  commit: () => {
    const c = get().canvas;
    if (!c || history.locked) return;
    const changed = history.push(serialize(c));
    if (changed)
      set({
        canUndo: history.canUndo(),
        canRedo: history.canRedo(),
        dirty: true,
      });
    get().touchLayers();
  },
  resetHistory: () => {
    const c = get().canvas;
    if (!c) return;
    history.reset(serialize(c));
    set({ canUndo: false, canRedo: false });
  },
  undo: async () => {
    const c = get().canvas;
    const state = history.undo();
    if (!c || !state) return;
    history.lock();
    await deserialize(c, state);
    history.unlock();
    set({
      canUndo: history.canUndo(),
      canRedo: history.canRedo(),
      selected: null,
      dirty: true,
    });
    get().touchLayers();
  },
  redo: async () => {
    const c = get().canvas;
    const state = history.redo();
    if (!c || !state) return;
    history.lock();
    try {
      await deserialize(c, state);
    } finally {
      history.unlock();
    }
    set({
      canUndo: history.canUndo(),
      canRedo: history.canRedo(),
      selected: null,
      dirty: true,
    });
    get().touchLayers();
  },

  /* ---------------- designs --------------- */
  designName: "Untitled stamp",
  setDesignName: (designName) => set({ designName }),

  refreshFields: (opts) => {
    const c = get().canvas;
    if (!c) return;
    if (refreshLiveFields(c, opts)) {
      get().commit();
      get().touchSelection();
    }
  },

  /* ---------------- autosave -------------- */
  restoreAutosave: async () => {
    const c = get().canvas;
    const buf = storage.readAutosave();
    if (!c || !buf) return false;
    history.lock();
    try {
      await deserialize(c, buf.json);
    } catch (e) {
      get().toast(`Could not restore the previous session: ${e.message || "corrupt autosave"}`, "error");
      return false;
    } finally {
      history.unlock();
    }
    get().resetHistory();
    get().touchLayers();
    set({ selected: null });
    get().toast("Previous session restored", "success");
    return true;
  },
}));

export default useStampStore;
