import { defineConfig } from 'vite';

// Relative base so the static build runs from any nginx root (or file://).
export default defineConfig({
  base: './',
  build: { target: 'es2020', sourcemap: true },
});
