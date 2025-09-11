// Script de nettoyage complet des caches et service workers
console.log(' Démarrage du nettoyage complet...');

if ('serviceWorker' in navigator) {
  // 1. Désinscrire TOUS les service workers
  navigator.serviceWorker.getRegistrations().then(registrations => {
    console.log(`🗑️ Désinscription de ${registrations.length} service workers...`);
    
    registrations.forEach(registration => {
      registration.unregister();
      console.log('✅ Service Worker désinscrit:', registration.scope);
    });
  });
  
  // 2. Nettoyer TOUS les caches
  caches.keys().then(cacheNames => {
    console.log(`🗑️ Suppression de ${cacheNames.length} caches...`);
    
    cacheNames.forEach(cacheName => {
      caches.delete(cacheName);
      console.log('✅ Cache supprimé:', cacheName);
    });
  });
  
  // 3. Nettoyer le localStorage et sessionStorage
  localStorage.clear();
  sessionStorage.clear();
  console.log('✅ Storage nettoyé');
  
  // 4. Recharger la page après nettoyage
  setTimeout(() => {
    console.log('🔄 Rechargement de la page...');
    window.location.reload(true); // Force reload
  }, 2000);
} else {
  console.log('❌ Service Worker non supporté');
}
