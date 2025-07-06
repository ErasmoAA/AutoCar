// service-worker.js

// Define a unique cache name. Change this name to force update the cache.
const CACHE_NAME = 'vehicle-care-pwa-cache-v1';

// List of files to cache upon installation.
const urlsToCache = [
  '/',
  'index.html',
  // Note: CSS and JS are inlined in index.html, so no need to cache them separately.
  // If you split them into separate files (style.css, main.js), add them here.
  'manifest.json',
  'icons/icon-192x192.png',
  'icons/icon-512x512.png'
];

// Install event: triggered when the service worker is first installed.
self.addEventListener('install', event => {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache abierto');
        // Add all specified URLs to the cache.
        return cache.addAll(urlsToCache);
      })
  );
});

// Activate event: triggered after installation. Used to clean up old caches.
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // If a cache exists that is not our current one, delete it.
          if (cacheName !== CACHE_NAME) {
            console.log('Borrando caché antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Take control of the page immediately.
  return self.clients.claim();
});


// Fetch event: triggered for every network request made by the page.
self.addEventListener('fetch', event => {
  // We only want to handle GET requests.
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    // First, try to find a matching response in the cache.
    caches.match(event.request)
      .then(cachedResponse => {
        // If a cached response is found, return it.
        if (cachedResponse) {
          return cachedResponse;
        }

        // If not found in cache, fetch it from the network.
        return fetch(event.request).then(
            networkResponse => {
                // Check if we received a valid response
                if(!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                    return networkResponse;
                }

                // IMPORTANT: Clone the response. A response is a stream
                // and because we want the browser to consume the response
                // as well as the cache consuming the response, we need
                // to clone it so we have two streams.
                const responseToCache = networkResponse.clone();

                caches.open(CACHE_NAME)
                    .then(cache => {
                        cache.put(event.request, responseToCache);
                    });

                return networkResponse;
            }
        );
      }
    ).catch(() => {
        // If both cache and network fail (e.g., offline and not cached),
        // you could return a fallback offline page here if you had one.
        // For this app, the main 'index.html' should be cached, so this is less critical.
    })
  );
});
