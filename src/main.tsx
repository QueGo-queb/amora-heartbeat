import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Enregistrement du Service Worker avec mise à jour automatique
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none' // ⚠️ IMPORTANT : Force la vérification de mise à jour
      });
      
      console.log('✅ Service Worker enregistré avec succès:', registration.scope);
      
      // Vérifier immédiatement les mises à jour
      await registration.update();
      
      // Écouter les mises à jour du Service Worker
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          console.log('🔄 Nouvelle version du Service Worker détectée');
          
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                console.log('⚡ Nouvelle version installée - Mise à jour automatique en cours...');
                
                // MISE À JOUR AUTOMATIQUE - Pas de confirmation utilisateur
                newWorker.postMessage({ type: 'SKIP_WAITING' });
                
                // Rechargement automatique immédiat
                window.location.reload();
              } else {
                console.log('🎉 Première installation du Service Worker');
              }
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
      
      // Vérifier les mises à jour toutes les 30 secondes
      setInterval(() => {
        registration.update();
      }, 30000);
      
    } catch (error) {
      console.error('❌ Erreur enregistrement Service Worker:', error);
    }
  });
}

createRoot(document.getElementById("root")!).render(<App />);
