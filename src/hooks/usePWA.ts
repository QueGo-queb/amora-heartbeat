import { useState, useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

interface PWAState {
  isOffline: boolean;
  needRefresh: boolean;
  updateServiceWorker: () => void;
  installPrompt: BeforeInstallPromptEvent | null;
  canInstall: boolean;
  install: () => Promise<void>;
}

export const usePWA = (): PWAState => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [canInstall, setCanInstall] = useState(false);

  const {
    needRefresh,
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(registration) {
      console.log('✅ SW registered:', registration);
    },
    onRegisterError(error) {
      console.error('❌ SW registration error:', error);
    },
    onOfflineReady() {
      console.log('📱 PWA ready to work offline');
    },
  });

  useEffect(() => {
    // Gestion de l'état réseau
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Gestion de l'installation PWA
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
      setCanInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Gestion de l'installation réussie
    const handleAppInstalled = () => {
      setInstallPrompt(null);
      setCanInstall(false);
      console.log('✅ PWA installée avec succès');
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const install = async (): Promise<void> => {
    if (!installPrompt) return;

    const result = await installPrompt.prompt();
    console.log('🔄 Install prompt result:', result);
    
    setInstallPrompt(null);
    setCanInstall(false);
  };

  return {
    isOffline,
    needRefresh,
    updateServiceWorker,
    installPrompt,
    canInstall,
    install,
  };
};
