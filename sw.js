const CACHE_NAME = "goaliq-shell-v2-domestic-leagues";
const APP_SHELL = [
  "./",
  "./index.html",
  "./styles.css?v=20260714-domestic-leagues",
  "./app.js?v=20260714-domestic-leagues",
  "./manifest.webmanifest",
  "./fixtures.live.json",
  "./standings.live.json",
  "./competitions.live.json",
  "./assets/match-pitch.svg",
  "./assets/assets/match-pitch.svg",
  "./assets/goaliq-logo.jpeg",
  "./assets/goaliq-icon-192.png",
  "./assets/goaliq-icon-512.png",
  "./assets/apple-touch-icon.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const requestUrl = new URL(event.request.url);
  if (requestUrl.origin !== self.location.origin) return;

  if (["/fixtures.live.json", "/standings.live.json", "/competitions.live.json"].some((path) => requestUrl.pathname.endsWith(path))) {
    event.respondWith(networkFirst(event.request));
    return;
  }

  if (event.request.mode === "navigate") {
    event.respondWith(networkFirst(event.request, "./index.html"));
    return;
  }

  event.respondWith(cacheFirst(event.request));
});

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, response.clone());
  }
  return response;
}

async function networkFirst(request, fallbackUrl) {
  const cache = await caches.open(CACHE_NAME);

  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    if (fallbackUrl) return cache.match(fallbackUrl);
    throw new Error("GoalIQ is offline and no cached response is available.");
  }
}
