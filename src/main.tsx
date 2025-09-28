import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// ✅ MISE À JOUR SILENCIEUSE - Enregistrement optimisé
if ('serviceWorker' in navigator && !window.location.hostname.includes('lovableproject.com')) {
  window.addEventListener('load', async () => {
    try {
      // Désinscrire tous les anciens service workers
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        console.log('🗑️ Désinscription ancien SW:', registration.scope);
        await registration.unregister();
      }
      
      // Attendre un peu pour que la désinscription soit effective
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // ✅ ENREGISTREMENT OPTIMISÉ - Mise à jour silencieuse
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: './',
        updateViaCache: 'none' // ⚠️ IMPORTANT : Force la vérification de mise à jour
      }).catch(error => {
        console.warn('⚠️ Service Worker non disponible dans cet environnement:', error);
        return null;
      });
      
      if (!registration) {
        console.log('📱 Application fonctionnant sans Service Worker');
        return;
      }
      
      console.log('✅ Service Worker enregistré avec succès:', registration.scope);
      
      // ✅ VÉRIFICATION IMMÉDIATE DES MISES À JOUR
      await registration.update();
      
      // ✅ MISE À JOUR SILENCIEUSE - Pas de popup ni bannière
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          console.log('🔄 Nouvelle version détectée - Mise à jour silencieuse...');
          
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                console.log('⚡ Mise à jour silencieuse en cours...');
                
                // ✅ MISE À JOUR AUTOMATIQUE - Pas de confirmation utilisateur
                newWorker.postMessage({ type: 'SKIP_WAITING' });
                
                // ✅ RECHARGEMENT SILENCIEUX - Pas de popup
                setTimeout(() => {
                  window.location.reload();
                }, 100); // Délai minimal pour éviter les conflits
              } else {
                console.log('🎉 Première installation du Service Worker');
              }
            }
          });
        }
      });
      
      // ✅ ÉCOUTE DES MESSAGES SILENCIEUX
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'SW_UPDATED_SILENT') {
          console.log('🎉 Mise à jour silencieuse terminée:', event.data.message);
          console.log('📱 Version:', event.data.version);
          // ✅ PAS DE POPUP - Mise à jour transparente
        }
      });
      
      // ✅ VÉRIFICATION AUTOMATIQUE DES MISES À JOUR - Toutes les 60 secondes
      const updateInterval = setInterval(() => {
        registration.update();
      }, 60000); // ✅ 60 secondes comme demandé

      // ✅ NETTOYAGE DE L'INTERVAL
      window.addEventListener('beforeunload', () => {
        clearInterval(updateInterval);
      });
      
    } catch (error) {
      console.error('❌ Erreur enregistrement Service Worker:', error);
    }
  });
} else {
  console.log('🌐 Environnement Lovable détecté - Service Worker désactivé');
}

// ✅ GESTION D'ERREUR POUR LE RENDU
try {
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    throw new Error("Élément root non trouvé");
  }
  
  createRoot(rootElement).render(<App />);
  console.log('✅ Application Amora chargée avec succès');
} catch (error) {
  console.error('❌ Erreur lors du chargement de l\'application:', error);
  
  // Fallback d'affichage d'erreur
  document.body.innerHTML = `
    <div style="
      display: flex; 
      flex-direction: column; 
      align-items: center; 
      justify-content: center; 
      height: 100vh; 
      font-family: Arial, sans-serif;
      background: linear-gradient(135deg, #8B1538 0%, #A91B5C 100%);
      color: white;
      text-align: center;
      padding: 20px;
    ">
      <h1 style="font-size: 2rem; margin-bottom: 1rem;">🚀 AMORA</h1>
      <p style="font-size: 1.2rem; margin-bottom: 2rem;">Chargement en cours...</p>
      <p style="font-size: 0.9rem; opacity: 0.8;">Si cette page persiste, rechargez la page</p>
      <button onclick="window.location.reload()" style="
        background: white; 
        color: #8B1538; 
        border: none; 
        padding: 12px 24px; 
        border-radius: 8px; 
        font-size: 1rem; 
        cursor: pointer; 
        margin-top: 1rem;
      ">
        Recharger
      </button>
    </div>
  `;
}
