const CACHE_NAME = "protouro-cache-v1";
const ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/images/isotipo.svg",
  "/images/pattern.svg",
  "/fonts/Callingstone.ttf",
  "/images/surgical/protese_anatomia_posicionamento.png",
  "/images/surgical/varicocele_microcirurgia_anatomia.png",
  "/images/surgical/rirs_calculo_renal_laser.png"
];

// Instalação do Service Worker e Caching dos Recursos Estáticos
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// Ativação e Limpeza de Caches Antigos
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Estratégia de Cache: Cache First com Fallback para Network, atualizando o cache em background (Stale-While-Revalidate)
self.addEventListener("fetch", (e) => {
  // Ignorar requisições para extensões do navegador ou APIs externas que não queremos cachear
  if (!e.request.url.startsWith(self.location.origin)) return;

  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Buscar versão mais recente em background para atualizar o cache
        fetch(e.request).then((networkResponse) => {
          if (networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(e.request, networkResponse);
            });
          }
        }).catch(() => {/* Ignorar erro de rede offline */});
        
        return cachedResponse;
      }

      return fetch(e.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== "basic") {
          return networkResponse;
        }

        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(e.request, responseToCache);
        });

        return networkResponse;
      });
    })
  );
});
