import "./styles/stylesheet.css";
import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  degToRad,
  MOVE_BACKWARD_PIXELS,
  MOVE_FORWARD_PIXELS,
  PLAYER_START_ANGLE,
  PLAYER_START_X,
  PLAYER_START_Y,
} from "./constants.js";
import { drawFpsOverlay, resetFps, updateFps } from "./debug.js";
import { isExitHit, isWallHit } from "./map.js";
import { renderView } from "./rays.js";
import { input } from "./input.js";
import { textures } from "./textures.js";

let running = false;

let canvas;
let context;
let globalAngle = 0;
let playerX;
let playerY;

function resetPlayer() {
  playerX = PLAYER_START_X;
  playerY = PLAYER_START_Y;
  globalAngle = PLAYER_START_ANGLE;
}

function renderFrame() {
  renderView(globalAngle, playerX, playerY, canvas, context);
  drawFpsOverlay(context);
}

function main(timestamp) {
  if (!running) return;

  if (input.rotateLeft) {
    globalAngle = (globalAngle - 1 + 360) % 360;
  }
  if (input.rotateRight) {
    globalAngle = (globalAngle + 1) % 360;
  }

  const moveAngle = globalAngle * degToRad;
  const moveCos = Math.cos(moveAngle);
  const moveSin = Math.sin(moveAngle);

  if (input.moveUp) {
    const testX = playerX + moveCos * MOVE_FORWARD_PIXELS;
    const testY = playerY + moveSin * MOVE_FORWARD_PIXELS;
    if (!isWallHit(testX, testY)) {
      playerX = testX;
      playerY = testY;
    }
  }
  if (input.moveDown) {
    const testX = playerX - moveCos * MOVE_BACKWARD_PIXELS;
    const testY = playerY - moveSin * MOVE_BACKWARD_PIXELS;
    if (!isWallHit(testX, testY)) {
      playerX = testX;
      playerY = testY;
    }
  }

  if (isExitHit(playerX, playerY)) {
    alert("Congratulations. You found the exit.");
    resetPlayer();
    input.reset();
  }

  updateFps(timestamp);
  renderFrame();

  requestAnimationFrame(main);
}

function stopMaze() {
  running = false;
}

async function startMaze() {
  stopMaze();

  canvas = document.getElementById("canvas");
  context = canvas.getContext("2d");
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;

  resetPlayer();
  resetFps();

  input.bind();
  running = true;

  try {
    await textures.load(canvas.width, canvas.height);
    if (!running) return;

    textures.createFramebuffer(canvas.width, canvas.height);

    renderFrame();
    requestAnimationFrame(main);
  } catch (error) {
    console.error(error);
    stopMaze();
  }
}

startMaze();
