// Service worker d'Echo : permet d'ouvrir l'app et de réviser sans connexion.
//
// - Pages de l'app : réseau d'abord, sinon la dernière version gardée en cache
// - Fichiers de l'app (JS, polices, images) : cache d'abord (leurs noms changent à chaque version)
// - Données Supabase (lecture seulement) : réseau d'abord, sinon la dernière réponse gardée
//   → les decks déjà ouverts restent consultables hors ligne
// Les écritures (réponses, sessions…) ne passent pas par ici : l'app les met en file d'attente.

const VERSION = 'echo-v1';
const SHELL_CACHE = `${VERSION}-shell`;
const STATIC_CACHE = `${VERSION}-static`;
const DATA_CACHE = 'echo-data'; // vidé à la déconnexion par l'app

const APP_SHELL = ['/', '/manifest.json', '/icons/icon-192.png', '/icons/icon-512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(SHELL_CACHE).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Supprime les caches des anciennes versions de l'app
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k !== SHELL_CACHE && k !== STATIC_CACHE && k !== DATA_CACHE)
            .map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

async function networkFirst(request, cacheName, fallbackKey) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(fallbackKey || request, response.clone());
    return response;
  } catch (err) {
    const cached = await cache.match(fallbackKey || request);
    if (cached) return cached;
    throw err;
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) cache.put(request, response.clone());
  return response;
}

// Au 1er chargement, le JS et les polices sont téléchargés AVANT que le service worker soit actif.
// La page nous envoie donc la liste de ces fichiers pour qu'on les garde en cache.
self.addEventListener('message', (event) => {
  if (event.data?.type !== 'CACHE_URLS') return;
  const urls = (event.data.urls || []).filter((u) => {
    try {
      return new URL(u).origin === self.location.origin;
    } catch {
      return false;
    }
  });
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) =>
      Promise.all(urls.map((u) => cache.match(u).then((hit) => hit || cache.add(u).catch(() => {})))),
    ),
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);

  // Données Supabase en lecture (tables uniquement : pas l'authentification)
  if (url.hostname.endsWith('.supabase.co')) {
    if (url.pathname.startsWith('/rest/v1/')) {
      event.respondWith(networkFirst(request, DATA_CACHE));
    }
    return;
  }

  if (url.origin !== self.location.origin) return;

  // Navigation (ouvrir l'app, changer de page) : toutes les routes utilisent la même page HTML
  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request, SHELL_CACHE, '/'));
    return;
  }

  // Fichiers de l'app
  event.respondWith(cacheFirst(request));
});
