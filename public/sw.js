// Version dynamique basée sur la date pour forcer les mises à jour
const VERSION = `amora-v${Date.now()}`;
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

// Stratégie de cache : Cache First avec mise à jour en arrière-plan
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

// Gestion des requêtes avec stratégie Cache First
async function handleRequest(request) {
  const url = new URL(request.url);
  
  try {
    // 1. Vérifier d'abord le cache
    const cache = await caches.open(STATIC_CACHE);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      console.log('📦 Ressource servie depuis le cache:', request.url);
      
      // Mise à jour en arrière-plan si c'est une ressource statique
      if (url.origin === location.origin) {
        fetch(request).then(response => {
          if (response.ok) {
            cache.put(request, response.clone());
            console.log('🔄 Cache mis à jour en arrière-plan:', request.url);
          }
        }).catch(() => {
          // Ignore les erreurs de mise à jour en arrière-plan
        });
      }
      
      return cachedResponse;
    }
    
    // 2. Si pas en cache, aller chercher sur le réseau
    console.log('🌐 Ressource récupérée depuis le réseau:', request.url);
    const response = await fetch(request);
    
    // 3. Mettre à jour le cache si la réponse est valide
    if (response.ok) {
      cache.put(request, response.clone());
      console.log('💾 Ressource mise en cache:', request.url);
    }
    
    return response;
    
  } catch (error) {
    console.error('❌ Erreur Service Worker:', error);
    
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