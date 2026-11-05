// Offline support for the installed app. Everything the generator does runs in the browser, so
// once its pages and assets are cached it works without a connection.
//
// - Pages: network first, so a deploy shows up as soon as there is a connection; offline, the
//   cached copy (or the home page) answers.
// - Hashed assets (/_next/static): cache first; their names change with every deploy, and the
//   cache is trimmed so old builds don't pile up.
// - Icons, the manifest and screenshots keep their names across deploys: served from the cache
//   at once and refreshed in the background, so a new icon shows up on the next visit.
// - Analytics (/_vercel), other origins and anything but GET go straight to the network.

// Bumping it drops every cache from earlier versions when the new worker activates.
const VERSION = 'v2';
const PAGES = `pages-${VERSION}`;
const ASSETS = `assets-${VERSION}`;
const ASSET_LIMIT = 200;

const isHashed = (url) => url.pathname.startsWith('/_next/static/');
const isStatic = (url) =>
  /^\/(favicon\.svg|apple-touch-icon\.png|icon-[\w-]+\.png|manifest\.webmanifest|screenshots\/)/.test(url.pathname);
const isAsset = (url) => isHashed(url) || isStatic(url);

const isOwnGet = (request, url) =>
  request.method === 'GET' && url.origin === self.location.origin && !url.pathname.startsWith('/_vercel/');

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(PAGES)
      .then((cache) => cache.add(new Request('/', { cache: 'reload' })))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== PAGES && key !== ASSETS).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  );
});

async function trim(cache) {
  const keys = await cache.keys();
  await Promise.all(keys.slice(0, Math.max(0, keys.length - ASSET_LIMIT)).map((key) => cache.delete(key)));
}

async function networkFirst(request) {
  const cache = await caches.open(PAGES);
  try {
    const response = await fetch(request);
    if (response.ok) await cache.put(request, response.clone());
    return response;
  } catch {
    return (await cache.match(request, { ignoreSearch: true })) ?? (await cache.match('/')) ?? Response.error();
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(ASSETS);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) {
    await cache.put(request, response.clone());
    await trim(cache);
  }
  return response;
}

async function staleWhileRevalidate(event) {
  const cache = await caches.open(ASSETS);
  const cached = await cache.match(event.request);
  // no-cache: ask the server (a cheap 304 when unchanged) instead of the browser's own day-long copy.
  const refresh = fetch(event.request, { cache: 'no-cache' })
    .then(async (response) => {
      if (response.ok) await cache.put(event.request, response.clone());
      return response;
    })
    .catch(() => cached ?? Response.error());
  if (!cached) return refresh;
  event.waitUntil(refresh);
  return cached;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (!isOwnGet(request, url)) return;
  if (request.mode === 'navigate') event.respondWith(networkFirst(request));
  else if (isHashed(url)) event.respondWith(cacheFirst(request));
  else if (isStatic(url)) event.respondWith(staleWhileRevalidate(event));
});

// The first visit loads before this worker controls the page, so the page sends what it used
// (its address and its assets) to be cached right away; the app then works offline from the start.
self.addEventListener('message', (event) => {
  if (event.data?.type !== 'cache' || !Array.isArray(event.data.urls)) return;
  event.waitUntil(
    Promise.all(
      event.data.urls.map(async (href) => {
        const url = new URL(href, self.location.origin);
        if (url.origin !== self.location.origin) return;
        const name = isAsset(url) ? ASSETS : url.pathname.includes('.') ? null : PAGES;
        if (!name) return;
        const cache = await caches.open(name);
        if (!(await cache.match(url.href))) await cache.add(url.href).catch(() => {});
      }),
    ),
  );
});
