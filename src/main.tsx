import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Enregistrer le Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });
      
      console.log('✅ Service Worker enregistré:', registration.scope);
      
      // Écouter les mises à jour du Service Worker
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // Nouvelle version disponible
              console.log('🔄 Nouvelle version disponible');
              
              // Optionnel: Afficher une notification de mise à jour
              if (confirm('Une nouvelle version d\'AMORA est disponible. Recharger maintenant ?')) {
                newWorker.postMessage({ type: 'SKIP_WAITING' });
                window.location.reload();
              }
            }
          });
        }
      });
      
    } catch (error) {
      console.error('❌ Erreur enregistrement Service Worker:', error);
    }
  });

  // Écouter les messages du Service Worker
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SW_UPDATED') {
      window.location.reload();
    }
  });
}

createRoot(document.getElementById("root")!).render(<App />);
