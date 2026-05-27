export class Input {
  #rotateLeft = 0;
  #rotateRight = 0;
  #moveUp = 0;
  #moveDown = 0;

  #setKeyState(key, pressed) {
    switch (key) {
      case "ArrowLeft":
        this.#rotateLeft = pressed;
        return true;
      case "ArrowRight":
        this.#rotateRight = pressed;
        return true;
      case "ArrowUp":
        this.#moveUp = pressed;
        return true;
      case "ArrowDown":
        this.#moveDown = pressed;
        return true;
      default:
        return false;
    }
  }

  #onKeyDown = (event) => {
    if (this.#setKeyState(event.key, 1)) {
      event.preventDefault();
    }
  };

  #onKeyUp = (event) => {
    if (this.#setKeyState(event.key, 0)) {
      event.preventDefault();
    }
  };

  get rotateLeft() {
    return this.#rotateLeft;
  }

  get rotateRight() {
    return this.#rotateRight;
  }

  get moveUp() {
    return this.#moveUp;
  }

  get moveDown() {
    return this.#moveDown;
  }

  bind() {
    this.unbind();
    document.addEventListener("keydown", this.#onKeyDown);
    document.addEventListener("keyup", this.#onKeyUp);
  }

  unbind() {
    document.removeEventListener("keydown", this.#onKeyDown);
    document.removeEventListener("keyup", this.#onKeyUp);
  }

  reset() {
    this.#rotateLeft = 0;
    this.#rotateRight = 0;
    this.#moveUp = 0;
    this.#moveDown = 0;
  }
}

export const input = new Input();
