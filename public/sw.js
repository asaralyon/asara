const CACHE_NAME = 'asara-v1';
const STATIC_ASSETS = [
  '/',
  '/fr/forum',
  '/fr/annuaire',
  '/fr/newsletter',
  '/images/logo.png',
  '/images/logo-sm.png',
];

// Installation — mise en cache des assets statiques
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activation — nettoyage des anciens caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch — stratégie Network First pour les APIs, Cache First pour les assets
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // APIs → Network only (toujours frais)
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  // Assets statiques → Cache First
  if (
    url.pathname.startsWith('/images/') ||
    url.pathname.startsWith('/_next/static/')
  ) {
    event.respondWith(
      caches.match(event.request).then(
        (cached) => cached || fetch(event.request)
      )
    );
    return;
  }

  // Pages → Network First avec fallback cache
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
