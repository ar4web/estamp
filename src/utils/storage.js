// LocalStorage persistence layer: design gallery + autosave buffer.
//
// IMPORTANT: every access goes through this adapter. In sandboxed iframes,
// private windows, or browsers with cookies/storage blocked, touching
// localStorage throws a SecurityError — and because the store reads the
// theme at startup, a single throw would prevent the whole app from
// loading. The adapter detects that once and falls back to memory, so
// the app always boots; persistence simply becomes session-only.

const DESIGN_KEY = "stamp_designs";
const AUTOSAVE_KEY = "stamp_autosave";
const THEME_KEY = "stamp_theme";
const PREFS_KEY = "stamp_prefs";
const CLIP_KEY = "stamp_clips";
const PALETTE_KEY = "stamp_palettes";
const COMPANY_KEY = "stamp_company";

const memory = new Map();
// Set to true when a write to the browser backend fails (quota or SecurityError).
// From then on the memory map is the source of truth for reads too, so the
// in-memory fallback stays coherent instead of reading stale backend values.
let backendBroken = false;

function detectStorage() {
  try {
    const test = "__estamp_test__";
    window.localStorage.setItem(test, "1");
    window.localStorage.removeItem(test);
    return window.localStorage;
  } catch (e) {
    // A full disk/quota is not the same as storage being disabled: the
    // backend still reads fine, it just rejects new bytes. Keep it so saves
    // fail loudly (persisted=false) instead of silently going session-only.
    const isQuota = e?.name === "QuotaExceededError" || e?.code === 22;
    if (isQuota) {
      try {
        window.localStorage.getItem("__estamp_test__");
        return window.localStorage;
      } catch {
        return null;
      }
    }
    return null;
  }
}

const backend = detectStorage();

export const storageAvailable = () => !!backend;

const rawGet = (key) => {
  try {
    if (backend && !backendBroken) return backend.getItem(key);
  } catch {
    /* fall through to memory */
  }
  return memory.has(key) ? memory.get(key) : null;
};

const rawSet = (key, value) => {
  memory.set(key, value);
  if (!backend) return true; // memory-only mode (storage blocked) — always succeeds
  if (backendBroken) return false; // known failure — memory mirror only
  try {
    backend.setItem(key, value);
    return true;
  } catch {
    backendBroken = true;
    return false;
  }
};

const read = (key, fallback) => {
  try {
    const raw = rawGet(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const write = (key, value) => {
  try {
    return rawSet(key, JSON.stringify(value));
  } catch {
    return false;
  }
};

export const getDesigns = () => read(DESIGN_KEY, []);

export function saveDesign({ id, name, json, thumb }) {
  const designs = getDesigns();
  const now = Date.now();
  const existing = designs.findIndex((d) => d.id === id);
  const record = {
    id: id || `d_${now}_${Math.random().toString(36).slice(2, 7)}`,
    name: name || "Untitled stamp",
    json,
    thumb,
    created: existing >= 0 ? designs[existing].created : now,
    updated: now,
  };
  if (existing >= 0) designs[existing] = record;
  else designs.unshift(record);
  const persisted = write(DESIGN_KEY, designs.slice(0, 40));
  return { record, persisted };
}

export function deleteDesign(id) {
  write(
    DESIGN_KEY,
    getDesigns().filter((d) => d.id !== id)
  );
  return getDesigns();
}

export function renameDesign(id, name) {
  const designs = getDesigns().map((d) => (d.id === id ? { ...d, name } : d));
  write(DESIGN_KEY, designs);
  return designs;
}

export const writeAutosave = (json) =>
  write(AUTOSAVE_KEY, { json, at: Date.now() });
export const readAutosave = () => read(AUTOSAVE_KEY, null);

export const getTheme = () => {
  try {
    return rawGet(THEME_KEY) || "dark";
  } catch {
    return "dark";
  }
};

export const setTheme = (t) => {
  try {
    rawSet(THEME_KEY, t);
  } catch {
    /* session-only */
  }
};

export const getPrefs = () => read(PREFS_KEY, {});
export const setPrefs = (p) => write(PREFS_KEY, { ...getPrefs(), ...p });

export const getClips = () => read(CLIP_KEY, []);

export function saveClip({ id, name, json, thumb }) {
  const clips = getClips();
  const now = Date.now();
  const record = {
    id: id || `c_${now}_${Math.random().toString(36).slice(2, 7)}`,
    name: name || "Clip",
    json,
    thumb,
    created: now,
  };
  clips.unshift(record);
  const persisted = write(CLIP_KEY, clips.slice(0, 24));
  return { record, persisted };
}

export function deleteClip(id) {
  write(
    CLIP_KEY,
    getClips().filter((c) => c.id !== id)
  );
  return getClips();
}

export const clearAutosave = () => {
  try {
    if (backend) backend.removeItem(AUTOSAVE_KEY);
  } catch {
    /* ignore */
  }
  memory.delete(AUTOSAVE_KEY);
};

export const resetPrefs = () => {
  try {
    if (backend) {
      backend.removeItem(PREFS_KEY);
      backend.removeItem(THEME_KEY);
    }
  } catch {
    /* ignore */
  }
  memory.delete(PREFS_KEY);
  memory.delete(THEME_KEY);
};

export const getPalettes = () => read(PALETTE_KEY, []);

export function savePalette({ id, name, colors }) {
  const palettes = getPalettes();
  const now = Date.now();
  const record = {
    id: id || `p_${now}_${Math.random().toString(36).slice(2, 7)}`,
    name: name || "Ink set",
    colors: (colors || []).filter((c) => /^#([0-9a-f]{6})$/i.test(c)).slice(0, 8),
    created: now,
  };
  palettes.unshift(record);
  const persisted = write(PALETTE_KEY, palettes.slice(0, 16));
  return { record, persisted };
}

export function deletePalette(id) {
  write(
    PALETTE_KEY,
    getPalettes().filter((p) => p.id !== id)
  );
  return getPalettes();
}

export const getCompany = () =>
  read(COMPANY_KEY, {
    name: "",
    legal: "",
    logo: "",
  });

export const setCompany = (patch) => {
  const next = { ...getCompany(), ...patch };
  write(COMPANY_KEY, next);
  return next;
};

export function storageStatus() {
  const autosave = readAutosave();
  const designs = getDesigns();
  let used = 0;
  try {
    if (backend) {
      for (let i = 0; i < backend.length; i++) {
        const k = backend.key(i);
        if (k && k.startsWith("stamp_")) used += (backend.getItem(k) || "").length;
      }
    }
  } catch {
    /* ignore */
  }
  return {
    persistent: storageAvailable(),
    degraded: backendBroken,
    designs: designs.length,
    autosave: !!(autosave && autosave.json && (autosave.json.objects || []).length),
    autosaveAt: autosave?.at || null,
    usedKb: Math.round(used / 1024),
  };
}
