import { downloadURL } from "./canvas";
import { slugName } from "./print";

export const STAMP_VERSION = 1;
export const STAMP_TYPE = "estamp";
// Refuse absurdly large payloads before JSON.parse puts the tab at risk.
export const MAX_STAMP_BYTES = 25 * 1024 * 1024; // 25 MB of JSON text

// .stamp files saved by older releases used the previous app name.
// Keep accepting them so existing designs still open.
const LEGACY_STAMP_TYPES = ["stampcraft"];

export function buildStampFile({ name, json, ink, canvasColor, company }) {
  return {
    version: STAMP_VERSION,
    type: STAMP_TYPE,
    name: name || "Untitled stamp",
    ink: ink || "#003399",
    canvasColor: canvasColor || "",
    json,
    company: company || null,
    exportedAt: Date.now(),
  };
}

export function parseStampFile(text) {
  if (typeof text === "string" && text.length > MAX_STAMP_BYTES) {
    throw new Error("That .stamp file is too large to import");
  }
  let data;
  try {
    data = typeof text === "string" ? JSON.parse(text) : text;
  } catch {
    throw new Error("File is not valid JSON");
  }
  const validType = data && (data.type === STAMP_TYPE || LEGACY_STAMP_TYPES.includes(data.type));
  if (!validType || !data.json || typeof data.json !== "object") {
    throw new Error("Not an estamp .stamp file");
  }
  if (data.version != null) {
    const v = Number(data.version);
    if (!Number.isFinite(v) || v > STAMP_VERSION) {
      throw new Error(`Unsupported .stamp version ${data.version} — please update estamp`);
    }
  }
  if (data.json.objects != null && !Array.isArray(data.json.objects)) {
    throw new Error("The .stamp file is missing its canvas objects");
  }
  return data;
}

export function downloadStampFile(data, name) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const filename = slugName(name || data.name || "stamp", "stamp");
  downloadURL(url, filename);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
  return filename;
}

export function isStampFile(file) {
  if (!file) return false;
  return /\.stamp$/i.test(file.name || "") || file.type === "application/json";
}
