const CACHE_NAME = 'amora-v1.2.0';
const STATIC_CACHE = 'amora-static-v1.2.0';
const DYNAMIC_CACHE = 'amora-dynamic-v1.2.0';
const IMAGE_CACHE = 'amora-images-v1.2.0';

// Ressources à mettre en cache immédiatement
const STATIC_ASSETS = [
  '/',
  '/auth',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/offline.html'
];

// Ressources à précharger
const PRELOAD_ASSETS = [
  '/assets/amora-logo.svg',
  '/icons/icon-maskable-512x512.png'
];

// Installation du Service Worker
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker: Installation');
  
  event.waitUntil(
    Promise.all([
      // Cache statique
      caches.open(STATIC_CACHE).then(cache => {
        console.log('📦 Cache statique créé');
        return cache.addAll(STATIC_ASSETS);
      }),
      
      // Préchargement des assets critiques
      caches.open(IMAGE_CACHE).then(cache => {
        console.log('🖼️ Préchargement des images');
        return cache.addAll(PRELOAD_ASSETS);
      })
    ])
  );
  
  // Force l'activation immédiate
  self.skipWaiting();
});

// Activation du Service Worker
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker: Activation');
  
  event.waitUntil(
    Promise.all([
      // Nettoyage des anciens caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE && 
                cacheName !== IMAGE_CACHE) {
              console.log('🗑️ Suppression ancien cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      
      // Prise de contrôle immédiate
      self.clients.claim()
    ])
  );
});

// Stratégies de cache avancées
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

async function handleRequest(request) {
  const url = new URL(request.url);
  
  try {
    // 1. API Supabase - Cache avec update en arrière-plan
    if (url.origin.includes('supabase')) {
      return handleApiRequest(request);
    }
    
    // 2. Images - Cache first avec fallback
    if (request.destination === 'image') {
      return handleImageRequest(request);
    }
    
    // 3. Pages HTML - Network first avec cache fallback
    if (request.destination === 'document') {
      return handlePageRequest(request);
    }
    
    // 4. Assets statiques - Cache first
    if (request.destination === 'script' || 
        request.destination === 'style' ||
        request.destination === 'font') {
      return handleStaticRequest(request);
    }
    
    // 5. Autres requêtes - Network first
    return handleNetworkFirst(request);
    
  } catch (error) {
    console.error('❌ Erreur Service Worker:', error);
    return handleOffline(request);
  }
}

// Gestion des requêtes API (Stale While Revalidate)
async function handleApiRequest(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cachedResponse = await cache.match(request);
  
  // Requête réseau en parallèle
  const networkPromise = fetch(request).then(response => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  });
  
  // Retourne le cache immédiatement si disponible
  if (cachedResponse) {
    networkPromise.catch(() => {}); // Ignore les erreurs réseau
    return cachedResponse;
  }
  
  return networkPromise;
}

// Gestion des images (Cache First)
async function handleImageRequest(request) {
  const cache = await caches.open(IMAGE_CACHE);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    // Retourne une image placeholder
    return new Response(
      '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="#f0f0f0"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#999">Image</text></svg>',
      { headers: { 'Content-Type': 'image/svg+xml' } }
    );
  }
}

// Gestion des pages (Network First)
async function handlePageRequest(request) {
  try {
    const response = await fetch(request);
    const cache = await caches.open(DYNAMIC_CACHE);
    cache.put(request, response.clone());
    return response;
  } catch {
    const cache = await caches.open(DYNAMIC_CACHE);
    const cachedResponse = await cache.match(request);
    return cachedResponse || caches.match('/offline.html');
  }
}

// Gestion des assets statiques (Cache First)
async function handleStaticRequest(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  const response = await fetch(request);
  if (response.ok) {
    cache.put(request, response.clone());
  }
  return response;
}

// Network First par défaut
async function handleNetworkFirst(request) {
  try {
    const response = await fetch(request);
    return response;
  } catch {
    const cache = await caches.open(DYNAMIC_CACHE);
    return cache.match(request);
  }
}

// Gestion hors ligne
async function handleOffline(request) {
  if (request.destination === 'document') {
    return caches.match('/offline.html');
  }
  return new Response('Offline', { status: 503 });
}

// Messages vers l'application
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});