import { UNIT_HEIGHT, UNIT_WIDTH } from "./constants.js";
import { textures } from "./textures.js";

const CHANNEL_WALL = 1;
const CHANNEL_EXIT = 2;

function cellOffset(x, y) {
  const { gridMap } = textures;
  return (
    (Math.floor(x / UNIT_WIDTH) + Math.floor(y / UNIT_HEIGHT) * gridMap.width) *
    4
  );
}

export function isWallHit(x, y) {
  return textures.gridMap.data[cellOffset(x, y) + CHANNEL_WALL] >= 255;
}

export function isExitHit(x, y) {
  return textures.gridMap.data[cellOffset(x, y) + CHANNEL_EXIT] === 255;
}
