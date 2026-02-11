
const CACHE_NAME = 'premier-appart-gold-v12';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
  'https://cdn-icons-png.flaticon.com/512/2921/2921226.png'
];

// Install Event: Cache core assets
self.addEventListener('install', (event) => {
  // Force waiting service worker to become active
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Activate Event: Clean up old caches
self.addEventListener('activate', (event) => {
  // Force active service worker to control clients immediately
  event.waitUntil(self.clients.claim());
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch Event: Serve from cache, fall back to network
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests like Google Analytics or AI Studio CDNs if they cause issues,
  // but generally we want to try catching everything.
  
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached response if found
      if (response) {
        return response;
      }
      // Otherwise fetch from network
      return fetch(event.request).catch(() => {
        // If both fail (offline + not in cache), we could return a fallback page here
        // For this app, the index.html is the fallback
        if (event.request.mode === 'navigate') {
            return caches.match('./index.html');
        }
      });
    })
  );
});
