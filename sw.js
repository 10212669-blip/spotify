
/* ════════════════════════════════════════════
   SERVICE WORKER — sw.js
   Permite que la app funcione offline
   ════════════════════════════════════════════ */

const CACHE_NAME   = 'music-player-v1';
const CACHE_STATIC = 'music-player-static-v1';

/* Archivos que siempre se cachean (la app en sí) */
const STATIC_FILES = [
  '/',
  '/index.html',
  '/styles.css',
  '/player.js',
  '/manifest.json',
];

/* ── INSTALL: cachea los archivos estáticos ── */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_STATIC).then(cache => {
      console.log('[SW] Cacheando archivos estáticos');
      return cache.addAll(STATIC_FILES);
    })
  );
  self.skipWaiting();
});

/* ── ACTIVATE: limpia cachés viejos ── */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== CACHE_STATIC && k !== CACHE_NAME)
          .map(k => {
            console.log('[SW] Borrando caché viejo:', k);
            return caches.delete(k);
          })
      )
    )
  );
  self.clients.claim();
});

/* ── FETCH: estrategia Cache First para estáticos,
           Network First para mp3/imágenes ── */
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  /* Archivos de música: Network First (para que siempre
     tengas el archivo actualizado, pero funciona offline
     si ya fue cacheado antes) */
  if (url.pathname.endsWith('.mp3') || url.pathname.match(/\.(jpg|jpeg|png|webp)$/)) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          /* Guardar copia en caché */
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  /* Todo lo demás: Cache First */
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (!response.ok) return response;
        const clone = response.clone();
        caches.open(CACHE_STATIC).then(cache => cache.put(event.request, clone));
        return response;
      });
    })
  );
});