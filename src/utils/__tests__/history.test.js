import { describe, expect, it } from "vitest";
import { createHistory } from "../history";

const snap = (n) => ({ objects: [`obj-${n}`] });

describe("createHistory", () => {
  it("pushes states and supports undo/redo", () => {
    const h = createHistory();
    h.reset(snap(0));
    expect(h.canUndo()).toBe(false);
    expect(h.canRedo()).toBe(false);

    h.push(snap(1));
    h.push(snap(2));
    expect(h.canUndo()).toBe(true);

    const undone = h.undo();
    expect(undone).toEqual(snap(1));
    expect(h.canRedo()).toBe(true);

    const redone = h.redo();
    expect(redone).toEqual(snap(2));
    expect(h.canRedo()).toBe(false);
  });

  it("ignores pushes identical to the present state", () => {
    const h = createHistory();
    h.reset(snap(0));
    expect(h.push(snap(0))).toBe(false);
    expect(h.size()).toEqual({ past: 0, future: 0 });
  });

  it("caps the past at 50 states", () => {
    const h = createHistory();
    h.reset(snap(0));
    for (let i = 1; i <= 60; i++) h.push(snap(i));
    expect(h.size().past).toBe(50);
  });

  it("clears the future branch after a new push", () => {
    const h = createHistory();
    h.reset(snap(0));
    h.push(snap(1));
    h.undo();
    expect(h.canRedo()).toBe(true);
    h.push(snap(2));
    expect(h.canRedo()).toBe(false);
  });

  it("returns null when there is nothing to undo/redo", () => {
    const h = createHistory();
    h.reset(snap(0));
    expect(h.undo()).toBeNull();
    expect(h.redo()).toBeNull();
  });

  it("refuses to record while locked", () => {
    const h = createHistory();
    h.reset(snap(0));
    h.lock();
    expect(h.locked).toBe(true);
    expect(h.push(snap(1))).toBe(false);
    h.unlock();
    expect(h.push(snap(1))).toBe(true);
  });

  it("reset() drops all history and re-baselines the present", () => {
    const h = createHistory();
    h.reset(snap(0));
    h.push(snap(1));
    h.reset(snap(9));
    expect(h.canUndo()).toBe(false);
    expect(h.push(snap(9))).toBe(false);
    expect(h.push(snap(10))).toBe(true);
  });

  it("round-trips state through JSON (snapshots are deep copies)", () => {
    const h = createHistory();
    h.reset(snap(0));
    const state = h.push({ a: { nested: [1, 2, 3] } });
    expect(state).toBe(true);
    const undone = h.undo();
    expect(undone).toEqual(snap(0));
    undone.objects.push("mutated");
    expect(h.undo()).toBeNull(); // unaffected by the caller's mutation
  });
});
