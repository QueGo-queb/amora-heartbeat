import { test as setup, expect } from '@playwright/test';
import path from 'path';

const authFile = path.join(__dirname, 'auth', 'user.json');

setup('authenticate', async ({ page }) => {
  console.log('🔐 Configuration authentification pour les tests...');
  
  // Aller à la page de connexion
  await page.goto('/auth');
  
  // Attendre que la page soit chargée
  await page.waitForLoadState('networkidle');
  
  // Connexion avec un compte de test (vous devrez créer ce compte en DB)
  await page.fill('[data-testid="login-email"]', 'test.e2e@amora.com');
  await page.fill('[data-testid="login-password"]', 'TestPassword123!');
  await page.click('[data-testid="login-submit"]');
  
  // Attendre la redirection vers le dashboard
  await page.waitForURL('/dashboard', { timeout: 10000 });
  
  // Vérifier que l'utilisateur est bien connecté
  await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
  
  // Sauvegarder l'état d'authentification
  await page.context().storageState({ path: authFile });
  
  console.log('✅ Authentification configurée avec succès');
});
