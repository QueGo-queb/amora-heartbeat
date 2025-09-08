import { lazy } from 'react';

// Lazy loading avec error boundaries et retry
const createLazyComponent = (importFn: () => Promise<any>, name: string) => {
  return lazy(async () => {
    try {
      const module = await importFn();
      return module;
    } catch (error) {
      console.error(`❌ Erreur chargement ${name}:`, error);
      // Retry automatique après 1 seconde
      await new Promise(resolve => setTimeout(resolve, 1000));
      return importFn();
    }
  });
};

// Composants lazy avec retry automatique
export const LazyComponents = {
  // Pages principales
  Dashboard: createLazyComponent(() => import('@/pages/Dashboard'), 'Dashboard'),
  Profile: createLazyComponent(() => import('@/pages/Profile'), 'Profile'),
  Messages: createLazyComponent(() => import('@/pages/Messages'), 'Messages'),
  Matching: createLazyComponent(() => import('@/pages/Matching'), 'Matching'),
  
  // Admin (chargé seulement si admin)
  AdminDashboard: createLazyComponent(() => import('@/pages/admin/dashboard'), 'AdminDashboard'),
  AdminUsers: createLazyComponent(() => import('@/pages/admin/users'), 'AdminUsers'),
  AdminAnalytics: createLazyComponent(() => import('@/pages/admin/analytics'), 'AdminAnalytics'),
  
  // Premium
  PremiumPage: createLazyComponent(() => import('@/pages/premium'), 'Premium'),
  
  // Composants lourds
  // RichTextEditor: createLazyComponent(() => import('@/components/ui/rich-text-editor'), 'RichTextEditor'), 
  // ImageCropper: createLazyComponent(() => import('@/components/ui/image-cropper'), 'ImageCropper'),
};
