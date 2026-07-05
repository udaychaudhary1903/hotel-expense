const CACHE_NAME = "restaurant-tracker-v2";

const urlsToCache = [
  "/",
  "/index.html"
];

self.addEventListener("install", (event) => {
  console.log("Service Worker Installed");

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );

  self.skipWaiting();
});


self.addEventListener("activate", (event) => {
  console.log("Service Worker Activated");

  event.waitUntil(
    clients.claim()
  );
});


self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});