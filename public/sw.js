/* Service worker MythoMytho (web). Les bundles Expo ont des noms hachés : pas de liste de précache fixe,
   on met en cache à l'usage (stale-while-revalidate) et on sert la dernière page connue hors ligne. */
const CACHE = 'mythomytho-v2.0.1';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  // Pages : réseau d'abord (jamais une coquille HTML périmée qui pointerait vers d'anciens bundles), cache en secours.
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); return res; })
        .catch(() => caches.match(req).then((r) => r || caches.match('/'))),
    );
    return;
  }
  event.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const cached = await cache.match(req);
      const network = fetch(req)
        .then((res) => { if (res.ok) cache.put(req, res.clone()); return res; })
        .catch(() => cached ?? (req.mode === 'navigate' ? cache.match('/') : Response.error()));
      return cached ?? network;
    }),
  );
});
