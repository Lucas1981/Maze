# Maze

So this was a project that I created in 2014, when HTML5 Canvas was still hot and new. I followed a tutorial online to build it - also harking back to theory I had read about in books from Andre LaMothe. It all worked and I was very happy, but the structure of the whole project wasn't great. It was pretty much coded like it was C in a way.

Now I decided to open it back up and revise it with the help of Cursor's AI agencies. It runs a lot faster now! I think mainly because it uses lookup tables with cached values for relatively intensive calculations such as cos, sin and tan. It also reduced some of the calculations that were being done more than once. It also figured it could increment in places rather than recalculate a whole value.

I am a little disappointed at the fact that the whole thing still feels bloated. The ./src/rays.js file is still the main file and it is just very messy with arguments being passed all over the place. I tried to bundle them up into nice objects here and there but the fact just remains that it's going to get bloated for a project like this. It's okay, it's nice to know that it can just get complex by nature.

## Running locally

Requires [Node.js](https://nodejs.org/) (LTS recommended).

```bash
npm install
npm run dev
```

Open the URL Vite prints in the terminal (usually `http://localhost:5173`).

### Other commands

| Command           | Description                        |
| ----------------- | ---------------------------------- |
| `npm run build`   | Production build to `dist/`        |
| `npm run preview` | Serve the production build locally |

## Controls

- **Arrow Up** — move forward
- **Arrow Down** — move backward
- **Arrow Left** — turn left
- **Arrow Right** — turn right

Reach the exit tile to win; you are reset to the start.

## Debug overlay

Set `DEBUG` to `true` in `src/constants.js` to show an FPS counter in the bottom-right corner of the canvas.
