/**
 * ✅ SYSTÈME DE PRELOADING INTELLIGENT
 * Charge les composants en arrière-plan selon les patterns d'usage
 */

interface PreloadStrategy {
  priority: 'high' | 'medium' | 'low';
  trigger: 'idle' | 'hover' | 'focus' | 'immediate';
  dependencies?: string[];
}

class IntelligentPreloader {
  private static instance: IntelligentPreloader;
  private preloadedComponents = new Set<string>();
  private preloadQueue: Array<{ name: string; strategy: PreloadStrategy }> = [];
  private isProcessing = false;

  static getInstance(): IntelligentPreloader {
    if (!IntelligentPreloader.instance) {
      IntelligentPreloader.instance = new IntelligentPreloader();
    }
    return IntelligentPreloader.instance;
  }

  // Configuration des stratégies de preload
  private preloadConfig: Record<string, PreloadStrategy> = {
    // Pages critiques - chargement immédiat
    'Dashboard': { priority: 'high', trigger: 'immediate' },
    'Profile': { priority: 'high', trigger: 'immediate' },
    'Messages': { priority: 'high', trigger: 'immediate' },
    
    // Pages importantes - chargement au hover
    'Matching': { priority: 'medium', trigger: 'hover' },
    'Feed': { priority: 'medium', trigger: 'hover' },
    'Settings': { priority: 'medium', trigger: 'hover' },
    
    // Pages admin - chargement conditionnel
    'AdminDashboard': { priority: 'low', trigger: 'idle' },
    'AdminUsers': { priority: 'low', trigger: 'idle' },
    'AdminAnalytics': { priority: 'low', trigger: 'idle' },
    
    // Pages premium - chargement au focus
    'PremiumPage': { priority: 'medium', trigger: 'focus' },
    
    // Composants lourds - chargement intelligent
    'PostCreator': { priority: 'medium', trigger: 'hover' },
    'ImageUploader': { priority: 'low', trigger: 'idle' },
    'VideoPlayer': { priority: 'low', trigger: 'idle' }
  };

  // Preload un composant
  async preloadComponent(componentName: string): Promise<boolean> {
    if (this.preloadedComponents.has(componentName)) {
      return true;
    }

    try {
      const strategy = this.preloadConfig[componentName];
      if (!strategy) {
        console.warn(`⚠️ Pas de stratégie de preload pour ${componentName}`);
        return false;
      }

      // Charger le composant selon sa stratégie
      await this.loadComponent(componentName);
      this.preloadedComponents.add(componentName);
      
      console.log(`✅ Composant preloadé: ${componentName}`);
      return true;
    } catch (error) {
      console.error(`❌ Erreur preload ${componentName}:`, error);
      return false;
    }
  }

  // Charger un composant spécifique
  private async loadComponent(componentName: string): Promise<void> {
    const componentMap: Record<string, () => Promise<any>> = {
      'Dashboard': () => import('@/pages/Dashboard'),
      'Profile': () => import('@/pages/Profile'),
      'Messages': () => import('@/pages/Messages'),
      'Matching': () => import('@/pages/Matching'),
      'Feed': () => import('@/pages/feed'),
      'Settings': () => import('@/pages/Settings'),
      'AdminDashboard': () => import('@/pages/admin/dashboard'),
      'AdminUsers': () => import('@/pages/admin/users'),
      'AdminAnalytics': () => import('@/pages/admin/analytics'),
      'PremiumPage': () => import('@/pages/premium'),
      'PostCreator': () => import('@/components/feed/PostCreator'),
      'ImageUploader': () => import('@/components/ui/ImageUploader'),
      'VideoPlayer': () => import('@/components/video/VideoPlayer')
    };

    const loader = componentMap[componentName];
    if (!loader) {
      throw new Error(`Composant non trouvé: ${componentName}`);
    }

    await loader();
  }

