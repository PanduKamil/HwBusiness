const CACHE_NAME = 'hw-data-v1';
const assets = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js'
];

// Install Service Worker
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(assets);
    })
  );
});

// Fetch data dari Cache (Biar cepet/Offline ready)``
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(res => {
      return res || fetch(e.request);
    })
  );
});