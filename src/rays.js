import {
  degToRad,
  FLOOR_DEPTH_SCALE,
  FOV_HALF,
  FOV_STEP,
  PLAYER_TO_PROJECTION_PLANE,
  ROW_OF_CENTER,
  SCREEN_HEIGHT,
  SCREEN_WIDTH,
  UNIT_HEIGHT,
  UNIT_WIDTH,
  WALL_SHADE_DISTANCE,
} from "./constants.js";
import { textures } from "./textures.js";

const COLUMN_COS = createColumnCosTable();
const INV_ROW_DEPTH = createInvRowDepthTable();
const rayAngle = new Float32Array(SCREEN_WIDTH);
const raySin = new Float32Array(SCREEN_WIDTH);
const rayCos = new Float32Array(SCREEN_WIDTH);
const rayTan = new Float32Array(SCREEN_WIDTH);

function createColumnCosTable() {
  const table = new Float32Array(SCREEN_WIDTH);
  for (let i = 0; i < SCREEN_WIDTH; i++) {
    table[i] = Math.cos((-FOV_HALF + i * FOV_STEP) * degToRad);
  }
  return table;
}

function createInvRowDepthTable() {
  const table = new Float32Array(SCREEN_HEIGHT + 1);
  for (let row = 0; row <= SCREEN_HEIGHT; row++) {
    const depth = row - ROW_OF_CENTER;
    table[row] = depth > 0 ? 1 / depth : 0;
  }
  return table;
}

function normalizeAngle(angle) {
  return ((angle % 360) + 360) % 360;
}

function buildRayTrigTables(viewAngle) {
  const baseAngle = viewAngle - FOV_HALF;
  for (let i = 0; i < SCREEN_WIDTH; i++) {
    const angle = normalizeAngle(baseAngle + i * FOV_STEP);
    const rad = angle * degToRad;
    rayAngle[i] = angle;
    raySin[i] = Math.sin(rad);
    rayCos[i] = Math.cos(rad);
    rayTan[i] = Math.tan(rad);
  }
}

function traceGrid(ax, ay, stepX, stepY, mapData, mapWidth, maxSteps) {
  for (let count = 0; count < maxSteps; count++) {
    const gridX = Math.floor(ax / UNIT_HEIGHT);
    const gridY = Math.floor(ay / UNIT_HEIGHT);
    const cellIndex = (gridX + gridY * mapWidth) * 4 + 1;
    if (mapData[cellIndex] !== 0) {
      break;
    }
    ax += stepX;
    ay += stepY;
  }
  return { ax, ay };
}

function getVerticalIntersection(state) {
  const { angle, playerX, playerY, tan, cos, mapData, mapWidth } = state;

  if (angle === 0 || angle === 180) {
    return 0;
  }

  const playerTileY = Math.floor(playerY / UNIT_HEIGHT) * UNIT_HEIGHT;

  let ax;
  let ay;
  let stepX;
  let stepY;

  if (angle === 270) {
    ax = playerX;
    ay = playerTileY - 0.01;
    stepX = 0;
    stepY = -UNIT_HEIGHT;
  } else if (angle === 90) {
    ax = playerX;
    ay = playerTileY + UNIT_HEIGHT;
    stepX = 0;
    stepY = UNIT_HEIGHT;
  } else if (angle > 180) {
    ay = playerTileY - 0.01;
    ax = playerX - (playerY - ay) / tan;
    stepX = (UNIT_HEIGHT / tan) * -1;
    stepY = -UNIT_HEIGHT;
  } else {
    ay = playerTileY + UNIT_HEIGHT;
    ax = playerX - (playerY - ay) / tan;
    stepX = UNIT_HEIGHT / tan;
    stepY = UNIT_HEIGHT;
  }

  const hit = traceGrid(ax, ay, stepX, stepY, mapData, mapWidth, mapWidth);

  if (angle === 270 || angle === 90) {
    return Math.floor(Math.abs(playerY - hit.ay));
  }
  return Math.floor(Math.abs((playerX - hit.ax) / cos));
}

