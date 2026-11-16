/* LaoRus offline support. Keep the cache version in sync with index.html. */
const CACHE_NAME = "laorus-offline-v46";
const APP_CACHE_PREFIX = "laorus-offline-v";

self.addEventListener("install", (event) => {
  // Do not precache the 22 MB app shell during installation; this avoids making
  // SW installation fail on slow connections or devices with limited storage.
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys
      .filter((key) => key.startsWith(APP_CACHE_PREFIX) && key !== CACHE_NAME)
      .map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET" || request.mode !== "navigate") return;

  const requestUrl = new URL(request.url);
  const scopeUrl = new URL(self.registration.scope);
  if (requestUrl.origin !== self.location.origin ||
      !requestUrl.pathname.startsWith(scopeUrl.pathname)) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    try {
      const response = await fetch(request);
      const contentType = response.headers.get("content-type") || "";
      if (response.ok && contentType.toLowerCase().includes("text/html")) {
        // Cache only successful same-origin page navigations. The full HTML is
        // stored on the first online visit, then available as an offline fallback.
        try { await cache.put(request, response.clone()); } catch (_) { /* storage may be full */ }
      }
      return response;
    } catch (_) {
      const cached = await cache.match(request, { ignoreSearch: true });
      if (cached) return cached;
      const rootPage = await cache.match(scopeUrl.href);
      if (rootPage) return rootPage;
      return new Response(
        "LaoRus is not available offline yet. Connect to the internet and open the app once, then try again.",
        { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } }
      );
    }
  })());
});
