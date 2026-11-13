export const FONT_SETS = [
  {
    script: "Latin",
    fonts: [
      "Inter",
      "Oswald",
      "Playfair Display",
      "Roboto Mono",
      "Montserrat",
      "Bebas Neue",
      "Archivo Black",
      "Cinzel",
      "Merriweather",
      "Courier Prime",
    ],
  },
  { script: "Cyrillic", fonts: ["Roboto", "PT Sans", "Ubuntu"] },
  { script: "Arabic", fonts: ["Cairo", "Amiri", "Tajawal", "Changa", "Almarai", "Reem Kufi"] },
  { script: "CJK", fonts: ["Noto Sans SC", "Noto Serif JP", "Noto Sans KR"] },
  {
    script: "Devanagari",
    fonts: ["Noto Sans Devanagari", "Hind", "Tiro Devanagari Hindi"],
  },
  { script: "Thai", fonts: ["Sarabun", "Kanit", "Prompt"] },
];

const FONT_AXES = {
  Inter: "wght@100..900",
  Oswald: "wght@200..700",
  "Playfair Display": "wght@400..900",
  "Roboto Mono": "wght@100..700",
  Montserrat: "wght@100..900",
  "Bebas Neue": "wght@400",
  "Archivo Black": "wght@400",
  Cinzel: "wght@400..900",
  Merriweather: "wght@300;400;700;900",
  "Courier Prime": "wght@400;700",
  Roboto: "wght@100..900",
  "PT Sans": "wght@400;700",
  Ubuntu: "wght@300..700",
  Cairo: "wght@200..1000",
  Amiri: "wght@400;700",
  Tajawal: "wght@200..900",
  Changa: "wght@200..800",
  Almarai: "wght@300..800",
  "Reem Kufi": "wght@400..700",
  "Noto Sans SC": "wght@100..900",
  "Noto Serif JP": "wght@200..900",
  "Noto Sans KR": "wght@100..900",
  "Noto Sans Devanagari": "wght@100..900",
  Hind: "wght@300..700",
  "Tiro Devanagari Hindi": "wght@400",
  Sarabun: "wght@100..800",
  Kanit: "wght@100..900",
  Prompt: "wght@100..900",
};

const loaded = new Set();
const loading = new Map();

function fontHref(family) {
  const name = family.replace(/ /g, "+");
  const axis = FONT_AXES[family] || "wght@400;700";
  return `https://fonts.googleapis.com/css2?family=${name}:${axis}&display=swap`;
}

function injectLink(family) {
  const id = "gf-" + family.replace(/\s+/g, "-").toLowerCase();
  const existing = document.getElementById(id);
  if (existing) {
    if (existing.dataset.loaded === "1") return Promise.resolve();
    return new Promise((resolve) => {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => resolve(), { once: true });
      setTimeout(resolve, 1500);
    });
  }
  return new Promise((resolve) => {
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = fontHref(family);
    const done = () => {
      link.dataset.loaded = "1";
      resolve();
    };
    link.onload = done;
    link.onerror = done;
    document.head.appendChild(link);
    setTimeout(done, 2500);
  });
}

export async function loadFont(family) {
  if (!family) return false;
  if (loaded.has(family)) return true;
  if (loading.has(family)) return loading.get(family);
  const job = (async () => {
    try {
      await injectLink(family);
      if (document.fonts?.load) {
        await Promise.all(
          ["400", "700", "900"].map((w) =>
            document.fonts.load(`${w} 24px "${family}"`).catch(() => null)
          )
        );
      }
      if (document.fonts?.ready) {
        await Promise.race([
          document.fonts.ready,
          new Promise((r) => setTimeout(r, 1200)),
        ]);
      }
      loaded.add(family);
      return true;
    } catch (e) {
      console.warn("font load failed", family, e);
      return false;
    } finally {
      loading.delete(family);
    }
  })();
  loading.set(family, job);
  return job;
}

export async function ensureFonts(families) {
  const list = [...new Set((families || []).filter(Boolean))];
  if (!list.length) return true;
  await Promise.all(list.map(loadFont));
  return true;
}

export function fontForScript(text) {
  const t = text || "";
  if (/[\u0600-\u06FF]/.test(t)) return "Cairo";
  if (/[\u0400-\u04FF]/.test(t)) return "PT Sans";
  if (/[\u4E00-\u9FFF\u3040-\u30FF\uAC00-\uD7AF]/.test(t)) return "Noto Sans SC";
  if (/[\u0900-\u097F]/.test(t)) return "Noto Sans Devanagari";
  if (/[\u0E00-\u0E7F]/.test(t)) return "Sarabun";
  return "Oswald";
}

const DEFAULTS = [
  "Inter",
  "Oswald",
  "Playfair Display",
  "Roboto Mono",
  "Cairo",
  "Amiri",
  "Montserrat",
  "Bebas Neue",
  "Cinzel",
  "Archivo Black",
];

export async function preloadDefaults() {
  await Promise.all(DEFAULTS.map(loadFont));
  if (document.fonts) {
    await Promise.race([
      document.fonts.ready,
      new Promise((r) => setTimeout(r, 2000)),
    ]);
  }
  return true;
}

const CUSTOM_KEY = "stamp_custom_fonts";
const customFonts = [];

const readCustom = () => {
  try {
    return JSON.parse(localStorage.getItem(CUSTOM_KEY) || "[]");
  } catch {
    return [];
  }
};

async function register(family, dataUrl) {
  const face = new FontFace(family, `url(${dataUrl})`);
  await face.load();
  document.fonts.add(face);
  loaded.add(family);
  if (!customFonts.includes(family)) customFonts.push(family);
  return family;
}

export async function importFontFile(file) {
  if (!/\.(ttf|otf|woff2?)$/i.test(file.name))
    throw new Error("Use a TTF, OTF, WOFF or WOFF2 file");
  if (file.size > 6 * 1024 * 1024) throw new Error("Font must be under 6 MB");

  const dataUrl = await new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(file);
  });

  const family = file.name.replace(/\.(ttf|otf|woff2?)$/i, "").slice(0, 40);
  await register(family, dataUrl);

  try {
    const all = readCustom().filter((f) => f.family !== family);
    all.push({ family, dataUrl });
    localStorage.setItem(CUSTOM_KEY, JSON.stringify(all));
  } catch {
    /* quota exceeded — font still works for this session */
  }
  return family;
}

export async function restoreCustomFonts() {
  const all = readCustom();
  await Promise.all(
    all.map((f) => register(f.family, f.dataUrl).catch(() => null))
  );
  return getCustomFonts();
}

export const getCustomFonts = () => [...customFonts];

export function refreshTextObject(obj) {
  if (!obj) return;
  obj.dirty = true;
  if (typeof obj.initDimensions === "function") obj.initDimensions();
  if (typeof obj.setCoords === "function") obj.setCoords();
}

export function fabricFamily(name) {
  if (!name) return "Oswald";
  const clean = String(name).replace(/["']/g, "").trim();
  return clean.includes(" ") ? `"${clean}"` : clean;
}

export function plainFamily(name) {
  return String(name || "Oswald").replace(/["']/g, "").trim();
}
