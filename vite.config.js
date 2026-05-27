import { defineConfig } from 'vite';

export default defineConfig({
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
