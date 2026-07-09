const CACHE_NAME = "yugioh-fr-v18";
const FILES = ["./game.html", "./manifest.json", "./cards_fr.json", "./icon-192.png", "./icon-512.png", "./icon-512-maskable.png", "./apple-touch-icon.png"];

self.addEventListener("install", event => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(FILES).catch(()=>{})));
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Network-first pour game.html afin de toujours servir la dernière version
self.addEventListener("fetch", event => {
  const req = event.request;
  const url = new URL(req.url);
  if(req.method !== "GET") return;
  if(url.pathname.endsWith("/game.html") || url.pathname.endsWith("/")){
    event.respondWith(
      fetch(req).then(res => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then(c => c.put(req, clone));
        return res;
      }).catch(() => caches.match(req))
    );
    return;
  }
  event.respondWith(caches.match(req).then(r => r || fetch(req)));
});