function getHorizontalIntersection(state) {
  const { angle, playerX, playerY, tan, cos, mapData, mapWidth } = state;

  if (angle === 270 || angle === 90) {
    return 0;
  }

  const playerTileX = Math.floor(playerX / UNIT_HEIGHT) * UNIT_HEIGHT;

  let ax;
  let ay;
  let stepX;
  let stepY;

  if (angle === 0) {
    ax = playerTileX + UNIT_HEIGHT;
    ay = playerY;
    stepX = UNIT_HEIGHT;
    stepY = 0;
  } else if (angle === 180) {
    ax = playerTileX - 0.01;
    ay = playerY;
    stepX = -UNIT_HEIGHT;
    stepY = 0;
  } else if (angle > 90 && angle < 270) {
    ax = playerTileX - 0.01;
    ay = playerY - (playerX - ax) * tan;
    stepX = -UNIT_HEIGHT;
    stepY = UNIT_HEIGHT * tan * -1;
  } else {
    ax = playerTileX + UNIT_HEIGHT;
    ay = playerY - (playerX - ax) * tan;
    stepX = UNIT_HEIGHT;
    stepY = UNIT_HEIGHT * tan;
  }

  const hit = traceGrid(ax, ay, stepX, stepY, mapData, mapWidth, mapWidth);

  if (angle === 0 || angle === 180) {
    return Math.floor(Math.abs(playerX - hit.ax));
  }
  return Math.floor(Math.abs((playerX - hit.ax) / cos));
}

function drawWall(state) {
  let canvasOffset = state.destX * 4 + state.wallTopOffset;
  const textureStep = UNIT_HEIGHT / state.columnHeight;
  const useSimpleMapping = state.indexHeight === state.columnHeight;

  for (let k = 0; k < state.columnHeight; k++) {
    canvasOffset += state.canvasStride;

    const offsetX = useSimpleMapping
      ? (state.clipX + Math.floor(k * textureStep) * UNIT_HEIGHT) * 4
      : (state.clipX +
          Math.floor(
            ((state.indexHeight - state.columnHeight) / 2 + k) *
              (UNIT_HEIGHT / state.indexHeight),
          ) *
            UNIT_HEIGHT) *
        4;

    state.offScreenData.data[canvasOffset] =
      state.image1Data.data[offsetX] * state.shading;
    state.offScreenData.data[canvasOffset + 1] =
      state.image1Data.data[offsetX + 1] * state.shading;
    state.offScreenData.data[canvasOffset + 2] =
      state.image1Data.data[offsetX + 2] * state.shading;
    state.offScreenData.data[canvasOffset + 3] =
      state.image1Data.data[offsetX + 3];
  }
}

function drawFloorAndCeilingColumn(state) {
  const depthScale = FLOOR_DEPTH_SCALE / state.columnCos;

  let floorOffset = state.floorBaseOffset;
  let ceilingOffset = state.ceilingBaseOffset;

  for (let row = state.projectionRowStart; row <= SCREEN_HEIGHT; row++) {
    const playerToFloor = depthScale * INV_ROW_DEPTH[row];
    const worldX = playerToFloor * state.cos + state.playerX;
    const worldY = playerToFloor * state.sin + state.playerY;

    const mapX = Math.floor(worldX / UNIT_WIDTH);
    const mapY = Math.floor(worldY / UNIT_HEIGHT);
    const mapIndex = (mapX + mapY * state.mapWidth) * 4;

    let floorTextureIndex = 0;
    if (state.mapData[mapIndex] > 0) {
      floorTextureIndex = 1;
    } else if (state.mapData[mapIndex + 2] > 0) {
      floorTextureIndex = 2;
    }

    const textureX = Math.floor(Math.abs(worldX)) % UNIT_HEIGHT;
    const textureY = Math.floor(Math.abs(worldY)) % UNIT_HEIGHT;
    const textureOffset = (textureX + textureY * UNIT_WIDTH) * 4;

    const shading =
      playerToFloor > WALL_SHADE_DISTANCE
        ? WALL_SHADE_DISTANCE / playerToFloor
        : 1;

    const floorTexture = state.floorTextures[floorTextureIndex].data;
    state.offScreenData.data[floorOffset] =
      floorTexture[textureOffset] * shading;
    state.offScreenData.data[floorOffset + 1] =
      floorTexture[textureOffset + 1] * shading;
    state.offScreenData.data[floorOffset + 2] =
      floorTexture[textureOffset + 2] * shading;
    state.offScreenData.data[floorOffset + 3] = floorTexture[textureOffset + 3];

    state.offScreenData.data[ceilingOffset] =
      state.image4Data.data[ceilingOffset];
    state.offScreenData.data[ceilingOffset + 1] =
      state.image4Data.data[ceilingOffset + 1];
    state.offScreenData.data[ceilingOffset + 2] =
      state.image4Data.data[ceilingOffset + 2];
    state.offScreenData.data[ceilingOffset + 3] =
      state.image4Data.data[ceilingOffset + 3];

    floorOffset += state.canvasStride;
    ceilingOffset -= state.canvasStride;
  }
}

