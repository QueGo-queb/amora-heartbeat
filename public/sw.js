// Version statique basée sur le build - CHANGE SEULEMENT QUAND LE CODE CHANGE
const VERSION = 'amora-v1.0.1'; // ⚠️ INCRÉMENTER À CHAQUE DÉPLOIEMENT
const STATIC_CACHE = `amora-static-${VERSION}`;
const DYNAMIC_CACHE = `amora-dynamic-${VERSION}`;
const IMAGE_CACHE = `amora-images-${VERSION}`;

// Ressources essentielles à mettre en cache immédiatement
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/offline.html'
];

// Installation du Service Worker - Mise à jour automatique
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker: Installation de la version', VERSION);
  
  event.waitUntil(
    Promise.all([
      // Cache des fichiers essentiels
      caches.open(STATIC_CACHE).then(cache => {
        console.log('📦 Mise en cache des fichiers essentiels');
        return cache.addAll(STATIC_ASSETS);
      })
    ])
  );
  
  // Force l'activation immédiate - MISE À JOUR AUTOMATIQUE
  console.log('⚡ Activation immédiate de la nouvelle version');
  self.skipWaiting();
});

// Activation du Service Worker - Nettoyage et prise de contrôle
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker: Activation de la version', VERSION);
  
  event.waitUntil(
    Promise.all([
      // Nettoyage des anciens caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (!cacheName.includes(VERSION)) {
              console.log('🗑️ Suppression ancien cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      
      // Prise de contrôle immédiate de tous les clients
      self.clients.claim()
    ])
  );
  
  // Notifier tous les clients de la mise à jour
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({ 
        type: 'SW_UPDATED', 
        version: VERSION,
        message: 'Nouvelle version installée automatiquement'
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

// Gestion des requêtes avec stratégie Network First pour les mises à jour
async function handleRequest(request) {
  const url = new URL(request.url);
  
  try {
    // 1. Essayer d'abord le réseau pour les mises à jour immédiates
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // 2. Mettre à jour le cache en arrière-plan
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
      console.log('💾 Cache mis à jour:', request.url);
      
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

// Messages vers l'application
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('⚡ Demande de mise à jour immédiate reçue');
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: VERSION });
  }
});