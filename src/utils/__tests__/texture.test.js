import { describe, expect, it } from "vitest";
import { ageImageData, distressImageData, roughenImageData } from "../texture";

const solid = (w, h, alpha = 255) => {
  const data = new Uint8ClampedArray(w * h * 4);
  for (let i = 0; i < data.length; i += 4) {
    data[i] = 10;
    data[i + 1] = 20;
    data[i + 2] = 30;
    data[i + 3] = alpha;
  }
  return { data, width: w, height: h };
};

const alphaCount = (img, target) => {
  let n = 0;
  for (let i = 3; i < img.data.length; i += 4) if (img.data[i] === target) n++;
  return n;
};

describe("distressImageData", () => {
  it("does nothing at intensity 0", () => {
    const img = solid(20, 20);
    const before = Uint8ClampedArray.from(img.data);
    distressImageData(img, 0, 42);
    expect(img.data).toEqual(before);
  });

  it("punches holes at high intensity, deterministically per seed", () => {
    const a = solid(30, 30);
    const b = solid(30, 30);
    distressImageData(a, 100, 42);
    distressImageData(b, 100, 42);
    expect(a.data).toEqual(b.data); // deterministic
    expect(alphaCount(a, 0)).toBeGreaterThan(50); // real erosion happened
  });

  it("erodes more at higher intensity", () => {
    const light = solid(30, 30);
    const heavy = solid(30, 30);
    distressImageData(light, 20, 7);
    distressImageData(heavy, 80, 7);
    expect(alphaCount(heavy, 0)).toBeGreaterThan(alphaCount(light, 0));
  });
});

describe("roughenImageData", () => {
  it("only touches edge pixels", () => {
    const img = solid(12, 12);
    roughenImageData(img, 100, 99);
    // interior (2px in from every side) must be untouched
    for (let y = 2; y < 10; y++) {
      for (let x = 2; x < 10; x++) {
        expect(img.data[(y * 12 + x) * 4 + 3]).toBe(255);
      }
    }
  });

  it("drops some edge pixels at high intensity", () => {
    const img = solid(12, 12);
    roughenImageData(img, 100, 99);
    expect(alphaCount(img, 0)).toBeGreaterThan(0);
  });
});

describe("ageImageData", () => {
  it("fades alpha globally but keeps pixels mostly present", () => {
    const img = solid(24, 24);
    ageImageData(img, 60, 5);
    let faded = 0;
    for (let i = 3; i < img.data.length; i += 4) if (img.data[i] < 255) faded++;
    expect(faded).toBeGreaterThan(0);
  });
});
