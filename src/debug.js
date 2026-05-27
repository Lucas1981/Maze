import { CANVAS_HEIGHT, CANVAS_WIDTH, DEBUG } from "./constants.js";

let fps = 0;
let fpsFrameCount = 0;
let fpsAccumMs = 0;
let lastFrameTime = null;

export function resetFps() {
  fps = 0;
  fpsFrameCount = 0;
  fpsAccumMs = 0;
  lastFrameTime = null;
}

export function updateFps(timestamp) {
  if (!DEBUG) {
    return;
  }

  const now = timestamp ?? performance.now();

  if (lastFrameTime === null) {
    lastFrameTime = now;
    return;
  }

  const delta = now - lastFrameTime;
  lastFrameTime = now;
  if (delta <= 0) {
    return;
  }

  fpsFrameCount++;
  fpsAccumMs += delta;

  if (fpsAccumMs >= 250) {
    fps = Math.round((fpsFrameCount * 1000) / fpsAccumMs);
    fpsFrameCount = 0;
    fpsAccumMs = 0;
  }
}

export function drawFpsOverlay(context) {
  if (!DEBUG) {
    return;
  }

  const displayFps =
    fpsFrameCount > 0 && fpsAccumMs > 0
      ? Math.round((fpsFrameCount * 1000) / fpsAccumMs)
      : fps;
  const label = `${displayFps} FPS`;
  const paddingX = 8;
  const paddingY = 6;
  const font = "14px monospace";

  context.font = font;
  const textWidth = context.measureText(label).width;
  const boxWidth = textWidth + paddingX * 2;
  const boxHeight = 20;
  const boxX = CANVAS_WIDTH - boxWidth - paddingX;
  const boxY = CANVAS_HEIGHT - boxHeight - paddingY;

  context.fillStyle = "rgba(0, 0, 0, 0.55)";
  context.fillRect(boxX, boxY, boxWidth, boxHeight);

  context.fillStyle = "#7fff7f";
  context.textAlign = "right";
  context.textBaseline = "bottom";
  context.fillText(label, CANVAS_WIDTH - paddingX, CANVAS_HEIGHT - paddingY);
}
