const CACHE = 'transferhub-v1';
const OFFLINE = '/offline';

const PRECACHE = [
  '/',
  '/confirmed',
  '/rumours',
  '/premier-league',
  '/offline',
  '/manifest.json',
  '/favicon.svg',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (!url.protocol.startsWith('http')) return;

  e.respondWith(
    caches.match(e.request).then(cached => {
      const fetchPromise = fetch(e.request).then(res => {
        if (res.ok && url.origin === self.location.origin) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      });
      // Stale-while-revalidate for pages; network-first for API
      if (cached && url.pathname.startsWith('/api')) return fetchPromise.catch(() => cached);
      return cached || fetchPromise.catch(() => caches.match(OFFLINE));
    })
  );
});
