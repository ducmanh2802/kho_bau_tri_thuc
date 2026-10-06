/*
 * SERVICE WORKER — Kho Báu Tri Thức Lớp 1
 *
 * Goals (§25): the app must keep working with the network unavailable.
 * Safety: this file must NEVER be able to break the app.
 *
 * Strategy — deliberately conservative:
 *   - NAVIGATION  : network-first, fall back to the cached shell.
 *                   Network-first is the SAFE choice: a stale HTML file could
 *                   reference asset hashes that no longer exist, which would
 *                   hard-break the app. Preferring the network means updates
 *                   always land and stale HTML is never served while online.
 *   - STATIC ASSETS (hashed JS/CSS/fonts): stale-while-revalidate.
 *                   Filenames are content-hashed, so a cached hit can never be
 *                   wrong for the current build.
 *   - CROSS-ORIGIN (Google Fonts): stale-while-revalidate, failures tolerated.
 *   - NEVER cache non-GET requests or anything that is not http(s).
 *
 * The cache name carries a version so a new deploy purges the previous cache.
 */

const CACHE_VERSION = 'kho-bau-v1';
const SHELL_CACHE = `${CACHE_VERSION}-shell`;
const ASSET_CACHE = `${CACHE_VERSION}-assets`;
const SHELL_URL = '/index.html';

/** Asset extensions we are willing to cache. */
const CACHEABLE_DESTINATIONS = ['script', 'style', 'font', 'image', 'worker'];

self.addEventListener('install', (event) => {
  // Precache only the shell. Precaching hashed bundles here is impossible
  // (this file is static) and is not needed: they get cached on first use.
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.add(new Request(SHELL_URL, { cache: 'reload' })))
      .catch(() => {
        /* Precache is best-effort: a failure must not block activation. */
      })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => !key.startsWith(CACHE_VERSION))
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
      // §11 — safe update model. A new worker activates immediately (no user can
      // ever be trapped on an obsolete build), but the open page still runs the
      // old bundle. Tell it a new version is live so it can offer a reload at a
      // safe moment — never forced, and localStorage is never touched.
      .then(() =>
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
          for (const client of clients) {
            try {
              client.postMessage({ type: 'SW_UPDATED', version: CACHE_VERSION });
            } catch (error) {
              /* One unreachable client must not break activation. */
            }
          }
        })
      )
      .catch(() => {
        /* Activation must never throw. */
      })
  );
});

self.addEventListener('message', (event) => {
  // Lets the app (and QA) ask the worker to drop caches and re-fetch.
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data && event.data.type === 'CLEAR_CACHES') {
    event.waitUntil(caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k)))));
  }
});

/** Network-first, falling back to the cached shell when offline. */
async function handleNavigation(request) {
  try {
    const fresh = await fetch(request);
    const cache = await caches.open(SHELL_CACHE);
    cache.put(SHELL_URL, fresh.clone());
    return fresh;
  } catch (error) {
    const cached = await caches.match(SHELL_URL, { ignoreSearch: true });
    if (cached) return cached;
    throw error;
  }
}

/** Cache-first from a previous visit, refreshed in the background. */
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  const network = fetch(request)
    .then((response) => {
      // Only store real, complete responses. Opaque/font failures must not
      // poison the cache.
      if (response && (response.ok || response.type === 'opaque')) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => undefined);

  if (cached) {
    // Kick off a background refresh without blocking the response.
    network.catch(() => undefined);
    return cached;
  }

  const fresh = await network;
  if (fresh) return fresh;
  throw new Error('offline and not cached');
}

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') return;

  let url;
  try {
    url = new URL(request.url);
  } catch (error) {
    return;
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

  // 1) App shell / any in-app navigation.
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigation(request));
    return;
  }

  // 2) Same-origin hashed assets: safe to serve from cache.
  if (url.origin === self.location.origin && CACHEABLE_DESTINATIONS.includes(request.destination)) {
    event.respondWith(staleWhileRevalidate(request, ASSET_CACHE));
    return;
  }

  // 3) Cross-origin (Google Fonts): best-effort only.
  if (url.origin !== self.location.origin) {
    event.respondWith(
      staleWhileRevalidate(request, ASSET_CACHE).catch(() =>
        fetch(request).catch(() => Response.error())
      )
    );
  }
});