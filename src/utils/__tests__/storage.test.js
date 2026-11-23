import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// The storage adapter decides at import time whether the browser backend
// exists, so each scenario re-imports the module with a fresh environment.
const importStorage = () => import("../storage");

const workingLocalStorage = () => {
  const map = new Map();
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => void map.set(k, String(v)),
    removeItem: (k) => void map.delete(k),
    key: (i) => [...map.keys()][i] ?? null,
    get length() {
      return map.size;
    },
    _map: map,
  };
};

const quotaLocalStorage = () => ({
  getItem: () => null,
  setItem: () => {
    const e = new Error("quota exceeded");
    e.name = "QuotaExceededError";
    throw e;
  },
  removeItem: () => {},
  key: () => null,
  length: 0,
});

describe("storage adapter (node, no browser backend)", () => {
  beforeEach(() => {
    vi.resetModules();
    delete globalThis.window;
  });
  afterEach(() => {
    delete globalThis.window;
  });

  it("falls back to memory when localStorage is missing entirely", async () => {
    const storage = await importStorage();
    expect(storage.storageAvailable()).toBe(false);
    const { record, persisted } = storage.saveDesign({ name: "In memory", json: { objects: [] } });
    expect(persisted).toBe(true); // memory-only mode works for the session
    expect(storage.getDesigns().map((d) => d.id)).toContain(record.id);
  });

  it("saves and re-reads designs through the memory backend", async () => {
    const storage = await importStorage();
    storage.saveDesign({ name: "Alpha", json: { objects: [] } });
    storage.saveDesign({ name: "Beta", json: { objects: [] } });
    expect(storage.getDesigns().map((d) => d.name)).toEqual(["Beta", "Alpha"]);
  });

  it("caps the design gallery at 40 entries", async () => {
    const storage = await importStorage();
    for (let i = 0; i < 50; i++) storage.saveDesign({ name: `D${i}`, json: {} });
    expect(storage.getDesigns()).toHaveLength(40);
  });

  it("renameDesign renames in place", async () => {
    const storage = await importStorage();
    const { record } = storage.saveDesign({ name: "Old", json: {} });
    storage.renameDesign(record.id, "New");
    expect(storage.getDesigns()[0].name).toBe("New");
  });

  it("deleteDesign removes the record", async () => {
    const storage = await importStorage();
    const { record } = storage.saveDesign({ name: "Bye", json: {} });
    storage.deleteDesign(record.id);
    expect(storage.getDesigns()).toHaveLength(0);
  });

  it("filters invalid palette colors and caps the palette at 8", async () => {
    const storage = await importStorage();
    const colors = ["#003399", "nope", "#ff0000", "#112233", "#aabbcc", "#000000", "#123456", "#654321", "#789abc", "#def012"];
    const { record } = storage.savePalette({ name: "Mix", colors });
    expect(record.colors.length).toBeLessThanOrEqual(8);
    expect(record.colors).not.toContain("nope");
    expect(record.colors).toContain("#003399");
  });

  it("reports storage status", async () => {
    const storage = await importStorage();
    const status = storage.storageStatus();
    expect(status.persistent).toBe(false);
    expect(status.degraded).toBe(false);
    expect(status.designs).toBe(0);
  });
});

describe("storage adapter (browser backend present)", () => {
  beforeEach(() => {
    vi.resetModules();
  });
  afterEach(() => {
    delete globalThis.window;
  });

  it("persists through a working localStorage", async () => {
    globalThis.window = { localStorage: workingLocalStorage() };
    const storage = await importStorage();
    expect(storage.storageAvailable()).toBe(true);
    const { persisted } = storage.saveDesign({ name: "Real", json: { objects: [] } });
    expect(persisted).toBe(true);
    expect(JSON.parse(globalThis.window.localStorage.getItem("stamp_designs"))).toHaveLength(1);
  });

  it("reports persistence failure when the backend throws (quota)", async () => {
    globalThis.window = { localStorage: quotaLocalStorage() };
    const storage = await importStorage();
    const { record, persisted } = storage.saveDesign({ name: "Too big", json: { objects: [] } });
    expect(persisted).toBe(false);
    // The memory mirror still serves the session.
    expect(storage.getDesigns().map((d) => d.id)).toContain(record.id);
    // …and the degraded state is reported.
    expect(storage.storageStatus().degraded).toBe(true);
  });
});
