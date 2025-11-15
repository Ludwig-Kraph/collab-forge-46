// M-Leja Service Worker - resilient cache strategy to avoid stale assets
// - Network-first for HTML (index.html) so new builds are picked up immediately
// - Stale-while-revalidate for static assets (hashed filenames)
// - Runtime cache for other GET requests
// - Fast activation via skipWaiting + clients.claim

const APP_CACHE = 'm-leja-app-v2';
const ASSET_CACHE = 'm-leja-assets-v2';
const CACHE_WHITELIST = [APP_CACHE, ASSET_CACHE];

self.addEventListener('install', (event) => {
  // Activate new SW immediately
  self.skipWaiting();
  event.waitUntil(
    caches.open(APP_CACHE).then((cache) => cache.addAll(['/', '/index.html', '/manifest.json']))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.map((key) => {
          if (!CACHE_WHITELIST.includes(key)) {
            return caches.delete(key);
          }
        })
      );
      await self.clients.claim();
    })()
  );
});

const ASSET_EXTENSIONS = [
  '.js',
  '.css',
  '.woff2',
  '.woff',
  '.ttf',
  '.eot',
  '.png',
  '.jpg',
  '.jpeg',
  '.svg',
  '.webp',
];

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return; // don't cache non-GET

  const url = new URL(req.url);

  // Bypass third-party requests and dev/node_modules paths
  if (url.hostname !== self.location.hostname || url.pathname.includes('/node_modules/')) {
    return; // passthrough to network
  }

  // HTML navigations: network-first to avoid stale index.html
  const accept = req.headers.get('accept') || '';
  if (req.mode === 'navigate' || accept.includes('text/html')) {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(req, { cache: 'no-store' });
          const cache = await caches.open(APP_CACHE);
          cache.put(req, fresh.clone());
          return fresh;
        } catch (e) {
          const cached = await caches.match(req);
          return cached || (await caches.match('/index.html'));
        }
      })()
    );
    return;
  }

  // Static assets: stale-while-revalidate for speed + freshness
  const isAsset = ASSET_EXTENSIONS.some((ext) => url.pathname.endsWith(ext));
  if (isAsset) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(ASSET_CACHE);
        const cached = await cache.match(req);
        const networkPromise = fetch(req)
          .then((response) => {
            if (response && response.status === 200 && response.type === 'basic') {
              cache.put(req, response.clone());
            }
            return response;
          })
          .catch(() => cached);
        return cached || networkPromise;
      })()
    );
    return;
  }

  // Default: network-first with cache fallback
  event.respondWith(
    (async () => {
      try {
        const response = await fetch(req);
        const cache = await caches.open(ASSET_CACHE);
        if (response && response.status === 200 && response.type === 'basic') {
          cache.put(req, response.clone());
        }
        return response;
      } catch (e) {
        const cached = await caches.match(req);
        return cached;
      }
    })()
  );
});

// Allow page to trigger immediate activation of a waiting SW
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
