import { Control, controlsUtils, util } from "fabric";

function renderKnob(ctx, left, top, _style, fabricObject) {
  ctx.save();
  ctx.translate(left, top);
  ctx.rotate(util.degreesToRadians(fabricObject.angle || 0));
  ctx.beginPath();
  ctx.arc(0, 0, 8, 0, Math.PI * 2);
  ctx.fillStyle = fabricObject.cornerColor || "#c4a574";
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = "#1a1b1c";
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, 4, -2.1, 1.2);
  ctx.strokeStyle = "#1a1b1c";
  ctx.lineWidth = 1.6;
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(2, 3);
  ctx.lineTo(4.4, 4.2);
  ctx.lineTo(1.2, 5.4);
  ctx.closePath();
  ctx.fillStyle = "#1a1b1c";
  ctx.fill();
  ctx.restore();
}

function makeRotateControl() {
  return new Control({
    x: 0,
    y: -0.5,
    offsetY: -32,
    cursorStyle: "crosshair",
    cursorStyleHandler: controlsUtils.rotationStyleHandler,
    actionHandler: controlsUtils.rotationWithSnapping,
    actionName: "rotate",
    withConnection: true,
    render: renderKnob,
    sizeX: 22,
    sizeY: 22,
    touchSizeX: 40,
    touchSizeY: 40,
  });
}

export function applyObjectControls(obj, accent) {
  if (!obj || typeof obj.set !== "function") return;
  obj.set({
    lockRotation: false,
    centeredRotation: true,
    transparentCorners: false,
    cornerStyle: "rect",
    cornerSize: 8,
    touchCornerSize: 22,
    padding: 8,
    borderColor: accent,
    cornerColor: accent,
    cornerStrokeColor: "#1a1b1c",
    borderScaleFactor: 1.4,
    hasControls: true,
    hasBorders: true,
    snapAngle: obj.snapAngle || 0,
    snapThreshold: obj.snapThreshold || 0,
  });
  if (obj.setControlVisible) obj.setControlVisible("mtr", true);
  if (!obj.controls) return;
  if (!obj.__stampRotateOwn) {
    obj.controls = { ...obj.controls, mtr: makeRotateControl() };
    obj.__stampRotateOwn = true;
  }
}

function setSnap(obj, on) {
  if (!obj) return;
  obj.snapAngle = on ? 15 : 0;
  obj.snapThreshold = on ? 15 : 0;
}

export function wireShiftSnap(canvas) {
  if (!canvas || canvas.__stampShiftSnap) return;
  canvas.__stampShiftSnap = true;
  const fromEvent = (e) => setSnap(canvas._currentTransform?.target || canvas.getActiveObject(), !!e.e?.shiftKey);
  canvas.on("mouse:down", fromEvent);
  canvas.on("mouse:move", fromEvent);
  canvas.on("mouse:up", () => setSnap(canvas.getActiveObject(), false));
  const onKey = (e) => {
    if (e.key !== "Shift") return;
    setSnap(canvas._currentTransform?.target || canvas.getActiveObject(), e.type === "keydown");
  };
  window.addEventListener("keydown", onKey);
  window.addEventListener("keyup", onKey);
}
