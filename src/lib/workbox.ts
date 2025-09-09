import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import { StaleWhileRevalidate, CacheFirst, NetworkFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';

declare const self: ServiceWorkerGlobalScope;

// Activer le cleanup automatique des anciens caches
cleanupOutdatedCaches();

// Précache des assets critiques
precacheAndRoute(self.__WB_MANIFEST);

// Stratégie pour les API Supabase - Stale While Revalidate
registerRoute(
  ({ url }) => url.origin.includes('supabase.co'),
  new StaleWhileRevalidate({
    cacheName: 'supabase-api-cache',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 60 * 60 * 24, // 24 heures
        purgeOnQuotaError: true,
      }),
    ],
  })
);

// Stratégie pour les images - Cache First
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images-cache',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 200,
        maxAgeSeconds: 60 * 60 * 24 * 30, // 30 jours
        purgeOnQuotaError: true,
      }),
    ],
  })
);

// Stratégie pour les assets statiques - Cache First
registerRoute(
  ({ request }) => 
    request.destination === 'script' ||
    request.destination === 'style' ||
    request.destination === 'font',
  new CacheFirst({
    cacheName: 'static-assets-cache',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 60 * 60 * 24 * 365, // 1 an
        purgeOnQuotaError: true,
      }),
    ],
  })
);

// Stratégie pour les pages - Network First
const navigationRoute = new NavigationRoute(
  new NetworkFirst({
    cacheName: 'pages-cache',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 60 * 60 * 24, // 24 heures
      }),
    ],
  })
);
registerRoute(navigationRoute);

// Gestion des événements avancés
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Notification de mise à jour disponible
self.addEventListener('controlling', () => {
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({
        type: 'SW_UPDATED',
        message: 'Une nouvelle version est disponible!'
      });
    });
  });
});

console.log('🚀 Workbox Service Worker initialisé avec succès');