import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vitest/config';
import {collectPrecacheUrls, injectPrecacheManifest} from './scripts/sw-precache.mjs';

/**
 * T02C — replaces `__PRECACHE_MANIFEST__` inside dist/sw.js with the real
 * list of same-origin URLs (every JS/CSS chunk, fonts, icons) so the service
 * worker precaches the whole build output, including lazy chunks. Runs in
 * `closeBundle` so the public/ copy (fonts, icons, sw.js) is already in dist/.
 */
function swPrecachePlugin() {
  return {
    name: 't02c-sw-precache',
    apply: 'build' as const,
    closeBundle() {
      const outDir = path.resolve('dist');
      const urls = collectPrecacheUrls(outDir);
      injectPrecacheManifest(path.join(outDir, 'sw.js'), urls);
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), swPrecachePlugin()],
    resolve: {
      alias: {
        // import.meta.dirname keeps this config ESM-native (no __dirname shim),
        // which is what Vite's native config loader expects.
        '@': path.resolve(import.meta.dirname, '.'),
      },
    },
    build: {
      rolldownOptions: {
        output: {
          // T02C — keep react/react-dom out of the first-load entry chunk so
          // the main chunk budget (≤ 600 kB, goal ≤ 450 kB) survives the
          // ~1.300-question content expansion in T10–T14.
          // T11C — the Toán lesson bank (0–100 content in `src/data/math/`
          // + `src/data/mathCurriculum`) lives in its own `math-bank` chunk
          // so the entry chunk stays within budget after wiring the new units.
          // (Rolldown only accepts the function form of manualChunks.)
          manualChunks: (id: string) => {
            if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/')) {
              return 'react-vendor';
            }
            if (id.includes('/src/data/math/') || id.includes('/src/data/mathCurriculum')) {
              return 'math-bank';
            }
            return undefined;
          },
        },
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
