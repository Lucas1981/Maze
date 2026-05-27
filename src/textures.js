import brickUrl from "./assets/brick.png";
import mapUrl from "./assets/map.gif";
import skyUrl from "./assets/sky.jpg";
import grassUrl from "./assets/grass.png";
import startUrl from "./assets/start.png";
import finishUrl from "./assets/finish.png";

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    image.src = src;
  });
}

export class Textures {
  #offScreenCanvas = document.createElement("canvas");
  #offScreenContext;

  #sources = {
    brick: brickUrl,
    map: mapUrl,
    sky: skyUrl,
    grass: grassUrl,
    start: startUrl,
    finish: finishUrl,
  };

  #brick = null;
  #gridMap = null;
  #sky = null;
  #floorGrass = null;
  #floorStart = null;
  #floorFinish = null;
  #framebuffer = null;

  constructor() {
    this.#offScreenContext = this.#offScreenCanvas.getContext("2d");
  }

  get brick() {
    return this.#brick;
  }

  get gridMap() {
    return this.#gridMap;
  }

  get sky() {
    return this.#sky;
  }

  get floorTextures() {
    return [this.#floorGrass, this.#floorStart, this.#floorFinish];
  }

  get framebuffer() {
    return this.#framebuffer;
  }

  #imageDataFromSource(source) {
    this.#offScreenContext.drawImage(source, 0, 0);
    return this.#offScreenContext.getImageData(
      0,
      0,
      source.width,
      source.height,
    );
  }

  #skyImageData(source, width, height) {
    this.#offScreenContext.drawImage(source, 0, 0, width, height);
    return this.#offScreenContext.getImageData(0, 0, width, height);
  }

  async load(width, height) {
    this.#offScreenCanvas.width = width;
    this.#offScreenCanvas.height = height;

    const { brick, map, sky, grass, start, finish } = this.#sources;

    const [
      brickImage,
      mapImage,
      skyImage,
      grassImage,
      startImage,
      finishImage,
    ] = await Promise.all([
      loadImage(brick),
      loadImage(map),
      loadImage(sky),
      loadImage(grass),
      loadImage(start),
      loadImage(finish),
    ]);

    this.#brick = this.#imageDataFromSource(brickImage);
    this.#gridMap = this.#imageDataFromSource(mapImage);
    this.#sky = this.#skyImageData(skyImage, width, height);
    this.#floorGrass = this.#imageDataFromSource(grassImage);
    this.#floorStart = this.#imageDataFromSource(startImage);
    this.#floorFinish = this.#imageDataFromSource(finishImage);
  }

  createFramebuffer(width, height) {
    this.#framebuffer = this.#offScreenContext.createImageData(width, height);
    return this.#framebuffer;
  }
}

export const textures = new Textures();
