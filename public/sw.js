const CACHE_NAME = 'asara-v1';
const STATIC_ASSETS = [
  '/',
  '/fr/forum',
  '/fr/annuaire',
  '/fr/newsletter',
  '/images/logo.png',
  '/images/logo-sm.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // ✅ CRITIQUE : ignorer toutes les requêtes non-GET (POST, PUT, DELETE...)
  // Cache.put() ne supporte que GET — sans ce guard, TypeError sur logout/login
  if (event.request.method !== 'GET') {
    return;
  }

  const url = new URL(event.request.url);

  // APIs → Network only (jamais en cache — données fraîches obligatoires)
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
        // ✅ Ne cacher que les réponses GET valides (status 200, type basic/cors)
        if (
          response &&
          response.status === 200 &&
          (response.type === 'basic' || response.type === 'cors')
        ) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            try {
              cache.put(event.request, clone);
            } catch {
              // Certaines réponses ne peuvent pas être mises en cache — silent
            }
          });
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});