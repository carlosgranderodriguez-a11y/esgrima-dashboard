const CACHE = "esgrima-v7";
const ASSETS = [
  "./index.html",
  "./espada_masculina_2025-26.html",
  "./espada_femenina_2025-26.html",
  "./florete_masculino_2025-26.html",
  "./florete_femenino_2025-26.html",
  "./sable_masculino_2025-26.html",
  "./icon-192.png",
  "./icon-512.png"
];

// Install: cache all assets
self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).catch(()=>{})
  );
  self.skipWaiting(); // activate immediately
});

// Activate: delete old caches
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => {
        console.log('SW: eliminando caché antigua', k);
        return caches.delete(k);
      }))
    )
  );
  self.clients.claim(); // take control immediately
});

// Fetch: network first for HTML, cache first for other assets
self.addEventListener("fetch", e => {
  const url = e.request.url;

  // Always go to network for Google services
  if (url.includes('google') || url.includes('script.google')) {
    e.respondWith(fetch(e.request).catch(() => new Response("")));
    return;
  }

  // Network first for HTML files (always get latest version)
  if (url.endsWith('.html') || url.includes('.html?')) {
    e.respondWith(
      fetch(e.request).then(res => {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return res;
      }).catch(() => caches.match(e.request))
    );
    return;
  }

  // Cache first for other assets (icons, etc)
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return res;
      });
    })
  );
});
