/* LaoRus offline shell cache for GitHub Pages and other static hosting. */
'use strict';

const CACHE_NAME = 'laorus-shell-v1';
const APP_SHELL_URL = new URL('./', self.registration.scope).href;

self.addEventListener('install', (event) => {
  // Activate the updated worker without waiting for all old tabs to close.
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys
      .filter((key) => key.startsWith('laorus-shell-') && key !== CACHE_NAME)
      .map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const requestUrl = new URL(request.url);
  // Leave cross-origin fonts, Firebase, social sites, and APIs to the network.
  if (requestUrl.origin !== self.location.origin) return;
  // The worker should always be fetched fresh so updates can be discovered.
  if (requestUrl.pathname.endsWith('/sw.js')) return;

  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);
      try {
        const response = await fetch(request);
        if (response.ok) {
          // Cache only the main app shell; do not pre-download the ~21 MB app
          // during installation. Cache-write failure must not block the page.
          await cache.put(APP_SHELL_URL, response.clone()).catch(() => {});
        }
        return response;
      } catch (error) {
        return (await cache.match(APP_SHELL_URL)) ||
          (await cache.match(request)) ||
          new Response('LaoRus is not available offline yet. Open it online once, then try again.', {
            status: 503,
            headers: { 'Content-Type': 'text/plain; charset=utf-8' }
          });
      }
    })());
    return;
  }

  // Cache successful same-origin static files lazily. The current app is mostly
  // self-contained, so this stays small and avoids caching Firebase/API calls.
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);
    if (cached) return cached;
    try {
      const response = await fetch(request);
      if (response.ok && response.type === 'basic') {
        await cache.put(request, response.clone()).catch(() => {});
      }
      return response;
    } catch (error) {
      return new Response('', { status: 504, statusText: 'Offline' });
    }
  })());
});
