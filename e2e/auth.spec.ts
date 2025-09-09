import { test, expect } from '@playwright/test';

test.describe('Authentification complète', () => {
  test('Inscription nouvel utilisateur - Flux complet', async ({ page }) => {
    await page.goto('/');
    
    // Cliquer sur s'inscrire
    await page.click('[data-testid="signup-button"]');
    
    // Remplir le formulaire d'inscription étape par étape
    await page.fill('[data-testid="email"]', `test-${Date.now()}@example.com`);
    await page.fill('[data-testid="password"]', 'SecurePassword123!');
    await page.fill('[data-testid="confirm-password"]', 'SecurePassword123!');
    await page.fill('[data-testid="fullName"]', 'Jean Dupont');
    
    // Informations personnelles
    await page.selectOption('[data-testid="gender"]', 'homme');
    await page.selectOption('[data-testid="seeking-gender"]', 'femme');
    await page.fill('[data-testid="age"]', '28');
    await page.selectOption('[data-testid="country"]', 'France');
    await page.fill('[data-testid="city"]', 'Paris');
    
    // Bio et intérêts
    await page.fill('[data-testid="bio"]', 'Passionné de voyage et de cuisine');
    await page.click('[data-testid="interest-voyage"]');
    await page.click('[data-testid="interest-cuisine"]');
    await page.click('[data-testid="interest-sport"]');
    
    // Soumettre l'inscription
    await page.click('[data-testid="submit-signup"]');
    
    // Vérifier message de confirmation email
    await expect(page.locator('[data-testid="email-confirmation-message"]')).toBeVisible();
    await expect(page.locator('text=Vérifiez votre email')).toBeVisible();
  });

  test('Connexion utilisateur existant', async ({ page }) => {
    await page.goto('/auth');
    
    await page.fill('[data-testid="login-email"]', 'test@amora.com');
    await page.fill('[data-testid="login-password"]', 'TestPassword123!');
    await page.click('[data-testid="login-submit"]');
    
    // Vérifier redirection dashboard
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('[data-testid="user-avatar"]')).toBeVisible();
    await expect(page.locator('[data-testid="feed-container"]')).toBeVisible();
  });

  test('Gestion erreurs authentification', async ({ page }) => {
    await page.goto('/auth');
    
    // Test email invalide
    await page.fill('[data-testid="login-email"]', 'email-invalide');
    await page.fill('[data-testid="login-password"]', 'password');
    await page.click('[data-testid="login-submit"]');
    
    await expect(page.locator('[data-testid="email-error"]')).toContainText('Format d\'email invalide');
    
    // Test mot de passe incorrect
    await page.fill('[data-testid="login-email"]', 'test@amora.com');
    await page.fill('[data-testid="login-password"]', 'mauvais-password');
    await page.click('[data-testid="login-submit"]');
    
    await expect(page.locator('[data-testid="auth-error"]')).toContainText('Identifiants incorrects');
  });

  test('Déconnexion', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Ouvrir menu utilisateur
    await page.click('[data-testid="user-menu"]');
    await page.click('[data-testid="logout-button"]');
    
    // Vérifier redirection vers accueil
    await expect(page).toHaveURL('/');
    await expect(page.locator('[data-testid="signup-button"]')).toBeVisible();
  });
});
