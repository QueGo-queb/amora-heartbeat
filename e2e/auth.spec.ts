import { test, expect } from '@playwright/test';

test.describe('Authentification', () => {
  test('Inscription complète utilisateur', async ({ page }) => {
    await page.goto('/');
    await page.click('[data-testid="signup-button"]');
    
    // Remplir formulaire
    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.fill('[data-testid="password"]', 'TestPassword123!');
    await page.fill('[data-testid="fullName"]', 'Test User');
    
    // Vérifier redirection
    await page.click('[data-testid="submit-signup"]');
    await expect(page).toHaveURL('/dashboard');
    
    // Vérifier éléments du dashboard
    await expect(page.locator('[data-testid="user-avatar"]')).toBeVisible();
  });

  test('Connexion et navigation', async ({ page }) => {
    await page.goto('/auth');
    await page.fill('[data-testid="login-email"]', 'test@example.com');
    await page.fill('[data-testid="login-password"]', 'TestPassword123!');
    await page.click('[data-testid="login-submit"]');
    
    await expect(page).toHaveURL('/dashboard');
  });
});
