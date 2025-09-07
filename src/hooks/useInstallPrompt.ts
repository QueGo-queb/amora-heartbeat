import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export const useInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  useEffect(() => {
    // Vérifier si l'app est déjà installée
    const checkIfInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isInWebAppiOS = (window.navigator as any).standalone === true;
      const isInstalled = isStandalone || isInWebAppiOS;
      
      setIsInstalled(isInstalled);
      
      // Ne pas afficher la bannière si déjà installé
      if (isInstalled) {
        setShowInstallBanner(false);
        return;
      }

      // Vérifier si l'utilisateur a déjà refusé l'installation
      const installDismissed = localStorage.getItem('amora-install-dismissed');
      const lastDismissed = installDismissed ? parseInt(installDismissed) : 0;
      const now = Date.now();
      const daysSinceDismissed = (now - lastDismissed) / (1000 * 60 * 60 * 24);

      // Réafficher après 7 jours
      if (!installDismissed || daysSinceDismissed > 7) {
        setShowInstallBanner(true);
      }
    };

    checkIfInstalled();

    // Écouter l'événement beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);
      setIsInstallable(true);
      
      // Afficher la bannière seulement si pas déjà installé
      if (!isInstalled) {
        setShowInstallBanner(true);
      }
    };

    // Écouter l'installation réussie
    const handleAppInstalled = () => {
      console.log('🎉 AMORA PWA installée avec succès');
      setIsInstalled(true);
      setIsInstallable(false);
      setShowInstallBanner(false);
      setDeferredPrompt(null);
      
      // Analytics - tracker l'installation
      if (typeof gtag !== 'undefined') {
        gtag('event', 'pwa_install', {
          event_category: 'PWA',
          event_label: 'Installation réussie'
        });
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isInstalled]);

  // Déclencher l'installation
  const promptInstall = async (): Promise<boolean> => {
    if (!deferredPrompt) {
      console.log('Pas de prompt d\'installation disponible');
      return false;
    }

    try {
      // Afficher le prompt natif
      await deferredPrompt.prompt();
      
      // Attendre la réponse de l'utilisateur
      const { outcome } = await deferredPrompt.userChoice;
      
      console.log(`Résultat installation: ${outcome}`);
      
      if (outcome === 'accepted') {
        console.log('✅ Utilisateur a accepté l\'installation');
        setShowInstallBanner(false);
        
        // Analytics
        if (typeof gtag !== 'undefined') {
          gtag('event', 'pwa_install_accepted', {
            event_category: 'PWA',
            event_label: 'Installation acceptée'
          });
        }
        
        return true;
      } else {
        console.log('❌ Utilisateur a refusé l\'installation');
        dismissInstallBanner();
        
        // Analytics
        if (typeof gtag !== 'undefined') {
          gtag('event', 'pwa_install_dismissed', {
            event_category: 'PWA',
            event_label: 'Installation refusée'
          });
        }
        
        return false;
      }
    } catch (error) {
      console.error('Erreur lors de l\'installation:', error);
      return false;
    } finally {
      setDeferredPrompt(null);
      setIsInstallable(false);
    }
  };

  // Masquer la bannière d'installation
  const dismissInstallBanner = () => {
    setShowInstallBanner(false);
    localStorage.setItem('amora-install-dismissed', Date.now().toString());
    
    // Analytics
    if (typeof gtag !== 'undefined') {
      gtag('event', 'pwa_banner_dismissed', {
        event_category: 'PWA',
        event_label: 'Bannière fermée'
      });
    }
  };

  // Réinitialiser le statut d'installation (pour les tests)
  const resetInstallPrompt = () => {
    localStorage.removeItem('amora-install-dismissed');
    setShowInstallBanner(true);
  };

  // Obtenir les instructions d'installation par navigateur
  const getInstallInstructions = (): string => {
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (userAgent.includes('chrome') && !userAgent.includes('edg')) {
      return "Cliquez sur le bouton 'Installer' ou sur l'icône d'installation dans la barre d'adresse.";
    } else if (userAgent.includes('firefox')) {
      return "Ajoutez cette page à votre écran d'accueil via le menu du navigateur.";
    } else if (userAgent.includes('safari')) {
      return "Appuyez sur le bouton de partage puis 'Ajouter à l'écran d'accueil'.";
    } else if (userAgent.includes('edg')) {
      return "Cliquez sur le menu Edge puis 'Applications' > 'Installer cette application'.";
    } else {
      return "Consultez les options de votre navigateur pour installer cette application.";
    }
  };

  return {
    isInstallable,
    isInstalled,
    showInstallBanner,
    promptInstall,
    dismissInstallBanner,
    resetInstallPrompt,
    getInstallInstructions,
    canInstall: !!deferredPrompt
  };
};
