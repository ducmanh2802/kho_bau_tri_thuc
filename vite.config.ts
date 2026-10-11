import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vitest/config';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        // import.meta.dirname keeps this config ESM-native (no __dirname shim),
        // which is what Vite's native config loader expects.
        '@': path.resolve(import.meta.dirname, '.'),
      },
    },
    test: {
      // The competition near-duplicate scan is O(n^2) over the bank; under
      // parallel worker startup it can exceed the 5s default. Give it headroom.
      testTimeout: 20000,
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
