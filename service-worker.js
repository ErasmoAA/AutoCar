// service-worker.js (Corrected)

// Se cambia el nombre de la caché para forzar al navegador a que la actualice.
const CACHE_NAME = 'vehicle-care-pwa-cache-v2';

// Lista corregida de archivos a cachear. Usamos rutas relativas (./)
// para que funcione correctamente en subdirectorios como los de GitHub Pages.
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192x192.png',
  './icons/icon-512x512.png'
];

// Evento de instalación: se abre la caché y se añaden todos los archivos.
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache abierto y guardando archivos base.');
        return cache.addAll(urlsToCache);
      })
  );
});

// Evento de activación: se eliminan las cachés antiguas que no coincidan.
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Borrando caché antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
        // Le dice al service worker que tome el control de la página inmediatamente.
        return self.clients.claim();
    })
  );
});

// Evento fetch: Estrategia "Network falling back to cache".
// Intenta obtener el recurso de la red primero. Si falla (estás offline),
// lo busca en la caché. Esto asegura que los usuarios online vean siempre
// la versión más reciente, y los usuarios offline puedan seguir usando la app.
self.addEventListener('fetch', event => {
  // Ignoramos las peticiones que no son GET.
  if (event.request.method !== 'GET') {
    return;
  }
  
  event.respondWith(
    fetch(event.request)
      .catch(() => {
        // Si la petición de red falla, busca en la caché.
        return caches.match(event.request);
      })
  );
});