function drawRay(destX, state, canvasStride, screenOffsetY) {
  const {
    playerX,
    playerY,
    canvas,
    offScreenData,
    mapData,
    mapWidth,
    image1Data,
    image4Data,
    floorTextures,
  } = state;

  const angle = rayAngle[destX];
  const helpCos = rayCos[destX];
  const helpSin = raySin[destX];
  const columnCos = COLUMN_COS[destX];

  const intersection = {
    angle,
    playerX,
    playerY,
    tan: rayTan[destX],
    cos: helpCos,
    mapData,
    mapWidth,
  };

  let verticalLength = getVerticalIntersection(intersection);
  let horizontalLength = getHorizontalIntersection(intersection);

  if (angle === 180 || angle === 0) {
    verticalLength = horizontalLength + 1;
  } else if (angle === 270 || angle === 90) {
    horizontalLength = verticalLength + 1;
  }

  let radius =
    verticalLength >= horizontalLength ? horizontalLength : verticalLength;

  const x2 = playerX + radius * helpCos;
  const y2 = playerY + radius * helpSin;
  let clipX = Math.floor(x2 % UNIT_HEIGHT);
  const clipY = Math.floor(y2 % UNIT_HEIGHT);

  if (verticalLength > horizontalLength) {
    clipX = clipY;
  }

  radius *= columnCos;

  if (radius === 0) {
    radius = 0.01;
  }

  const wallShading =
    radius > WALL_SHADE_DISTANCE ? WALL_SHADE_DISTANCE / radius : 1;

  let columnHeight =
    Math.abs(Math.floor((UNIT_HEIGHT / radius) * PLAYER_TO_PROJECTION_PLANE)) *
    2;
  if (columnHeight === 0) {
    columnHeight = 0.01;
  }
  const indexHeight = columnHeight;

  if (columnHeight >= SCREEN_HEIGHT) {
    columnHeight = SCREEN_HEIGHT;
  }

  const wallTopOffset =
    Math.floor(canvas.height / 2 - 1 - columnHeight / 2) * canvasStride;

  drawWall({
    destX,
    columnHeight,
    indexHeight,
    clipX,
    shading: wallShading,
    canvasStride,
    wallTopOffset,
    offScreenData,
    image1Data,
  });

  const projectionRowStart = Math.floor(
    SCREEN_HEIGHT / 2 + (UNIT_HEIGHT / radius) * PLAYER_TO_PROJECTION_PLANE,
  );
  const floorBaseOffset =
    (destX + (projectionRowStart - 1 + screenOffsetY) * canvas.width) * 4;
  const ceilingBaseOffset =
    (destX +
      (SCREEN_HEIGHT - projectionRowStart + screenOffsetY) * canvas.width) *
    4;

  drawFloorAndCeilingColumn({
    projectionRowStart,
    canvasStride,
    floorBaseOffset,
    ceilingBaseOffset,
    playerX,
    playerY,
    cos: helpCos,
    sin: helpSin,
    columnCos,
    offScreenData,
    mapData,
    mapWidth,
    floorTextures,
    image4Data,
  });
}

function createRaycastState(playerX, playerY, canvas, context) {
  const gridMap = textures.gridMap;

  return {
    playerX,
    playerY,
    canvas,
    context,
    offScreenData: textures.framebuffer,
    mapData: gridMap.data,
    mapWidth: gridMap.width,
    image1Data: textures.brick,
    image4Data: textures.sky,
    floorTextures: textures.floorTextures,
  };
}

function drawRays(viewAngle, state) {
  const { context, offScreenData, canvas } = state;

  buildRayTrigTables(viewAngle);

  const canvasStride = canvas.width << 2;
  const screenOffsetY = (canvas.height - SCREEN_HEIGHT) >> 1;

  for (let i = 0; i < SCREEN_WIDTH; i++) {
    drawRay(i, state, canvasStride, screenOffsetY);
  }

  context.putImageData(offScreenData, 0, 0);
}

export function renderView(viewAngle, playerX, playerY, canvas, context) {
  drawRays(viewAngle, createRaycastState(playerX, playerY, canvas, context));
}
