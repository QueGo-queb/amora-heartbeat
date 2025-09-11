import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Enregistrement du Service Worker avec mise à jour automatique
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });
      
      console.log('✅ Service Worker enregistré avec succès:', registration.scope);
      
      // Écouter les mises à jour du Service Worker
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          console.log('🔄 Nouvelle version du Service Worker détectée');
          
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('⚡ Nouvelle version installée - Mise à jour automatique en cours...');
              
              // MISE À JOUR AUTOMATIQUE - Pas de confirmation utilisateur
              newWorker.postMessage({ type: 'SKIP_WAITING' });
              
              // Rechargement automatique après un court délai
              setTimeout(() => {
                console.log('🔄 Rechargement automatique de l\'application');
                window.location.reload();
              }, 1000);
            }
          });
        }
      });
      
      // Écouter les messages du Service Worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'SW_UPDATED') {
          console.log('🎉 Mise à jour automatique terminée:', event.data.message);
          console.log('📱 Version:', event.data.version);
        }
      });
      
    } catch (error) {
      console.error('❌ Erreur enregistrement Service Worker:', error);
    }
  });
}

createRoot(document.getElementById("root")!).render(<App />);

// Vérifier la version du Service Worker
navigator.serviceWorker.ready.then(registration => {
  console.log('Service Worker prêt:', registration);
});

// Vérifier les caches
caches.keys().then(cacheNames => {
  console.log('Caches disponibles:', cacheNames);
});
