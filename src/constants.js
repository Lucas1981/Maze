export const DEBUG = true;

export const degToRad = Math.PI / 180;

export const UNIT_WIDTH = 128;
export const UNIT_HEIGHT = 128;

export const SCREEN_WIDTH = 640;
export const SCREEN_HEIGHT = 480;
export const CANVAS_WIDTH = SCREEN_WIDTH;
export const CANVAS_HEIGHT = SCREEN_HEIGHT;

export const PLAYER_START_X = 2 * UNIT_HEIGHT + 64;
export const PLAYER_START_Y = 47 * UNIT_HEIGHT + 64;
export const PLAYER_START_ANGLE = 310;

export const MOVE_FORWARD_PIXELS = 8;
export const MOVE_BACKWARD_PIXELS = 4;

const FOV = 60;
export const FOV_HALF = FOV / 2;
export const FOV_STEP = FOV / SCREEN_WIDTH;
export const PLAYER_TO_PROJECTION_PLANE = Math.floor(
  SCREEN_WIDTH / 2 / Math.tan((FOV / 2) * degToRad),
);
export const ROW_OF_CENTER = SCREEN_HEIGHT / 2;
export const FLOOR_DEPTH_SCALE = PLAYER_TO_PROJECTION_PLANE * UNIT_HEIGHT;
export const WALL_SHADE_DISTANCE = UNIT_HEIGHT * 2;
