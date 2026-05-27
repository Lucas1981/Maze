import { defineConfig } from 'vite';

export default defineConfig({
  // Relative asset URLs (./assets/...) for servers that don't serve from domain root.
  base: './',
  // Full page reload on save: avoids duplicate listeners and stale game state
  // without import.meta.hot handlers in application code.
  server: {
    hmr: false,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
