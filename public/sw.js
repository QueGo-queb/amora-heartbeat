// Version statique basée sur le build - CHANGE SEULEMENT QUAND LE CODE CHANGE
const VERSION = 'amora-v1.0.3'; // ⚠️ INCRÉMENTER À CHAQUE DÉPLOIEMENT
const STATIC_CACHE = `amora-static-${VERSION}`;
const DYNAMIC_CACHE = `amora-dynamic-${VERSION}`;
const IMAGE_CACHE = `amora-images-${VERSION}`;

// ✅ CORRECTION LOVABLE: Ressources adaptées à l'environnement
const STATIC_ASSETS = [
  './',
  './index.html',
  './favicon.ico',
  './icons/icon-192x192.png',
  './icons/icon-512x512.png',
  './offline.html'
  // ✅ Retirer manifest.json qui cause des problèmes CORS
];

// ✅ MISE À JOUR SILENCIEUSE - Installation automatique
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker: Installation silencieuse de la version', VERSION);
  
  // ✅ FORCER L'ACTIVATION IMMÉDIATE - Pas d'attente
  self.skipWaiting();
  
  event.waitUntil(
    Promise.all([
      // Cache des fichiers essentiels en arrière-plan
      caches.open(STATIC_CACHE).then(cache => {
        console.log('📦 Mise en cache silencieuse des fichiers essentiels');
        return cache.addAll(STATIC_ASSETS).catch(err => {
          console.warn('⚠️ Erreur cache, continue sans bloquer:', err);
        });
      })
    ])
  );
});

// ✅ MISE À JOUR SILENCIEUSE - Activation automatique
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker: Activation silencieuse de la version', VERSION);
  
  event.waitUntil(
    Promise.all([
      // Nettoyage automatique des anciens caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (!cacheName.includes(VERSION)) {
              console.log('🗑️ Nettoyage silencieux ancien cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      
      // ✅ PRISE DE CONTRÔLE IMMÉDIATE - Pas d'attente utilisateur
      self.clients.claim()
    ])
  );
  
  // ✅ NOTIFICATION SILENCIEUSE - Pas de popup
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({ 
        type: 'SW_UPDATED_SILENT', 
        version: VERSION,
        message: 'Mise à jour appliquée automatiquement'
      });
    });
  });
});

// Stratégie de cache : Network First pour les mises à jour immédiates
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Ignore les requêtes non-GET
  if (request.method !== 'GET') return;
  
  // Ignore les requêtes externes (sauf Supabase et APIs)
  if (!url.origin.includes(location.origin) && 
      !url.origin.includes('supabase') &&
      !url.origin.includes('stripe')) {
    return;
  }
  
  event.respondWith(handleRequest(request));
});

// ✅ Gestion des requêtes avec stratégie Network First pour les mises à jour
async function handleRequest(request) {
  const url = new URL(request.url);
  
  // ✅ CORRECTION LOVABLE: Ignorer les requêtes auth-bridge et problématiques
  if (url.href.includes('auth-bridge') || 
      url.href.includes('lovable.dev') ||
      url.href.includes('manifest.json')) {
    console.log('🚫 Requête ignorée par SW:', url.href);
    return fetch(request);
  }
  
  try {
    // 1. Essayer d'abord le réseau pour les mises à jour immédiates
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // 2. Mettre à jour le cache en arrière-plan (seulement pour les ressources valides)
      if (!url.href.includes('lovableproject.com')) {
        const cache = await caches.open(STATIC_CACHE);
        cache.put(request, networkResponse.clone());
        console.log('💾 Cache mis à jour silencieusement:', request.url);
      }
      
      return networkResponse;
    }
    
    // 3. Fallback sur le cache si le réseau échoue
    const cache = await caches.open(STATIC_CACHE);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      console.log('📦 Ressource servie depuis le cache:', request.url);
      return cachedResponse;
    }
    
    return networkResponse;
    
  } catch (error) {
    console.error('❌ Erreur Service Worker:', error);
    
    // Fallback sur le cache
    const cache = await caches.open(STATIC_CACHE);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Fallback pour les pages HTML
    if (request.destination === 'document') {
      return caches.match('/offline.html');
    }
    
    return new Response('Ressource non disponible', { status: 503 });
  }
}

// ✅ Messages vers l'application - Mise à jour silencieuse
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('⚡ Mise à jour silencieuse demandée');
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: VERSION });
  }
});