  // Preload basé sur les patterns d'usage
  preloadByUsagePattern(currentPage: string, userRole: string = 'user'): void {
    const patterns: Record<string, string[]> = {
      'Dashboard': ['Profile', 'Messages', 'Matching', 'Feed'],
      'Profile': ['Settings', 'Messages', 'Dashboard'],
      'Messages': ['Profile', 'Dashboard', 'Matching'],
      'Matching': ['Profile', 'Messages', 'Dashboard'],
      'Feed': ['PostCreator', 'Profile', 'Messages'],
      'Settings': ['Profile', 'Dashboard'],
      'AdminDashboard': ['AdminUsers', 'AdminAnalytics'],
      'AdminUsers': ['AdminDashboard', 'AdminAnalytics']
    };

    const componentsToPreload = patterns[currentPage] || [];
    
    // Filtrer selon le rôle utilisateur
    const filteredComponents = componentsToPreload.filter(comp => {
      if (comp.startsWith('Admin') && userRole !== 'admin') {
        return false;
      }
      return true;
    });

    // Ajouter à la queue de preload
    filteredComponents.forEach(comp => {
      const strategy = this.preloadConfig[comp];
      if (strategy && !this.preloadedComponents.has(comp)) {
        this.preloadQueue.push({ name: comp, strategy });
      }
    });

    this.processPreloadQueue();
  }

  // Traiter la queue de preload
  private async processPreloadQueue(): Promise<void> {
    if (this.isProcessing || this.preloadQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    // Trier par priorité
    this.preloadQueue.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.strategy.priority] - priorityOrder[a.strategy.priority];
    });

    // Traiter les composants par batch
    const batchSize = 2;
    const batch = this.preloadQueue.splice(0, batchSize);

    await Promise.allSettled(
      batch.map(({ name }) => this.preloadComponent(name))
    );

    this.isProcessing = false;

    // Continuer avec le reste
    if (this.preloadQueue.length > 0) {
      setTimeout(() => this.processPreloadQueue(), 100);
    }
  }

  // Preload au hover
  setupHoverPreload(element: HTMLElement, componentName: string): void {
    let hoverTimeout: NodeJS.Timeout;

    element.addEventListener('mouseenter', () => {
      hoverTimeout = setTimeout(() => {
        this.preloadComponent(componentName);
      }, 200); // Délai de 200ms
    });

    element.addEventListener('mouseleave', () => {
      clearTimeout(hoverTimeout);
    });
  }

  // Preload au focus
  setupFocusPreload(element: HTMLElement, componentName: string): void {
    element.addEventListener('focus', () => {
      this.preloadComponent(componentName);
    });
  }

  // Preload en idle
  setupIdlePreload(): void {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        const idleComponents = Object.entries(this.preloadConfig)
          .filter(([_, strategy]) => strategy.trigger === 'idle')
          .map(([name, _]) => name);

        idleComponents.forEach(comp => {
          if (!this.preloadedComponents.has(comp)) {
            this.preloadComponent(comp);
          }
        });
      });
    }
  }

  // Obtenir les statistiques de preload
  getStats(): {
    preloadedCount: number;
    queueLength: number;
    preloadedComponents: string[];
  } {
    return {
      preloadedCount: this.preloadedComponents.size,
      queueLength: this.preloadQueue.length,
      preloadedComponents: Array.from(this.preloadedComponents)
    };
  }
}

export const intelligentPreloader = IntelligentPreloader.getInstance();

// Hook pour utiliser le preloader
export const useIntelligentPreload = () => {
  return {
    preloadComponent: (name: string) => intelligentPreloader.preloadComponent(name),
    preloadByUsagePattern: (currentPage: string, userRole?: string) => 
      intelligentPreloader.preloadByUsagePattern(currentPage, userRole),
    setupHoverPreload: (element: HTMLElement, componentName: string) => 
      intelligentPreloader.setupHoverPreload(element, componentName),
    setupFocusPreload: (element: HTMLElement, componentName: string) => 
      intelligentPreloader.setupFocusPreload(element, componentName),
    setupIdlePreload: () => intelligentPreloader.setupIdlePreload(),
    getStats: () => intelligentPreloader.getStats()
  };
};
