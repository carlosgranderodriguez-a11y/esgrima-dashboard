const CACHE = "esgrima-v10";
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

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).catch(()=>{}));
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", e => {
  const url = e.request.url;
  if (url.includes('google') || url.includes('script.google')) {
    e.respondWith(fetch(e.request).catch(() => new Response("")));
    return;
  }
  // Always network first for HTML
  if (url.includes('.html')) {
    e.respondWith(
      fetch(e.request, {cache: 'no-cache'}).then(res => {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return res;
      }).catch(() => caches.match(e.request))
    );
    return;
  }
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
