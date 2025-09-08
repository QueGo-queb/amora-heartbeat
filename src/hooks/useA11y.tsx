import { useEffect, useRef, useState } from 'react';

interface A11yOptions {
  announceChanges?: boolean;
  focusManagement?: boolean;
  keyboardNavigation?: boolean;
}

export const useA11y = (options: A11yOptions = {}) => {
  const {
    announceChanges = true,
    focusManagement = true,
    keyboardNavigation = true
  } = options;

  const announcerRef = useRef<HTMLDivElement>(null);
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  // Détection des préférences d'accessibilité
  useEffect(() => {
    // Contraste élevé
    const highContrastQuery = window.matchMedia('(prefers-contrast: high)');
    setIsHighContrast(highContrastQuery.matches);
    
    const handleHighContrastChange = (e: MediaQueryListEvent) => {
      setIsHighContrast(e.matches);
    };
    
    highContrastQuery.addEventListener('change', handleHighContrastChange);

    // Mouvement réduit
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(reducedMotionQuery.matches);
    
    const handleReducedMotionChange = (e: MediaQueryListEvent) => {
      setIsReducedMotion(e.matches);
    };
    
    reducedMotionQuery.addEventListener('change', handleReducedMotionChange);

    return () => {
      highContrastQuery.removeEventListener('change', handleHighContrastChange);
      reducedMotionQuery.removeEventListener('change', handleReducedMotionChange);
    };
  }, []);

  // Fonction pour annoncer du contenu aux lecteurs d'écran
  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (!announceChanges || !announcerRef.current) return;

    const announcer = announcerRef.current;
    announcer.setAttribute('aria-live', priority);
    announcer.textContent = message;

    // Nettoyer après 1 seconde
    setTimeout(() => {
      if (announcer) {
        announcer.textContent = '';
      }
    }, 1000);
  };

  // Gestion du focus
  const focusElement = (selector: string | HTMLElement) => {
    if (!focusManagement) return;

    const element = typeof selector === 'string' 
      ? document.querySelector(selector) as HTMLElement
      : selector;

    if (element && element.focus) {
      element.focus();
      
      // Scroll vers l'élément si nécessaire
      element.scrollIntoView({
        behavior: isReducedMotion ? 'auto' : 'smooth',
        block: 'center'
      });
    }
  };

  // Gestionnaire de navigation clavier
  const handleKeyboardNavigation = (
    event: React.KeyboardEvent,
    handlers: Record<string, () => void>
  ) => {
    if (!keyboardNavigation) return;

    const key = event.key;
    if (handlers[key]) {
      event.preventDefault();
      handlers[key]();
    }
  };

  // Composant d'annonce pour les lecteurs d'écran
  const ScreenReaderAnnouncer = () => (
    <div
      ref={announcerRef}
      className="sr-only"
      aria-live="polite"
      aria-atomic="true"
    />
  );

  return {
    announce,
    focusElement,
    handleKeyboardNavigation,
    ScreenReaderAnnouncer,
    isHighContrast,
    isReducedMotion,
    preferences: {
      highContrast: isHighContrast,
      reducedMotion: isReducedMotion
    }
  };
};

// Hook pour la navigation au clavier dans les listes
export const useKeyboardListNavigation = (
  items: any[],
  onSelect?: (index: number) => void
) => {
  const [activeIndex, setActiveIndex] = useState(-1);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setActiveIndex(prev => Math.min(prev + 1, items.length - 1));
        break;
      case 'ArrowUp':
        event.preventDefault();
        setActiveIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'Home':
        event.preventDefault();
        setActiveIndex(0);
        break;
      case 'End':
        event.preventDefault();
        setActiveIndex(items.length - 1);
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (activeIndex >= 0 && onSelect) {
          onSelect(activeIndex);
        }
        break;
      case 'Escape':
        setActiveIndex(-1);
        break;
    }
  };

  return {
    activeIndex,
    handleKeyDown,
    setActiveIndex
  };
};
