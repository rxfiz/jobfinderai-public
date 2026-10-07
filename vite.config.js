import { defineConfig } from 'vite';

export default defineConfig({
  envDir: false,
  build: { outDir: 'dist', manifest: true, sourcemap: false, emptyOutDir: true },
});
