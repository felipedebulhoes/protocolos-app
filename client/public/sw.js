const CACHE_NAME = "protouro-cache-v3";
const ASSETS = [
  "/manifest.json",
  "/images/isotipo.svg",
  "/images/pattern.svg",
  "/fonts/Callingstone.ttf",
  "/images/surgical/protese_anatomia_posicionamento.png",
  "/images/surgical/varicocele_microcirurgia_anatomia.png",
  "/images/surgical/rirs_calculo_renal_laser.png",
];

// Instalação do Service Worker e caching apenas de assets estáticos
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS).catch(() => {
        /* Ignorar falha individual de asset para não bloquear a instalação */
      });
    })
  );
  self.skipWaiting();
});

// Ativação e limpeza de caches antigos
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.map((key) => (key !== CACHE_NAME ? caches.delete(key) : undefined)))
      )
      .then(() => self.clients.claim())
  );
});

// Detecta requisições de navegação (HTML de páginas SPA)
function isNavigationRequest(request) {
  return (
    request.mode === "navigate" ||
    (request.method === "GET" && request.headers.get("accept")?.includes("text/html"))
  );
}

self.addEventListener("fetch", (e) => {
  const { request } = e;

  // Apenas same-origin
  if (!request.url.startsWith(self.location.origin)) return;

  // Nunca cachear chamadas de API/auth — sempre rede
  const url = new URL(request.url);
  if (url.pathname.startsWith("/api") || url.pathname.startsWith("/__manus__")) {
    return; // deixa passar direto pela rede
  }

  // NAVEGAÇÃO HTML: Network First. Garante que rotas novas (ex.: /login/doctor)
  // sempre venham do servidor; cai para o cache somente offline.
  if (isNavigationRequest(request)) {
    e.respondWith(
      fetch(request)
        .then((networkResponse) => {
          const copy = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put("/index.html", copy));
          return networkResponse;
        })
        .catch(() => caches.match("/index.html"))
    );
    return;
  }

  // ASSETS ESTÁTICOS: Stale-While-Revalidate
  e.respondWith(
    caches.match(request).then((cachedResponse) => {
      const networkFetch = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === "basic") {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseToCache));
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || networkFetch;
    })
  );
});
